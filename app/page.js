"use client";

import { useState } from "react";

export default function Home() {
  const [ingredients, setIngredients] = useState("");

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
            className="mt-3 w-full sm:w-auto rounded-lg bg-blue-600 px-5 py-2.5 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            Generate Recipe
          </button>
        </div>
      </div>
    </main>
  );
}
