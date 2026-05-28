# Barber AI Mockups

A Next.js web app for barbers. Upload a client photo, pick a hairstyle length
(**short**, **medium**, or **long**), and get a 3×3 grid of AI-generated
mockups of that client wearing nine different cuts.

Image edits are powered by [Google Gemini 2.5 Flash Image](https://ai.google.dev/gemini-api/docs/image-generation)
(a.k.a. "Nano Banana"), which is specifically tuned to preserve a subject's
identity (face, skin tone, lighting) while editing other parts of the image.

## Quick start

```bash
npm install
cp .env.local.example .env.local
# paste your Gemini API key into .env.local
npm run dev
```

Open <http://localhost:3000>.

## Getting a Gemini API key

1. Go to <https://aistudio.google.com/app/apikey> and sign in with a Google account.
2. Click **Create API key** and copy the value.
3. Image generation on `gemini-2.5-flash-image` is a billed feature — make sure
   the Google Cloud project tied to the key is on the paid tier, otherwise
   every call will fail with a quota / billing error.
4. Paste the key into `.env.local`:

   ```
   GEMINI_API_KEY=AIza...
   ```

5. Restart `npm run dev` after editing the env file.

## How it works

- **`app/page.tsx`** — single-page UI: length selector → photo upload → grid.
- **`lib/hairstyles.ts`** — nine hairstyles per length, each with a prompt-ready description.
- **`lib/gemini.ts`** — thin wrapper around `@google/genai` that sends the
  uploaded image + a per-style prompt to `gemini-2.5-flash-image` and pulls
  the generated image out of the response.
- **`app/api/generate/route.ts`** — accepts the upload + length, fans out
  nine parallel calls to the model, returns all nine results in one response.
- **`app/api/generate/single/route.ts`** — used by the per-cell **Retry**
  button when one of the nine fails.

The prompt template (see `buildPrompt` in `lib/hairstyles.ts`) explicitly
asks the model to keep the face, skin tone, expression, pose, lighting,
background, and clothing identical and only change the hair.

## Tips for best results

- Use a clear front-facing photo with even lighting.
- Avoid hats, hoods, or anything covering the existing hairline.
- Photos at least ~512px wide work better than tiny thumbnails.
- Files up to 10 MB are accepted.

## Troubleshooting

- **All nine cells fail with "Model returned no image"** — the most common
  cause is the API key's project not having image generation enabled / not
  being on the paid tier. Test directly:

  ```bash
  curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=$GEMINI_API_KEY" \
    -H 'Content-Type: application/json' \
    -d '{"contents":[{"parts":[{"text":"Draw a red apple"}]}]}'
  ```

  If that returns a 403 or quota error, the key isn't ready.

- **One or two cells fail** — that's usually a transient model error. Hit the
  per-cell **Retry** button.

- **`413 Payload too large`** — the image must be under 10 MB. The client
  rejects oversize files before upload, but check that you actually changed
  the original.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- `@google/genai` SDK

## Not included (yet)

- Auth / multi-barber accounts
- Saving past sessions or a "client gallery"
- Hair-color edits
- Beard / facial-hair edits
- Native mobile camera capture (the file input does work on phones)
