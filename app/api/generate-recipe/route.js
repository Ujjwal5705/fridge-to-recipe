import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request) {
  const body = await request.json();
  const ingredients = body.ingredients;

  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages: [
      {
        role: "user",
        content: `Say hello and repeat back these ingredients: ${ingredients}`,
      },
    ],
  });

  const reply = completion.choices[0].message.content;

  return Response.json({ reply });
}
