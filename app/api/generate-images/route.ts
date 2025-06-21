import { NextRequest, NextResponse } from 'next/server'
import Replicate from "replicate"

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
})

export async function POST(request: NextRequest) {
    try {
        const { sketch, text, similarity } = await request.json()
        
        let predictions = []
        let image_data = []
        
        // Create 3 predictions
        for (let i = 0; i < 3; i++) {
            const pred_id = await realistic_Image(sketch, text, similarity)
            predictions.push(pred_id)
        }
        
        // Wait for all predictions to complete
        for (let i = 0; i < 3; i++) {
            let completed
            while (true) {
                const latest = await replicate.predictions.get(predictions[i])
                if (latest.status !== "starting" && latest.status !== "processing") {
                    completed = latest
                    break
                }
                await new Promise((resolve) => setTimeout(resolve, 500))
            }
            const return_image_url = String(completed?.output)
            image_data.push(return_image_url)
        }
        
        return NextResponse.json({ images: image_data })
    } catch (error) {
        console.error('Error generating images:', error)
        return NextResponse.json({ error: 'Failed to generate images' }, { status: 500 })
    }
}

async function realistic_Image(sketch: string, text: string, similarity: number) {
    const input = {
        image: sketch,
        strength: 2 - (similarity * 2),
        prompt: text + ", white background",
        n_prompt: "(deformed iris, deformed pupils, semi-realistic, anime:1.4), text, close up, cropped, out of frame, worst quality, low quality, jpeg artifacts, ugly, duplicate, morbid, mutilated, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, blurry, dehydrated, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck",
        steps: 35,
        max_width: 1024,
        max_height: 1024,
        guidance_scale: 10
    }

    const prediction = await replicate.predictions.create({
        version: "51778c7522eb99added82c0c52873d7a391eecf5fcc3ac7856613b7e6443f2f7",
        input
    })
    return prediction.id
} 