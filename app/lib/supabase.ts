import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types
export interface ImageGenerationRun {
  id: string
  run_id: string
  sketch: string // base64 data URL
  prompt: string
  similarity: number
  moodboard_images: string[] // array of image URLs or base64 data
  outputs: string[] // array of generated image URLs
  user_id: string
  created_at: string
  updated_at: string
}

export type DatabaseTables = {
  image_generation_runs: ImageGenerationRun
}