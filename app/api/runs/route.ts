import { NextRequest, NextResponse } from 'next/server'
import { getUserImageGenerationRuns, getImageGenerationRun } from '../../lib/database'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')
        const runId = searchParams.get('runId')

        if (runId) {
            // Get a specific run
            const run = await getImageGenerationRun(runId)
            if (!run) {
                return NextResponse.json({ error: 'Run not found' }, { status: 404 })
            }
            return NextResponse.json({ run })
        } else if (userId) {
            // Get all runs for a user
            const runs = await getUserImageGenerationRuns(userId)
            return NextResponse.json({ runs })
        } else {
            return NextResponse.json({ error: 'Missing userId or runId parameter' }, { status: 400 })
        }
    } catch (error) {
        console.error('Error fetching runs:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// Example usage:
// GET /api/runs?userId=anonymous - Get all runs for anonymous user
// GET /api/runs?runId=run_123456 - Get specific run by ID