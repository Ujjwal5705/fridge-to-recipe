import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a recipe generator. Given a list of ingredients, return ONE recipe as JSON only.

Respond with ONLY valid JSON, no markdown code fences, no explanation text before or after.

The JSON must match this exact shape:
{
  "title": "string",
  "servings": number,
  "ingredients": [
    { "name": "string", "amount": "string", "swap": "string or null" }
  ],
  "steps": [
    { "order": number, "instruction": "string" }
  ]
}

Rules:
- "servings" must be a number, default to 4 if not implied by context.
- Include a reasonable "swap" (a common substitute) for at least the main ingredients; use null if there isn't a good one.
- "steps" must be ordered starting at 1.
- You may include one or two pantry staples (salt, oil, water) not in the user's list if needed, but do not invent exotic ingredients.
- Return ONLY the JSON object. Nothing else.`;

export async function POST(request) {
  const body = await request.json();
  const ingredients = body.ingredients;

  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Ingredients available: ${ingredients}` },
    ],
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0].message.content;

  return Response.json({ raw });
}
