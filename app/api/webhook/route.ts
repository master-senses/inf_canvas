import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const data = await request.json()
        console.log('Received webhook data:', JSON.stringify(data, null, 2))

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Error handling webhook:', error)
        return NextResponse.json({ error: 'Failed to handle webhook' }, { status: 500 })
    }
}