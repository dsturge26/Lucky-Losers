# Barber AI Mockups

A static web app for barbers. Upload a client photo, pick a hairstyle length
(**short**, **medium**, or **long**), and get a 3×3 grid of AI-generated
mockups of that client wearing nine different cuts.

Image edits are powered by [Google Gemini 2.5 Flash Image](https://ai.google.dev/gemini-api/docs/image-generation)
(a.k.a. "Nano Banana"), which preserves the subject's face, skin tone, and
lighting while editing other parts of the image.

## How the API key works

This app is fully static — there is no server. Each user enters their own
Google Gemini API key in the UI on first load. The key is stored only in
their browser's `localStorage` and is sent directly from their browser to
Google. It is never sent to GitHub or any third party.

Get a key at <https://aistudio.google.com/app/apikey>. Image generation on
`gemini-2.5-flash-image` requires a paid-tier Google Cloud project.

## Live deploy (GitHub Pages)

On every push to `main`, the `.github/workflows/deploy.yml` action:

1. Runs `npm ci && npm run build` (Next.js static export → `out/`)
2. Uploads `out/` as a Pages artifact
3. Deploys it to GitHub Pages

To enable Pages for the repo:

1. Go to **Settings → Pages**
2. Set **Source** to **GitHub Actions**
3. Push to `main` and the workflow takes over.

The site will be served at `https://<owner>.github.io/Lucky-Losers/`. The
`basePath` is hard-coded to `/Lucky-Losers` in `next.config.mjs` — if you
fork to a different repo name, update that constant.

## Local development

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. On first load you'll be asked to paste a
Gemini API key (saved in your browser).

To preview the production static build locally:

```bash
npm run build
npx serve out
```

## How it works

- **`app/page.tsx`** — single-page UI: API-key gate → length selector →
  photo upload → grid. Fans out 9 parallel `editHairstyle` calls.
- **`lib/hairstyles.ts`** — nine hairstyles per length, each with a
  prompt-ready description and a shared `buildPrompt()`.
- **`lib/gemini.ts`** — thin wrapper around `@google/genai` that talks to
  `gemini-2.5-flash-image` from the browser using the user's key.
- **`components/ApiKeyGate.tsx`** — handles the key UI + localStorage.

The prompt template asks the model to keep face, skin tone, expression,
pose, lighting, background, and clothing identical, and to only change the
hair.

## Tips for best results

- Use a clear front-facing photo with even lighting.
- Avoid hats, hoods, or anything covering the existing hairline.
- Photos at least ~512px wide work better than small thumbnails.
- Files up to 10 MB are accepted.

## Troubleshooting

- **All nine cells fail with "Model returned no image"** — almost always
  the key's Google Cloud project isn't on the paid tier or doesn't have
  image generation enabled. Test directly:

  ```bash
  curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=$KEY" \
    -H 'Content-Type: application/json' \
    -d '{"contents":[{"parts":[{"text":"Draw a red apple"}]}]}'
  ```

- **One or two cells fail** — usually transient. Hit the per-cell **Retry** button.

- **Stale key** — click **Change key** in the header to clear and re-enter.

## Stack

- Next.js 14 (App Router, `output: "export"`) + TypeScript
- Tailwind CSS
- `@google/genai` (browser bundle)
- GitHub Pages via `actions/deploy-pages`

## Not included

- Auth / multi-barber accounts
- Saving past sessions or a "client gallery"
- Hair-color edits
- Beard / facial-hair edits
