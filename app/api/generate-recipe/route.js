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
- "amount" must contain ONLY the quantity and unit (e.g. "500g", "2 tbsp", "to taste"). NEVER include the ingredient's name or a description inside "amount" — that belongs only in "name".
- "name" should be the ingredient itself, in a natural, singular-ish form (e.g. "chicken breast", "green chilli", "honey"), without the quantity in it.
- Include a reasonable "swap" (a common substitute) for at least the main ingredients; use null if there isn't a good one.
- "steps" must be ordered starting at 1.
- You may include one or two pantry staples (salt, oil, water) not in the user's list if needed, but do not invent exotic ingredients.
- Return ONLY the JSON object. Nothing else.`;

export async function POST(request) {
  const body = await request.json();
  const ingredients = body.ingredients;

  if (!ingredients || typeof ingredients !== "string" || !ingredients.trim()) {
    return Response.json(
      { error: "Please enter at least one ingredient." },
      { status: 400 },
    );
  }

  let completion;
  try {
    completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Ingredients available: ${ingredients}` },
      ],
      response_format: { type: "json_object" },
    });
  } catch (err) {
    console.error("Groq API call failed:", err);
    return Response.json(
      { error: "The AI service failed to respond. Please try again." },
      { status: 502 },
    );
  }

  const raw = completion.choices[0]?.message?.content;

  if (!raw) {
    return Response.json(
      { error: "The AI returned an empty response." },
      { status: 502 },
    );
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse JSON from AI:", raw);
    return Response.json(
      { error: "The AI returned malformed data. Please try again." },
      { status: 502 },
    );
  }

  const validationError = validateRecipeShape(parsed);
  if (validationError) {
    console.error("Recipe failed validation:", validationError, parsed);
    return Response.json(
      {
        error: `The AI returned unexpected data (${validationError}). Please try again.`,
      },
      { status: 502 },
    );
  }

  return Response.json({ recipe: parsed });
}

function validateRecipeShape(data) {
  if (typeof data !== "object" || data === null) return "not an object";
  if (typeof data.title !== "string" || !data.title.trim())
    return "missing title";
  if (typeof data.servings !== "number" || data.servings <= 0)
    return "invalid servings";

  if (!Array.isArray(data.ingredients) || data.ingredients.length === 0)
    return "missing ingredients list";
  for (const ing of data.ingredients) {
    if (typeof ing.name !== "string" || !ing.name.trim())
      return "ingredient missing name";
    if (typeof ing.amount !== "string") return "ingredient missing amount";
    if (ing.swap !== null && typeof ing.swap !== "string")
      return "invalid swap value";
  }

  if (!Array.isArray(data.steps) || data.steps.length === 0)
    return "missing steps list";
  for (const step of data.steps) {
    if (typeof step.order !== "number") return "step missing order";
    if (typeof step.instruction !== "string" || !step.instruction.trim())
      return "step missing instruction";
  }

  return null; // valid
}
