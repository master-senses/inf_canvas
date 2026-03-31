# Make Real

AI-powered image generation app built on tldraw SDK + Next.js 14.

## Cursor Cloud specific instructions

### Services

Single Next.js app (frontend + API routes). No database, no Docker.

- **Dev server**: `pnpm run dev` (port 3000)
- **Lint**: `pnpm run lint`
- **Build**: `pnpm run build`

### Environment

- Requires **Node.js 20** (devcontainer spec). Use `nvm use 20` if needed.
- Package manager: **pnpm** (lockfile: `pnpm-lock.yaml`).
- After `pnpm install`, run `pnpm rebuild sharp` if sharp's postinstall was skipped by pnpm's build-script policy.

### API keys

The "Make Real" and "Style Transfer" features call external APIs. To test those features end-to-end, create `.env.local` with:

```
REPLICATE_API_TOKEN=...
FAL_KEY=...
COMFYICU_API_KEY=...
```

The dev server and canvas work fine without these keys; only the AI generation buttons require them.

### Key files

- `app/prompt.ts` — prompt sent to the AI model
- `app/lib/makeReal.tsx` — logic for the "Make Real" button
- `app/PreviewShape/PreviewShape.tsx` — custom tldraw shape for previews
- `app/api/generate-single-image/route.ts` — Replicate API route
- `app/api/style-transfer/route.ts` — fal.ai + comfy.icu API route
