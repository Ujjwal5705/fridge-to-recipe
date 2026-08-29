# Fridge to Recipe

Turn a list of ingredients you have on hand into a structured, interactive recipe — checkable steps, a servings scaler, and ingredient swap suggestions.

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

- The frontend sends the ingredients text to a Next.js API route (`app/api/generate-recipe/route.js`), keeping the Groq API key server-side only.
- The API route prompts Groq (`llama-3.3-70b-versatile`) with a strict JSON schema and Groq's JSON mode enabled, then validates the response server-side (checks types, required fields, and array shapes) before ever sending it to the client.
- If the AI call fails, returns malformed JSON, or returns JSON that doesn't match the expected recipe shape, the API returns a clean `{ error: "..." }` response instead of raw/broken data.
- The frontend tracks loading, error, and success states, and uses a request-id counter to make sure a slow, stale response can never overwrite a newer one if the user resubmits quickly.
- Once a valid recipe is received, `RecipeView` renders it as interactive components: a servings +/− control that scales ingredient amounts, checkable step items, and toggleable ingredient swap suggestions.

## AI usage note

I used Claude to help scaffold this project and talk through the architecture (Next.js API route structure, the JSON validation approach, and the stale-response guard pattern), and to write boilerplate Tailwind markup faster. I reviewed, tested, and understand all the code — [add any specifics: e.g. "I wrote the scaleAmount parsing logic changes myself after testing edge cases like 'to taste'" if applicable].

## Known limitations

- `scaleAmount` only scales amounts that start with a parseable number (e.g. "2 cups", "1/2 tsp"); text like "to taste" or "a pinch" is left unscaled by design, since there's nothing to reasonably scale.
- No retry-with-backoff on AI failures — a failed request requires a manual "Try again" click rather than automatic retries.
- No session persistence — refreshing the page loses the current recipe (this is listed as a stretch goal, not a requirement).
- Only tested against Groq's `llama-3.3-70b-versatile`; other models may format amounts or swaps slightly differently.
- [Add anything else you personally noticed while testing — e.g. any weird output you saw, any edge case ingredient list that produced odd results, etc.]

## Time spent

~1.5 hours total.

## Running locally

```bash
npm install
npm run dev
```
Requires a `GROQ_API_KEY` in `.env.local` as described above.