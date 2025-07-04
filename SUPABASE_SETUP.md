# Supabase Integration Setup Guide

This guide will help you set up Supabase integration to store your image generation runs in a database.

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new account or log in
2. Create a new project
3. Wait for the project to be set up (this may take a few minutes)

## 2. Set up the Database Schema

1. In your Supabase project dashboard, go to the **SQL Editor**
2. Copy the contents of `supabase_schema.sql` from this repository
3. Paste it into the SQL Editor and run it
4. This will create the `image_generation_runs` table with all necessary columns and indexes

## 3. Configure Environment Variables

1. Copy `.env.example` to `.env.local` in your project root:
   ```bash
   cp .env.example .env.local
   ```

2. In your Supabase project dashboard, go to **Settings > API**
3. Copy the following values to your `.env.local` file:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Public anon key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Your `.env.local` file should look like this:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Replicate API (for image generation)
REPLICATE_API_TOKEN=your-replicate-api-token
```

## 4. Database Schema Overview

The `image_generation_runs` table stores the following data:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `run_id` | TEXT | Unique identifier for each generation run |
| `sketch` | TEXT | Base64 data URL of the input sketch |
| `prompt` | TEXT | Extracted text from the selection |
| `similarity` | DECIMAL | Similarity value used for generation (0-1) |
| `moodboard_images` | TEXT[] | Array of moodboard image URLs/data |
| `outputs` | TEXT[] | Array of generated image URLs |
| `user_id` | TEXT | User identifier |
| `created_at` | TIMESTAMP | When the run was created |
| `updated_at` | TIMESTAMP | When the run was last updated |

## 5. Row Level Security (Optional)

The schema includes commented-out RLS (Row Level Security) policies. If you want to enable user-specific access:

1. Uncomment the RLS policies in `supabase_schema.sql`
2. Set up Supabase Auth in your application
3. Replace the hardcoded `userId = 'anonymous'` in `makeRealImages.ts` with actual user authentication

## 6. Usage

Once configured, the application will automatically:

1. **Create a database record** when you start an image generation process
2. **Store the input sketch** (as base64 data URL)
3. **Store the extracted prompt** text
4. **Store the similarity** parameter
5. **Update with generated outputs** when the images are ready

## 7. Querying Your Data

You can query your data using the provided utility functions:

```typescript
import { getUserImageGenerationRuns, getImageGenerationRun } from './app/lib/database'

// Get all runs for a user
const userRuns = await getUserImageGenerationRuns('user-id')

// Get a specific run
const run = await getImageGenerationRun('run_id')
```

## 8. Database Functions Available

- `createImageGenerationRun()` - Create a new run
- `updateImageGenerationRun()` - Update run with outputs
- `getImageGenerationRun()` - Get a specific run
- `getUserImageGenerationRuns()` - Get all runs for a user
- `deleteImageGenerationRun()` - Delete a run
- `generateRunId()` - Generate a unique run ID

## 9. Troubleshooting

### Common Issues:

1. **Environment variables not loaded**: Make sure your `.env.local` file is in the project root and restart your development server

2. **Database connection errors**: Verify your Supabase URL and anon key are correct

3. **Table doesn't exist**: Make sure you've run the SQL schema from `supabase_schema.sql`

4. **Permission errors**: If using RLS, make sure your policies are set up correctly

### Viewing Database Data:

1. Go to your Supabase project dashboard
2. Click on **Table Editor**
3. Select the `image_generation_runs` table
4. You'll see all your stored runs with their data

## 10. Next Steps

- **Add user authentication**: Replace anonymous user IDs with real user authentication
- **Implement moodboard functionality**: Add UI to select and store moodboard images
- **Add data visualization**: Create dashboards to view your generation history
- **Export functionality**: Add features to export your runs and images