"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [ingredients, setIngredients] = useState("");
  const [status, setStatus] = useState("idle");
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
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Fridge to Recipe
        </h1>
        <p className="mt-2 text-gray-600">
          Tell us what's in your fridge, and we'll turn it into a recipe.
        </p>

        <div className="mt-6">
          <label
            htmlFor="ingredients"
            className="block text-sm font-medium text-gray-700"
          >
            What ingredients do you have?
          </label>
          <textarea
            id="ingredients"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="e.g. chicken thighs, spinach, garlic, rice, soy sauce"
            rows={4}
            className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-base focus:border-blue-500 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleGenerate}
            disabled={status === "loading" || !ingredients.trim()}
            className="mt-3 w-full sm:w-auto rounded-lg bg-blue-600 px-5 py-2.5 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {status === "loading" ? "Generating..." : "Generate Recipe"}
          </button>
        </div>

        <div className="mt-8">
          {status === "idle" && (
            <p className="text-gray-400 text-sm">
              Your recipe will appear here once you generate one.
            </p>
          )}

          {status === "loading" && (
            <p className="text-gray-500 text-sm animate-pulse">
              Cooking up a recipe from your ingredients...
            </p>
          )}

          {status === "error" && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-red-700 text-sm">{errorMessage}</p>
              <button
                onClick={handleGenerate}
                className="mt-2 text-sm font-medium text-red-700 underline"
              >
                Try again
              </button>
            </div>
          )}

          {status === "success" && recipe && (
            <pre className="whitespace-pre-wrap text-xs bg-white p-4 rounded-lg border">
              {JSON.stringify(recipe, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </main>
  );
}
