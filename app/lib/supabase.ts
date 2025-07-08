import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

// Create Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export type bucketFolder = 'sketches' | 'output' | 'moodboard'

// Upload file using standard upload
export async function uploadToBucket(file: Buffer, type: bucketFolder, moodboard_folder: string) {
    let path: string
    if (type === 'moodboard') {
        path = `${type}/${moodboard_folder}/${uuidv4()}.jpeg`
    } else {
        path = `${type}/${uuidv4()}.jpeg`
    }
    const { data, error } = await supabase.storage.from('images').upload(path, file, {
        contentType: 'image/jpeg'
    })
    if (error) {
    return {data: null, error: error.message}
    } else {
    return {data: process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/images/" + data.path, error: null}
    }
}