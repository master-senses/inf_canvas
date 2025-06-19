import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const imageUrl = searchParams.get('url')
        
        if (!imageUrl) {
            return NextResponse.json({ error: 'No URL provided' }, { status: 400 })
        }

        // Fetch the image from the external URL
        const response = await fetch(imageUrl)
        
        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch image' }, { status: response.status })
        }

        // Get the image data
        const imageBuffer = await response.arrayBuffer()
        const contentType = response.headers.get('content-type') || 'image/jpeg'

        // Return the image with proper CORS headers
        return new NextResponse(imageBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        })
    } catch (error) {
        console.error('Error proxying image:', error)
        return NextResponse.json({ error: 'Failed to proxy image' }, { status: 500 })
    }
} 