-- Create the image_generation_runs table
CREATE TABLE IF NOT EXISTS image_generation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id TEXT NOT NULL UNIQUE,
    sketch TEXT NOT NULL, -- base64 data URL of the sketch
    prompt TEXT NOT NULL, -- extracted text from the selection
    similarity DECIMAL(3,2) NOT NULL DEFAULT 0.4, -- similarity value between 0 and 1
    moodboard_images TEXT[] DEFAULT '{}', -- array of image URLs or base64 data
    outputs TEXT[] DEFAULT '{}', -- array of generated image URLs
    user_id TEXT NOT NULL, -- user identifier
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_image_generation_runs_run_id ON image_generation_runs(run_id);
CREATE INDEX IF NOT EXISTS idx_image_generation_runs_user_id ON image_generation_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_image_generation_runs_created_at ON image_generation_runs(created_at);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at when a row is modified
CREATE TRIGGER update_image_generation_runs_updated_at
    BEFORE UPDATE ON image_generation_runs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Optional: Create Row Level Security (RLS) policies if needed
-- ALTER TABLE image_generation_runs ENABLE ROW LEVEL SECURITY;

-- Example RLS policy: Users can only see their own runs
-- CREATE POLICY "Users can view their own runs" ON image_generation_runs
--     FOR SELECT USING (user_id = auth.uid()::TEXT);

-- CREATE POLICY "Users can insert their own runs" ON image_generation_runs
--     FOR INSERT WITH CHECK (user_id = auth.uid()::TEXT);

-- CREATE POLICY "Users can update their own runs" ON image_generation_runs
--     FOR UPDATE USING (user_id = auth.uid()::TEXT);