import { ImagesPayload } from "./types"
// import { convertToJPEG } from "./utils"


/**
 * Client-side helper that calls the API route to generate realistic images.
 * Given a base64 data-url of the user's sketch, any extracted text and similarity,
 * this function makes a request to /api/generate-images and returns an array of 
 * image URLs.
 */
export async function generateSingleImage({ sketch }: ImagesPayload, text: string, similarity: number): Promise<string[]> {
    try {
        const response = await fetch('/api/generate-single-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sketch,
                text,
                similarity
            })
        })
        
        if (!response.ok) {
            throw new Error('Failed to generate images')
        }
        
        const data = await response.json()
        return data.images
    } catch (error) {
        // console.error('Error calling image generation API:', error)
        throw error
    }
}

export async function generateStyleTransfer({ sketch, moodboard }: ImagesPayload, text: string, similarity: number): Promise<string[]> {
    let files: Record<string, string> = {"/input/sketch.jpeg": sketch};

    if (moodboard) {
        const moodboardArray = Array.isArray(moodboard) ? moodboard : [moodboard];
        for (let i = 0; i < moodboardArray.length; i++) {
            files["/input/input_" + (i + 1) + ".jpeg"] = moodboardArray[i];
        }
    }
    
    try {
        console.log('[style-transfer] sending request, files:', Object.keys(files).length)
        const response = await fetch('/api/style-transfer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                files,
                text,
                similarity
            })
        })
        console.log('[style-transfer] response status:', response.status)
        if (!response.ok) {
            const errBody = await response.text()
            console.error('[style-transfer] error body:', errBody)
            throw new Error('Failed to generate images')
        }
        const data = await response.json()
        return data.images
    } catch (error) {
        console.error('[style-transfer] client error:', error)
        throw error
    }
}



