# Fridge to Recipe

Turn a list of ingredients you have on hand into a structured, interactive recipe — checkable steps, a servings scaler, and ingredient swap suggestions. Built as a recipe-card UI (tilted card, punch holes, tear line) rather than a generic form.

## Setup

1. Clone the repo and install dependencies:
```bash
   npm install
```
2. Create a `.env.local` file in the project root:
```text
    GROQ_API_KEY=your_groq_api_key_here
```
   Get a free key at [console.groq.com](https://console.groq.com).
3. Run the dev server:
```bash
   npm run dev
```
4. Open http://localhost:3000

## How it works

- The frontend sends ingredient text to a Next.js API route (`app/api/generate-recipe/route.js`), keeping the Groq API key server-side only — it never reaches the browser.
- The route prompts Groq (`llama-3.3-70b-versatile`) with a strict JSON schema and Groq's JSON mode enabled, then validates the response server-side (types, required fields, array shapes) before it's ever sent to the client. The API only ever returns `{ recipe: {...} }` or `{ error: "..." }` — the frontend never has to guess whether data is well-formed.
- If the AI call fails, times out, returns malformed JSON, or returns JSON with the wrong shape, the route returns a clean error instead of raw/broken data — no crashes.
- The frontend tracks loading, error, empty, and success states, and uses a request-id counter so a slow, stale response can never overwrite a newer one if the user resubmits quickly.
- `RecipeView` renders the validated recipe as interactive components: a servings +/− control that scales ingredient amounts, checkable step items with a live progress counter, and toggleable ingredient swap suggestions.

## AI usage note

I used Claude throughout this build — to scaffold the Next.js API route structure, talk through the JSON validation and stale-response guard design, and generate/iterate on the Tailwind UI. I reviewed and tested every change myself. Notably, Claude helped me catch and fix a real model-output bug: Groq occasionally repeated the ingredient's name inside the `amount` field (e.g. `"500g chicken breast"` instead of `"500g"`), which caused visible duplicates in the UI ("chicken breast chicken"). I fixed this at two layers — tightened the prompt instructions, and added a client-side `dedupeIngredientText` guard so the UI can't visually duplicate even if the model slips again. I also hit and fixed a Tailwind v4 migration issue (the `@theme` directive replaced `tailwind.config.js`'s color extension, which silently broke all custom colors until traced through DevTools) and a stale-cache issue where a component edit wasn't reflecting in the browser.

## Known limitations

- `scaleAmount` only scales amounts that start with a parseable number (e.g. "2 cups", "1/2 tsp"); text like "to taste" or "a pinch" is left unscaled by design, since there's nothing to reasonably scale.
- No retry-with-backoff on AI failures — a failed request requires a manual "Try again" click.
- No session persistence — refreshing the page loses the current recipe (stretch goal, not a requirement).
- Only tested against Groq's `llama-3.3-70b-versatile`; other models may format amounts differently.
- The `dedupeIngredientText` guard is a simple suffix match — it won't catch every possible way the model could restate an ingredient name, just the common case observed during testing.

## Time spent

~3.5 hours total.

## Running locally

```bash
npm install
npm run dev
```
Requires a `GROQ_API_KEY` in `.env.local` as described above.