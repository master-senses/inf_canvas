import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { fal } from '@fal-ai/client'
import { adjustLoadImages } from '@/app/lib/comfy'

const FAL_APP_ID = process.env.FAL_APP_ID || 'YOUR_USERNAME/comfyui-style-transfer'

export async function POST(request: NextRequest) {
  try {
    const key = process.env.FAL_KEY
    if (!key) {
      console.error('FAL_KEY is not set')
      return NextResponse.json({ error: 'Server missing FAL_KEY' }, { status: 500 })
    }
    fal.config({ credentials: key })

    const { files, text } = (await request.json()) as {
      files: Record<string, string>
      text?: string
    }

    const uploadedFiles: Record<string, string> = {}
    for (const inputPath of Object.keys(files)) {
      const value = files[inputPath]
      const matches = value.match(/^data:(image\/\w+);base64,(.+)$/)
      if (!matches) throw new Error('Invalid base64 image string')
      const buffer = Buffer.from(matches[2], 'base64')
      const jpegBuffer = await sharp(buffer).jpeg({ quality: 90 }).toBuffer()
      const blob = new Blob([new Uint8Array(jpegBuffer)], { type: 'image/jpeg' })
      const url = await fal.storage.upload(blob)
      const filename = inputPath.split('/').pop() || 'input.jpeg'
      uploadedFiles[filename] = url
    }

    const workflow = adjustLoadImages(Object.keys(files).length, text ?? '')

    const result = await fal.subscribe(FAL_APP_ID, {
      input: {
        workflow,
        files: uploadedFiles,
      },
      logs: true,
      onQueueUpdate: (update: { status?: string; logs?: Array<{ message?: string }> }) => {
        if (update.status === 'IN_PROGRESS' && update.logs) {
          update.logs.map((log) => log.message).forEach((msg) => msg && console.log(msg))
        }
      },
    })

    const data = result.data as { images?: Array<{ url?: string }> }
    const images = Array.isArray(data?.images)
      ? (data.images.map((img) => img?.url).filter(Boolean) as string[])
      : []

    return NextResponse.json({ images })
  } catch (error: unknown) {
    const err = error as { status?: number; body?: unknown }
    console.error('Style transfer error:', err.status, JSON.stringify(err.body, null, 2))
    return NextResponse.json(
      { error: 'Failed to generate images', details: err.body },
      { status: 500 },
    )
  }
}
