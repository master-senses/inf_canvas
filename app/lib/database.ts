import { supabase, ImageGenerationRun } from './supabase'

export interface CreateImageGenerationRunParams {
  runId: string
  sketch: string
  prompt: string
  similarity: number
  moodboardImages?: string[]
  outputs?: string[]
  userId: string
}

export interface UpdateImageGenerationRunParams {
  runId: string
  outputs?: string[]
  moodboardImages?: string[]
}

/**
 * Create a new image generation run record
 */
export async function createImageGenerationRun(params: CreateImageGenerationRunParams): Promise<ImageGenerationRun | null> {
  try {
    const { data, error } = await supabase
      .from('image_generation_runs')
      .insert({
        run_id: params.runId,
        sketch: params.sketch,
        prompt: params.prompt,
        similarity: params.similarity,
        moodboard_images: params.moodboardImages || [],
        outputs: params.outputs || [],
        user_id: params.userId,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating image generation run:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error creating image generation run:', error)
    return null
  }
}

/**
 * Update an existing image generation run with outputs
 */
export async function updateImageGenerationRun(params: UpdateImageGenerationRunParams): Promise<ImageGenerationRun | null> {
  try {
    const updateData: any = {}
    
    if (params.outputs) {
      updateData.outputs = params.outputs
    }
    
    if (params.moodboardImages) {
      updateData.moodboard_images = params.moodboardImages
    }

    const { data, error } = await supabase
      .from('image_generation_runs')
      .update(updateData)
      .eq('run_id', params.runId)
      .select()
      .single()

    if (error) {
      console.error('Error updating image generation run:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error updating image generation run:', error)
    return null
  }
}

/**
 * Get an image generation run by run_id
 */
export async function getImageGenerationRun(runId: string): Promise<ImageGenerationRun | null> {
  try {
    const { data, error } = await supabase
      .from('image_generation_runs')
      .select('*')
      .eq('run_id', runId)
      .single()

    if (error) {
      console.error('Error getting image generation run:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error getting image generation run:', error)
    return null
  }
}

/**
 * Get all image generation runs for a user
 */
export async function getUserImageGenerationRuns(userId: string): Promise<ImageGenerationRun[]> {
  try {
    const { data, error } = await supabase
      .from('image_generation_runs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error getting user image generation runs:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error getting user image generation runs:', error)
    return []
  }
}

/**
 * Delete an image generation run
 */
export async function deleteImageGenerationRun(runId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('image_generation_runs')
      .delete()
      .eq('run_id', runId)

    if (error) {
      console.error('Error deleting image generation run:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting image generation run:', error)
    return false
  }
}

/**
 * Generate a unique run ID
 */
export function generateRunId(): string {
  return `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}