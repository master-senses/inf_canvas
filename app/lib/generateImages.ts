/**
 * Client-side helper that calls the API route to generate realistic images.
 * Given a base64 data-url of the user's sketch, any extracted text and similarity,
 * this function makes a request to /api/generate-images and returns an array of 
 * image URLs.
 */
export async function generateSingleImage(sketch: string, text: string, similarity: number): Promise<string[]> {
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
        console.error('Error calling image generation API:', error)
        throw error
    }
}

export async function generateStyleTransfer(sketch: string, text: string, similarity: number): Promise<string[]> {
    try {
        const response = await fetch('/api/style-transfer', {
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
        console.error('Error calling image generation API:', error)
        throw error
    }
}



