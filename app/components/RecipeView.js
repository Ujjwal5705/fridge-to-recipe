"use client";

import { useState, useMemo } from "react";

export default function RecipeView({ recipe }) {
  const [servings, setServings] = useState(recipe.servings);
  const [checkedSteps, setCheckedSteps] = useState({});
  const [showSwap, setShowSwap] = useState({});

  const scaleFactor = servings / recipe.servings;

  const scaledIngredients = useMemo(
    () =>
      recipe.ingredients.map((ing) => ({
        ...ing,
        displayAmount: scaleAmount(ing.amount, scaleFactor),
      })),
    [recipe.ingredients, scaleFactor],
  );

  function toggleStep(order) {
    setCheckedSteps((prev) => ({ ...prev, [order]: !prev[order] }));
  }

  function toggleSwap(name) {
    setShowSwap((prev) => ({ ...prev, [name]: !prev[name] }));
  }

  return (
    <div className="rounded-lg border bg-white p-4 sm:p-6">
      <h2 className="text-xl font-bold text-gray-900">{recipe.title}</h2>

      {/* Servings scaler */}
      <div className="mt-3 flex items-center gap-3">
        <span className="text-sm text-gray-600">Servings:</span>
        <button
          onClick={() => setServings((s) => Math.max(1, s - 1))}
          className="h-8 w-8 rounded-full border text-gray-700 hover:bg-gray-100"
        >
          −
        </button>
        <span className="w-6 text-center font-medium">{servings}</span>
        <button
          onClick={() => setServings((s) => s + 1)}
          className="h-8 w-8 rounded-full border text-gray-700 hover:bg-gray-100"
        >
          +
        </button>
      </div>

      {/* Ingredients */}
      <div className="mt-5">
        <h3 className="font-semibold text-gray-800">Ingredients</h3>
        <ul className="mt-2 space-y-2">
          {scaledIngredients.map((ing) => (
            <li
              key={ing.name}
              className="flex flex-wrap items-center justify-between gap-2 text-sm"
            >
              <span>
                <span className="font-medium">{ing.displayAmount}</span>{" "}
                {ing.name}
              </span>
              {ing.swap && (
                <button
                  onClick={() => toggleSwap(ing.name)}
                  className="text-xs text-blue-600 underline whitespace-nowrap"
                >
                  {showSwap[ing.name] ? `Swap: ${ing.swap}` : "Swap?"}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Steps */}
      <div className="mt-5">
        <h3 className="font-semibold text-gray-800">Steps</h3>
        <ul className="mt-2 space-y-2">
          {[...recipe.steps]
            .sort((a, b) => a.order - b.order)
            .map((step) => (
              <li key={step.order} className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!checkedSteps[step.order]}
                  onChange={() => toggleStep(step.order)}
                  className="mt-1"
                />
                <span
                  className={
                    checkedSteps[step.order]
                      ? "line-through text-gray-400"
                      : "text-gray-700"
                  }
                >
                  {step.instruction}
                </span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}

function scaleAmount(amount, factor) {
  const match = amount.match(/^([\d.\/]+)\s*(.*)$/);
  if (!match) return amount;

  let num = match[1];
  const rest = match[2];

  if (num.includes("/")) {
    const [n, d] = num.split("/").map(Number);
    num = n / d;
  } else {
    num = parseFloat(num);
  }

  if (isNaN(num)) return amount;

  const scaled = num * factor;
  const rounded = Math.round(scaled * 4) / 4; // round to nearest quarter

  return `${rounded % 1 === 0 ? rounded : rounded.toFixed(2)} ${rest}`.trim();
}
