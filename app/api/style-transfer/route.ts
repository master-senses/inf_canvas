import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { fal } from '@fal-ai/client'
import { adjustLoadImages } from '@/app/lib/comfy'

export async function POST(request: NextRequest) {
    try {
        const key = process.env.FAL_KEY
        if (!key) return NextResponse.json({ error: 'Server missing FAL_KEY' }, { status: 500 })
        fal.config({ credentials: key })

        const { files, text, similarity } = await request.json()
        for (let fileKey in files) {
            const matches = files[fileKey].match(/^data:(image\/\w+);base64,(.+)$/);
            if (!matches) throw new Error('Invalid base64 image string');
            const buffer = Buffer.from(matches[2], 'base64');
            const jpegBuffer = await sharp(buffer).jpeg().toBuffer();
            const blob = new Blob([new Uint8Array(jpegBuffer)], { type: 'image/jpeg' })
            files[fileKey] = await fal.storage.upload(blob)
        }
        const fixed_prompt = adjustLoadImages(Object.keys(files).length, text)
        const run = await runWorkflow({ workflow_id: workflow_id, prompt: fixed_prompt, files: files });
        const finalStatus = await pollRunStatus(workflow_id, run.id);
        // console.log(`Final status: ${finalStatus.status}`)
        // console.log(`Output: ${JSON.stringify(finalStatus.output, null, 2)}`);
        return NextResponse.json({
            images: finalStatus.output.map((image: any) => image.url)
        })
    } catch (error) {
        // console.error('Error generating images:', error)
        return NextResponse.json({ error: 'Failed to generate images' }, { status: 500 })
    }
}

const workflow_id = "5ox-i_aoAdZB-_UxbeWFL"

async function runWorkflow(body: {workflow_id: string, prompt: any, files: Record<string, string>}){
    const url = "https://comfy.icu/api/v1/workflows/"+body.workflow_id+"/runs"
    const resp = await fetch(url, {
      "headers": {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": "Bearer " + process.env.COMFYICU_API_KEY
      },
      "body": JSON.stringify(body),
      "method": "POST"
    });
    return await resp.json()
}

async function getRunStatus(workflow_id: string, run_id: string) {
    const url =
        "https://comfy.icu/api/v1/workflows/" + workflow_id + "/runs/" + run_id;
    const resp = await fetch(url, {
        headers: {
            accept: "application/json",
            "content-type": "application/json",
            authorization: "Bearer " + process.env.COMFYICU_API_KEY,
        },
    });
    return await resp.json();
}

async function pollRunStatus(
    workflow_id: string,
    run_id: string,
    maxAttempts = 30,
    delay = 10000
) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            const status = await getRunStatus(workflow_id, run_id);
            // console.log(`Attempt ${attempt + 1}: Run status is ${status.status}`);

            if (status.status === "COMPLETED" || status.status === "ERROR") {
                return status;
            }

            await new Promise((resolve) => setTimeout(resolve, delay));
        } catch (error) {
            // console.error(`Error during polling: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }

    throw new Error("Max polling attempts reached");
}

