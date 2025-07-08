'use server'

import sharp from 'sharp'

export async function convertToJPEG(dataUrl: string): Promise<Buffer> {
  // strip "data:mime/type;base64," when present
  const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl
  const buf    = Buffer.from(base64, 'base64')
  return sharp(buf).jpeg({ quality: 90 }).toBuffer()
}