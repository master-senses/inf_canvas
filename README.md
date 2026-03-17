# inf_canvas

Infinite canvas for style transfer using tldraw + ComfyUI on Fal.ai.

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set environment variables

Create a `.env` file in the project root:

```
FAL_KEY=your_fal_key_here
FAL_APP_ID=your_username/comfyui-style-transfer
```

Get your `FAL_KEY` from [fal.ai/dashboard/keys](https://fal.ai/dashboard/keys).

### 3. Deploy the Fal app (first time only)

Requires serverless access — request it at [fal.ai/dashboard/serverless-get-started](https://fal.ai/dashboard/serverless-get-started).

```bash
cd fal_app
uv venv .venv
uv pip install --python .venv/bin/python fal requests pydantic fastapi
FAL_KEY=your_fal_key_here .venv/bin/fal deploy comfyui_style_transfer.py::ComfyUIStyleTransfer --app-name comfyui-style-transfer
```

Copy the deployed app ID (e.g. `your_username/comfyui-style-transfer`) into `FAL_APP_ID` in `.env`.

### 4. Run the app

```bash
pnpm dev
```

Open [localhost:3000](http://localhost:3000).

## Usage

1. Draw or paste a sketch on the canvas.
2. Add moodboard images (up to 7) in a frame.
3. Draw an arrow from the frame to the sketch.
4. Select everything and click **Style Transfer**.
