"use client";

import { useState, useRef } from "react";
import RecipeView from "./components/RecipeView";

export default function Home() {
  const [ingredients, setIngredients] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | error | success
  const [recipe, setRecipe] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const latestRequestId = useRef(0);

  async function handleGenerate() {
    if (!ingredients.trim()) return;

    const requestId = ++latestRequestId.current;
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/generate-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients }),
      });

      const data = await res.json();
      if (requestId !== latestRequestId.current) return;

      if (!res.ok || data.error) {
        setStatus("error");
        setErrorMessage(
          data.error || "Something went wrong. Please try again.",
        );
        return;
      }

      setRecipe(data.recipe);
      setStatus("success");
    } catch (err) {
      if (requestId !== latestRequestId.current) return;
      setStatus("error");
      setErrorMessage(
        "Couldn't reach the server. Check your connection and try again.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-paper px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-sage">
              What&apos;s in the fridge?
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-ink mt-1">
            Fridge → Recipe
          </h1>
          <p className="mt-2 text-ink/70 text-sm sm:text-base">
            List what you&apos;ve got. Get back a real recipe you can cook and
            check off.
          </p>
        </div>

        {/* Notepad input */}
        <div className="relative">
          <div
            className="absolute -top-2 left-4 right-4 h-2 bg-paper border-x border-t border-dashed border-line"
            aria-hidden="true"
          />
          <div className="relative bg-white border border-line rounded-t-sm shadow-sm px-4 sm:px-5 pt-4 pb-3">
            <label
              htmlFor="ingredients"
              className="block font-mono text-xs uppercase tracking-wide text-ink/50"
            >
              Ingredients
            </label>
            <textarea
              id="ingredients"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="chicken thighs, spinach, garlic, rice, soy sauce..."
              rows={4}
              className="mt-2 w-full resize-none border-0 p-0 font-mono text-[15px] leading-7 text-ink placeholder:text-ink/30 focus:outline-none focus:ring-0"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, transparent, transparent 27px, var(--line) 27px, var(--line) 28px)",
              }}
            />
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={status === "loading" || !ingredients.trim()}
            className="w-full bg-sage hover:bg-sage-dark disabled:bg-sage/40 disabled:cursor-not-allowed text-paper font-mono text-sm uppercase tracking-wide py-3 rounded-b-sm border border-t-0 border-line transition-colors"
          >
            {status === "loading" ? "Cooking..." : "Generate Recipe →"}
          </button>
        </div>

        {/* Result area */}
        <div className="mt-8">
          {status === "idle" && (
            <p className="font-mono text-xs text-ink/40 text-center py-6">
              — your recipe will show up here —
            </p>
          )}

          {status === "loading" && (
            <div
              className="flex items-center justify-center gap-2 py-8"
              role="status"
              aria-live="polite"
            >
              <span className="h-2 w-2 rounded-full bg-sage animate-bounce [animation-delay:-0.3s]" />
              <span className="h-2 w-2 rounded-full bg-sage animate-bounce [animation-delay:-0.15s]" />
              <span className="h-2 w-2 rounded-full bg-sage animate-bounce" />
            </div>
          )}

          {status === "error" && (
            <div className="border-l-4 border-brick bg-brick/5 px-4 py-3 rounded-r-sm">
              <p className="font-mono text-xs uppercase tracking-wide text-brick mb-1">
                Couldn&apos;t generate a recipe
              </p>
              <p className="text-sm text-ink/80">{errorMessage}</p>
              <button
                onClick={handleGenerate}
                className="mt-2 font-mono text-xs uppercase tracking-wide text-brick underline underline-offset-2"
              >
                Try again
              </button>
            </div>
          )}

          {status === "success" && recipe && <RecipeView recipe={recipe} />}
        </div>
      </div>
    </main>
  );
}
