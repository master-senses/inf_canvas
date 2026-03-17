import json
import subprocess
import time
from pathlib import Path
from typing import Dict, List, Optional

import fal
import requests
from fal.container import ContainerImage
from fal.toolkit import File, Image, download_model_weights
from fastapi import Request
from pydantic import BaseModel, Field


WORKFLOW_PATH = Path(__file__).parent / "workflow.json"
WORKFLOW_URL = File.from_path(str(WORKFLOW_PATH), repository="cdn").url

MODELS = {
    "checkpoints/realisticVisionV60B1_v51VAE.safetensors":
        "https://huggingface.co/SG161222/Realistic_Vision_V6.0_B1_noVAE/resolve/main/realisticVisionV60B1_v51VAE.safetensors",
    "controlnet/control_v11p_sd15_lineart_fp16.safetensors":
        "https://huggingface.co/comfyanonymous/ControlNet-v1-1_fp16_safetensors/resolve/main/control_v11p_sd15_lineart_fp16.safetensors",
    "ipadapter/ip-adapter_sd15.safetensors":
        "https://huggingface.co/h94/IP-Adapter/resolve/main/models/ip-adapter_sd15.safetensors",
    "clip_vision/CLIP-ViT-H-14-laion2B-s32B-b79K.safetensors":
        "https://huggingface.co/h94/IP-Adapter/resolve/main/models/image_encoder/model.safetensors",
}

DOCKERFILE_STR = f"""
FROM falai/base:3.11-12.1.0

USER root

RUN apt-get update && apt-get install -y --no-install-recommends \\
    git wget libgl1-mesa-glx libglib2.0-0 && rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/comfyanonymous/ComfyUI /app/ComfyUI
WORKDIR /app/ComfyUI
RUN pip install --no-cache-dir -r requirements.txt
RUN mkdir -p models/checkpoints models/controlnet models/ipadapter models/clip_vision

# Custom nodes
RUN cd custom_nodes && \\
    git clone https://github.com/cubiq/ComfyUI_IPAdapter_plus && \\
    git clone https://github.com/Fannovel16/comfyui_controlnet_aux && \\
    pip install --no-cache-dir -r comfyui_controlnet_aux/requirements.txt

ADD {WORKFLOW_URL} /app/workflow.json

RUN pip install --no-cache-dir boto3==1.35.74 protobuf==4.25.1 pydantic==2.10.6
"""


class StyleTransferRequest(BaseModel):
    workflow: Dict = Field(description="The full ComfyUI workflow JSON (API format)")
    files: Dict[str, str] = Field(
        description="Mapping of filename (e.g. 'sketch.jpeg') to image URL"
    )


class StyleTransferResponse(BaseModel):
    images: List[Image] = Field(description="Generated output images")


class ComfyUIStyleTransfer(fal.App, keep_alive=300, max_concurrency=1):
    machine_type = "GPU-A100"
    image = ContainerImage.from_dockerfile_str(DOCKERFILE_STR)

    COMFYUI_HOST = "127.0.0.1"
    COMFYUI_PORT = 8188
    COMFYUI_DIR = Path("/app/ComfyUI")

    def setup(self):
        self.process = None
        self._download_models()
        self._link_models()

        self.process = subprocess.Popen(
            ["python", "main.py", "--listen", self.COMFYUI_HOST, "--port", str(self.COMFYUI_PORT)],
            cwd=str(self.COMFYUI_DIR),
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
        )
        self._wait_for_server(timeout=180)

    def _download_models(self):
        self._downloaded_paths = {}
        for model_path, url in MODELS.items():
            downloaded_path = download_model_weights(url)
            self._downloaded_paths[model_path] = downloaded_path

    def _link_models(self):
        for model_path in MODELS:
            downloaded_path = self._downloaded_paths[model_path]
            comfy_path = self.COMFYUI_DIR / "models" / model_path
            comfy_path.parent.mkdir(parents=True, exist_ok=True)
            if comfy_path.exists() or comfy_path.is_symlink():
                comfy_path.unlink()
            comfy_path.symlink_to(downloaded_path)

    def _wait_for_server(self, timeout: int = 180):
        start = time.time()
        while time.time() - start < timeout:
            try:
                resp = requests.get(
                    f"http://{self.COMFYUI_HOST}:{self.COMFYUI_PORT}/system_stats",
                    timeout=5,
                )
                if resp.status_code == 200:
                    return
            except requests.ConnectionError:
                pass
            time.sleep(1)
        raise TimeoutError("ComfyUI server did not start")

    def _upload_images(self, files: Dict[str, str]):
        """Download images from URLs and upload to ComfyUI's input directory."""
        for filename, url in files.items():
            img_data = requests.get(url, timeout=30).content
            dest = self.COMFYUI_DIR / "input" / filename
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(img_data)

    def _queue_prompt(self, prompt: dict) -> str:
        resp = requests.post(
            f"http://{self.COMFYUI_HOST}:{self.COMFYUI_PORT}/prompt",
            json={"prompt": prompt},
            timeout=30,
        )
        resp.raise_for_status()
        return resp.json()["prompt_id"]

    def _poll_for_completion(self, prompt_id: str, timeout: int = 180) -> dict:
        start = time.time()
        while time.time() - start < timeout:
            resp = requests.get(
                f"http://{self.COMFYUI_HOST}:{self.COMFYUI_PORT}/history/{prompt_id}",
                timeout=30,
            )
            resp.raise_for_status()
            history = resp.json()
            if prompt_id in history:
                prompt_history = history[prompt_id]
                if prompt_history.get("status", {}).get("completed", False):
                    return prompt_history
            time.sleep(1)
        raise TimeoutError("Generation did not complete")

    def _collect_output_images(self, history: dict, request: Request) -> List[Image]:
        images = []
        for node_output in history.get("outputs", {}).values():
            if "images" not in node_output:
                continue
            for img_info in node_output["images"]:
                if img_info.get("type") == "temp":
                    continue
                filename = img_info.get("filename")
                subfolder = img_info.get("subfolder", "")
                if filename:
                    path = self.COMFYUI_DIR / "output"
                    if subfolder:
                        path = path / subfolder
                    path = path / filename
                    if path.exists():
                        images.append(Image.from_path(str(path), request=request))
        return images

    @fal.endpoint("/")
    def generate(self, input: StyleTransferRequest, request: Request) -> StyleTransferResponse:
        self._upload_images(input.files)
        prompt_id = self._queue_prompt(input.workflow)
        history = self._poll_for_completion(prompt_id)
        images = self._collect_output_images(history, request)
        if not images:
            raise RuntimeError("No output images generated")
        return StyleTransferResponse(images=images)
