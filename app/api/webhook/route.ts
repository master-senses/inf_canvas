import { NextRequest, NextResponse } from 'next/server'

// Import the pending runs map from the style-transfer route
let pendingRuns: Map<string, {
    resolve: (images: string[]) => void,
    reject: (error: Error) => void,
    timeout: ReturnType<typeof setTimeout>
}> | null = null

// Dynamic import to get the pending runs map
async function getPendingRuns() {
    if (!pendingRuns) {
        try {
            const styleTransferModule = await import('../style-transfer/route')
            pendingRuns = styleTransferModule.pendingRuns
        } catch (error) {
            console.error('Failed to import pending runs:', error)
        }
    }
    return pendingRuns
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json()
        console.log('Received webhook data:', JSON.stringify(data, null, 2))

        // Check if this is a ComfyICU webhook
        if (data.id && data.status) {
            const runId = data.id
            const status = data.status

            console.log(`Webhook: Run ${runId} status: ${status}`)

            // Get the pending runs map
            const runs = await getPendingRuns()
            
            if (runs && runs.has(runId)) {
                const pendingRun = runs.get(runId)!
                
                if (status === 'COMPLETED') {
                    console.log('Run completed, extracting images...')
                    
                    // Extract image URLs from the completed run
                    let imageUrls: string[] = []
                    
                    if (data.output_files && Array.isArray(data.output_files)) {
                        imageUrls = data.output_files.map((file: any) => file.url).filter(Boolean)
                    }
                    
                    console.log('Extracted image URLs:', imageUrls)
                    
                    if (imageUrls.length > 0) {
                        // Clear timeout and resolve the promise
                        clearTimeout(pendingRun.timeout)
                        runs.delete(runId)
                        pendingRun.resolve(imageUrls)
                    } else {
                        // No images found, reject
                        clearTimeout(pendingRun.timeout)
                        runs.delete(runId)
                        pendingRun.reject(new Error('No output images found in completed run'))
                    }
                } else if (status === 'ERROR' || status === 'FAILED') {
                    console.log('Run failed:', data.error || 'Unknown error')
                    
                    // Clear timeout and reject the promise
                    clearTimeout(pendingRun.timeout)
                    runs.delete(runId)
                    pendingRun.reject(new Error(data.error || 'ComfyICU run failed'))
                }
                // For other statuses (RUNNING, QUEUED, etc.), do nothing and wait
            } else {
                console.log(`No pending run found for ID: ${runId}`)
            }
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Error handling webhook:', error)
        return NextResponse.json({ error: 'Failed to handle webhook' }, { status: 500 })
    }
}