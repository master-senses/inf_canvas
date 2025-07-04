# ComfyICU Integration Setup

This project now integrates with ComfyICU API for style transfer functionality.

## Setup

1. **Get your ComfyICU API key**:
   - Go to [ComfyICU](https://comfy.icu/)
   - Create an account and get your API key from account settings

2. **Set the environment variable**:
   ```bash
   export COMFYICU_API_KEY="your_actual_api_key_here"
   ```

   Or update the `.env.local` file:
   ```
   COMFYICU_API_KEY=your_actual_api_key_here
   ```

3. **How it works**:
   - When you select an image in the tldraw canvas and click the style transfer button
   - The app sends your sketch + any text annotations to ComfyICU
   - ComfyICU processes the image using the predefined workflow
   - Results are returned via webhook and displayed as 3 new images

## Workflow Details

- **Workflow ID**: `kUROkD8n6_dsFdlGn8EfO`
- **Input**: Your sketch replaces `sketch_input.jpg` in the workflow
- **Output**: 3 style-transferred images using IPAdapter with multiple reference images
- **Style references**: The workflow uses pre-loaded style images (cyberpunk themes, portraits, etc.)

## Error Handling

- The integration includes both webhook and polling fallbacks
- Timeout after 5 minutes if no response
- Detailed error logging for debugging

## Development

The main integration files:
- `/app/api/style-transfer/route.ts` - ComfyICU API integration
- `/app/api/webhook/route.ts` - Webhook handler for results
- `/app/lib/generateImages.ts` - Client-side API calls