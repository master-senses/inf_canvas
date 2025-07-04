import { NextRequest, NextResponse } from 'next/server'

declare const process: {
    env: { [key: string]: string | undefined }
}

const workflow_id = "kUROkD8n6_dsFdlGn8EfO"

// Store pending runs in memory (in production, use a database)
const pendingRuns = new Map<string, {
    resolve: (images: string[]) => void,
    reject: (error: Error) => void,
    timeout: ReturnType<typeof setTimeout>
}>()

// Workflow JSON in API Format
const getPrompt = (textPrompt: string) => ({
    "3": {
        "_meta": { "title": "KSampler" },
        "inputs": {
            "cfg": 6.5,
            "seed": 0,
            "model": ["50", 0],
            "steps": 30,
            "denoise": 1,
            "negative": ["45", 1],
            "positive": ["45", 0],
            "scheduler": "karras",
            "latent_image": ["5", 0],
            "sampler_name": "dpmpp_2m"
        },
        "class_type": "KSampler"
    },
    "5": {
        "_meta": { "title": "Empty Latent Image" },
        "inputs": { "width": 1024, "height": 1024, "batch_size": 3 },
        "class_type": "EmptyLatentImage"
    },
    "6": {
        "_meta": { "title": "CLIP Text Encode (Prompt)" },
        "inputs": {
            "clip": ["53", 1],
            "text": textPrompt || "helmet with red and blue tones\n\nhigh quality, detailed"
        },
        "class_type": "CLIPTextEncode"
    },
    "7": {
        "_meta": { "title": "CLIP Text Encode (Prompt)" },
        "inputs": {
            "clip": ["53", 1],
            "text": "blurry, noisy, messy, lowres, jpeg, artifacts, ill, distorted, malformed"
        },
        "class_type": "CLIPTextEncode"
    },
    "8": {
        "_meta": { "title": "VAE Decode" },
        "inputs": { "vae": ["53", 2], "samples": ["3", 0] },
        "class_type": "VAEDecode"
    },
    "9": {
        "_meta": { "title": "Save Image" },
        "inputs": { "images": ["8", 0], "filename_prefix": "IPAdapter" },
        "class_type": "SaveImage"
    },
    "12": {
        "_meta": { "title": "Load Image" },
        "inputs": { "image": "sketch_input.jpg", "upload": "image" },
        "class_type": "LoadImage"
    },
    "16": {
        "_meta": { "title": "Load Image" },
        "inputs": { "image": "cyber_girl.png", "upload": "image" },
        "class_type": "LoadImage"
    },
    "17": {
        "_meta": { "title": "Load Image" },
        "inputs": { "image": "cyberpunk_car - Copy (2).png", "upload": "image" },
        "class_type": "LoadImage"
    },
    "18": {
        "_meta": { "title": "Load Image" },
        "inputs": { "image": "tree.png", "upload": "image" },
        "class_type": "LoadImage"
    },
    "21": {
        "_meta": { "title": "Load Image" },
        "inputs": { "image": "robot_headshot.png", "upload": "image" },
        "class_type": "LoadImage"
    },
    "22": {
        "_meta": { "title": "Load Image" },
        "inputs": { "image": "shape_qxhsOIOXY5hQ7ICx0v67c at 25-06-23 16.26.46.png", "upload": "image" },
        "class_type": "LoadImage"
    },
    "23": {
        "_meta": { "title": "Load Image" },
        "inputs": { "image": "dubai - Copy (2).png", "upload": "image" },
        "class_type": "LoadImage"
    },
    "24": {
        "_meta": { "title": "Load Image" },
        "inputs": { "image": "cyberpunk_sword - Copy (2).png", "upload": "image" },
        "class_type": "LoadImage"
    },
    "25": {
        "_meta": { "title": "Load Image" },
        "inputs": { "image": "red_glasses.png", "upload": "image" },
        "class_type": "LoadImage"
    },
    "27": {
        "_meta": { "title": "Batch Images" },
        "inputs": { "image1": ["39", 0], "image2": ["38", 0] },
        "class_type": "ImageBatch"
    },
    "28": {
        "_meta": { "title": "Batch Images" },
        "inputs": { "image1": ["43", 0], "image2": ["42", 0] },
        "class_type": "ImageBatch"
    },
    "29": {
        "_meta": { "title": "Batch Images" },
        "inputs": { "image1": ["37", 0], "image2": ["41", 0] },
        "class_type": "ImageBatch"
    },
    "30": {
        "_meta": { "title": "Batch Images" },
        "inputs": { "image1": ["35", 0], "image2": ["36", 0] },
        "class_type": "ImageBatch"
    },
    "31": {
        "_meta": { "title": "Batch Images" },
        "inputs": { "image1": ["32", 0], "image2": ["28", 0] },
        "class_type": "ImageBatch"
    },
    "32": {
        "_meta": { "title": "Batch Images" },
        "inputs": { "image1": ["33", 0], "image2": ["29", 0] },
        "class_type": "ImageBatch"
    },
    "33": {
        "_meta": { "title": "Batch Images" },
        "inputs": { "image1": ["27", 0], "image2": ["30", 0] },
        "class_type": "ImageBatch"
    },
    "34": {
        "_meta": { "title": "Preview Image" },
        "inputs": { "images": ["31", 0] },
        "class_type": "PreviewImage"
    },
    "35": {
        "_meta": { "title": "Prep Image For ClipVision" },
        "inputs": { "image": ["17", 0], "sharpening": 0, "crop_position": "top", "interpolation": "LANCZOS" },
        "class_type": "PrepImageForClipVision"
    },
    "36": {
        "_meta": { "title": "Prep Image For ClipVision" },
        "inputs": { "image": ["16", 0], "sharpening": 0, "crop_position": "top", "interpolation": "LANCZOS" },
        "class_type": "PrepImageForClipVision"
    },
    "37": {
        "_meta": { "title": "Prep Image For ClipVision" },
        "inputs": { "image": ["22", 0], "sharpening": 0, "crop_position": "top", "interpolation": "LANCZOS" },
        "class_type": "PrepImageForClipVision"
    },
    "38": {
        "_meta": { "title": "Prep Image For ClipVision" },
        "inputs": { "image": ["25", 0], "sharpening": 0, "crop_position": "top", "interpolation": "LANCZOS" },
        "class_type": "PrepImageForClipVision"
    },
    "39": {
        "_meta": { "title": "Prep Image For ClipVision" },
        "inputs": { "image": ["23", 0], "sharpening": 0, "crop_position": "top", "interpolation": "LANCZOS" },
        "class_type": "PrepImageForClipVision"
    },
    "40": {
        "_meta": { "title": "Prep Image For ClipVision" },
        "inputs": { "sharpening": 0, "crop_position": "top", "interpolation": "LANCZOS" },
        "class_type": "PrepImageForClipVision"
    },
    "41": {
        "_meta": { "title": "Prep Image For ClipVision" },
        "inputs": { "image": ["24", 0], "sharpening": 0, "crop_position": "top", "interpolation": "LANCZOS" },
        "class_type": "PrepImageForClipVision"
    },
    "42": {
        "_meta": { "title": "Prep Image For ClipVision" },
        "inputs": { "image": ["21", 0], "sharpening": 0, "crop_position": "top", "interpolation": "LANCZOS" },
        "class_type": "PrepImageForClipVision"
    },
    "43": {
        "_meta": { "title": "Prep Image For ClipVision" },
        "inputs": { "image": ["18", 0], "sharpening": 0, "crop_position": "top", "interpolation": "LANCZOS" },
        "class_type": "PrepImageForClipVision"
    },
    "44": {
        "_meta": { "title": "Load ControlNet Model" },
        "inputs": { "control_net_name": "control_v11p_sd15_lineart_fp16.safetensors" },
        "class_type": "ControlNetLoader"
    },
    "45": {
        "_meta": { "title": "Apply ControlNet" },
        "inputs": {
            "image": ["54", 0],
            "negative": ["7", 0],
            "positive": ["6", 0],
            "strength": 1,
            "control_net": ["44", 0],
            "end_percent": 1,
            "start_percent": 0
        },
        "class_type": "ControlNetApplyAdvanced"
    },
    "50": {
        "_meta": { "title": "IPAdapter Advanced" },
        "inputs": {
            "image": ["31", 0],
            "model": ["53", 0],
            "end_at": 1,
            "weight": 1,
            "start_at": 0,
            "ipadapter": ["51", 0],
            "clip_vision": ["52", 0],
            "weight_type": "linear",
            "combine_embeds": "concat",
            "embeds_scaling": "V only"
        },
        "class_type": "IPAdapterAdvanced"
    },
    "51": {
        "_meta": { "title": "IPAdapter Model Loader" },
        "inputs": { "ipadapter_file": "ip-adapter_sd15.safetensors" },
        "class_type": "IPAdapterModelLoader"
    },
    "52": {
        "_meta": { "title": "Load CLIP Vision" },
        "inputs": { "clip_name": "CLIP-ViT-H-14-laion2B-s32B-b79K.safetensors" },
        "class_type": "CLIPVisionLoader"
    },
    "53": {
        "_meta": { "title": "Load Checkpoint" },
        "inputs": { "ckpt_name": "realisticVisionV60B1_v51VAE.safetensors" },
        "class_type": "CheckpointLoaderSimple"
    },
    "54": {
        "_meta": { "title": "Realistic Lineart" },
        "inputs": { "image": ["12", 0], "coarse": "disable", "resolution": 512 },
        "class_type": "LineArtPreprocessor"
    }
})

// Base input files
const getFiles = (sketchDataUrl: string) => ({
    "/input/sketch_input.jpg": sketchDataUrl,
    "/input/cyber_girl.png": "https://comfy.icu/api/v1/view/workflows/kUROkD8n6_dsFdlGn8EfO/input/cyber_girl.png",
    "/input/cyberpunk_car - Copy (2).png": "https://comfy.icu/api/v1/view/workflows/kUROkD8n6_dsFdlGn8EfO/input/cyberpunk_car - Copy (2).png",
    "/input/tree.png": "https://comfy.icu/api/v1/view/workflows/kUROkD8n6_dsFdlGn8EfO/input/tree.png",
    "/input/robot_headshot.png": "https://comfy.icu/api/v1/view/workflows/kUROkD8n6_dsFdlGn8EfO/input/robot_headshot.png",
    "/input/shape_qxhsOIOXY5hQ7ICx0v67c at 25-06-23 16.26.46.png": "https://comfy.icu/api/v1/view/workflows/kUROkD8n6_dsFdlGn8EfO/input/shape_qxhsOIOXY5hQ7ICx0v67c at 25-06-23 16.26.46.png",
    "/input/dubai - Copy (2).png": "https://comfy.icu/api/v1/view/workflows/kUROkD8n6_dsFdlGn8EfO/input/dubai - Copy (2).png",
    "/input/cyberpunk_sword - Copy (2).png": "https://comfy.icu/api/v1/view/workflows/kUROkD8n6_dsFdlGn8EfO/input/cyberpunk_sword - Copy (2).png",
    "/input/red_glasses.png": "https://comfy.icu/api/v1/view/workflows/kUROkD8n6_dsFdlGn8EfO/input/red_glasses.png"
})

async function runWorkflow(body: { workflow_id: string, prompt: any, files: any, webhook?: string }) {
    const url = `https://comfy.icu/api/v1/workflows/${body.workflow_id}/runs`
    const resp = await fetch(url, {
        headers: {
            "accept": "application/json",
            "content-type": "application/json",
            "authorization": "Bearer " + (process.env.COMFYICU_API_KEY || '')
        },
        body: JSON.stringify(body),
        method: "POST"
    })

    if (!resp.ok) {
        throw new Error(`ComfyICU API error: ${resp.status} ${resp.statusText}`)
    }

    return await resp.json()
}

async function getRunStatus(workflow_id: string, run_id: string) {
    const url = `https://comfy.icu/api/v1/workflows/${workflow_id}/runs/${run_id}`
    const resp = await fetch(url, {
        headers: {
            "accept": "application/json",
            "content-type": "application/json",
            "authorization": "Bearer " + (process.env.COMFYICU_API_KEY || '')
        }
    })
    return await resp.json()
}

async function pollRunStatus(workflow_id: string, run_id: string, maxAttempts = 30, delay = 10000): Promise<any> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            const status = await getRunStatus(workflow_id, run_id)
            console.log(`Attempt ${attempt + 1}: Run status is ${status.status}`)

            if (status.status === "COMPLETED") {
                return status
            } else if (status.status === "ERROR") {
                throw new Error(`ComfyICU run failed: ${status.error || 'Unknown error'}`)
            }

            await new Promise((resolve) => setTimeout(resolve, delay))
        } catch (error) {
            console.error(`Error during polling: ${error}`)
            if (attempt === maxAttempts - 1) throw error
        }
    }

    throw new Error("Max polling attempts reached")
}

export async function POST(request: NextRequest) {
    try {
        const { sketch, text, similarity } = await request.json()
        
        if (!sketch) {
            return NextResponse.json({ error: 'Sketch data is required' }, { status: 400 })
        }

        console.log('Starting ComfyICU workflow with text:', text)

        // Get the webhook URL for this deployment
        const baseUrl = request.headers.get('host')
        const protocol = request.headers.get('x-forwarded-proto') || 'http'
        const webhook = `${protocol}://${baseUrl}/api/webhook`

        // Prepare the workflow
        const prompt = getPrompt(text)
        const files = getFiles(sketch)

        // Run the workflow
        const run = await runWorkflow({ 
            workflow_id, 
            prompt, 
            files,
            webhook 
        })

        console.log('Started ComfyICU run:', run.id)

        // Create a promise that will be resolved when webhook receives the result
        const resultPromise = new Promise<string[]>((resolve, reject) => {
            const timeout = setTimeout(() => {
                pendingRuns.delete(run.id)
                reject(new Error('Workflow timeout'))
            }, 300000) // 5 minute timeout

            pendingRuns.set(run.id, { resolve, reject, timeout })
        })

        // Start polling as a fallback
        const pollPromise = pollRunStatus(workflow_id, run.id).then(status => {
            if (status.output_files && status.output_files.length > 0) {
                return status.output_files.map((file: any) => file.url)
            } else {
                throw new Error('No output files in completed run')
            }
        })

        // Race between webhook and polling
        try {
            const images = await Promise.race([resultPromise, pollPromise])
            
            // Clean up
            const pending = pendingRuns.get(run.id)
            if (pending) {
                clearTimeout(pending.timeout)
                pendingRuns.delete(run.id)
            }

            return NextResponse.json({ images })
        } catch (error) {
            // Clean up on error
            const pending = pendingRuns.get(run.id)
            if (pending) {
                clearTimeout(pending.timeout)
                pendingRuns.delete(run.id)
            }
            throw error
        }

    } catch (error) {
        console.error('Error in style transfer:', error)
        return NextResponse.json({ 
            error: error instanceof Error ? error.message : 'Failed to generate images' 
        }, { status: 500 })
    }
}

// Export the pending runs map so the webhook can access it
export { pendingRuns }

