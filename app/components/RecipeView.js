"use client";

import { useState, useMemo } from "react";

export default function RecipeView({ recipe }) {
  const [servings, setServings] = useState(recipe.servings);
  const [checkedSteps, setCheckedSteps] = useState({});
  const [showSwap, setShowSwap] = useState({});

  const scaleFactor = servings / recipe.servings;

  const scaledIngredients = useMemo(
    () =>
      recipe.ingredients.map((ing) => {
        const { amount, name } = dedupeIngredientText(ing.amount, ing.name);
        return {
          ...ing,
          displayAmount: scaleAmount(amount, scaleFactor),
          displayName: name,
        };
      }),
    [recipe.ingredients, scaleFactor],
  );

  const sortedSteps = useMemo(
    () => [...recipe.steps].sort((a, b) => a.order - b.order),
    [recipe.steps],
  );

  const completedCount = Object.values(checkedSteps).filter(Boolean).length;

  function toggleStep(order) {
    setCheckedSteps((prev) => ({ ...prev, [order]: !prev[order] }));
  }

  function toggleSwap(name) {
    setShowSwap((prev) => ({ ...prev, [name]: !prev[name] }));
  }

  return (
    <div className="relative pl-6 sm:pl-8 animate-[card-in_0.35s_ease-out]">
      {/* Punch holes — fixed spacing near the top, sitting in the margin beside the card,
      never overlapping card content regardless of how long the recipe is. */}
      <div className="absolute left-0 top-6 flex flex-col gap-14">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="block h-3 w-3 rounded-full bg-paper border border-line shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)]"
          />
        ))}
      </div>

      {/* Card */}
      <div className="bg-white border border-line rounded-sm shadow-md p-5 sm:p-7 rotate-[-0.4deg]">
        {/* Tear line */}
        <div className="border-b border-dashed border-line -mx-5 sm:-mx-7 mb-5 pb-4 px-5 sm:px-7">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold italic text-ink">
            {recipe.title}
          </h2>
        </div>

        {/* Servings */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs uppercase tracking-wide text-ink/50">
            Servings
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setServings((s) => Math.max(1, s - 1))}
              aria-label="Decrease servings"
              className="h-7 w-7 rounded-full border border-ink/20 text-ink hover:bg-butter/20 transition-colors flex items-center justify-center"
            >
              −
            </button>
            <span className="w-5 text-center font-semibold text-ink tabular-nums">
              {servings}
            </span>
            <button
              onClick={() => setServings((s) => s + 1)}
              aria-label="Increase servings"
              className="h-7 w-7 rounded-full border border-ink/20 text-ink hover:bg-butter/20 transition-colors flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>

        {/* Ingredients — receipt style */}
        <div className="mt-6">
          <h3 className="font-mono text-xs uppercase tracking-widest text-sage font-medium">
            Ingredients
          </h3>
          <ul className="mt-3 divide-y divide-line/70">
            {scaledIngredients.map((ing) => (
              <li
                key={ing.name}
                className="flex items-baseline justify-between gap-3 py-2 text-sm"
              >
                <span className="font-mono text-ink">
                  <span className="text-ink font-medium">
                    {ing.displayAmount}
                  </span>
                  {ing.displayName && (
                    <span className="text-ink/80"> {ing.displayName}</span>
                  )}
                </span>
                {ing.swap && (
                  <button
                    onClick={() => toggleSwap(ing.name)}
                    className="shrink-0 font-mono text-[11px] uppercase tracking-wide text-sage border border-sage/30 rounded-full px-2 py-0.5 hover:bg-sage/10 transition-colors"
                  >
                    {showSwap[ing.name] ? ing.swap : "swap?"}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Steps */}
        <div className="mt-7">
          <div className="flex items-baseline justify-between">
            <h3 className="font-mono text-xs uppercase tracking-widest text-sage font-medium">
              Steps
            </h3>
            <span className="font-mono text-[11px] text-ink/40">
              {completedCount}/{sortedSteps.length} done
            </span>
          </div>
          <ul className="mt-3 space-y-3">
            {sortedSteps.map((step) => {
              const done = !!checkedSteps[step.order];
              return (
                <li key={step.order} className="flex items-start gap-3">
                  <button
                    onClick={() => toggleStep(step.order)}
                    aria-pressed={done}
                    aria-label={`Mark step ${step.order} ${done ? "not done" : "done"}`}
                    className={`mt-0.5 h-5 w-5 shrink-0 rounded-sm border flex items-center justify-center transition-colors ${
                      done
                        ? "bg-sage border-sage"
                        : "border-ink/30 hover:border-sage"
                    }`}
                  >
                    {done && (
                      <svg
                        viewBox="0 0 12 12"
                        className="h-3 w-3 fill-none stroke-paper stroke-2"
                      >
                        <path
                          d="M2 6l3 3 5-6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                  <span
                    className={`text-sm leading-6 ${done ? "text-ink/35 line-through" : "text-ink/90"}`}
                  >
                    {step.instruction}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Defends against the model occasionally repeating the ingredient name
// inside the amount field (e.g. amount: "500g chicken breast", name: "chicken").
// If name already appears at the end of amount, don't render it twice.
function dedupeIngredientText(amount, name) {
  const normalizedAmount = amount.trim().toLowerCase();
  const normalizedName = name.trim().toLowerCase();
  if (normalizedAmount.endsWith(normalizedName)) {
    return { amount: amount.trim(), name: "" };
  }
  return { amount: amount.trim(), name: name.trim() };
}

// Scales a leading number in an amount string (e.g. "2 cups" -> "3 cups" at 1.5x).
// Falls back to the original text if there's no leading number to scale.
function scaleAmount(amount, factor) {
  const match = amount.match(/^([\d.\/]+)\s*(.*)$/);
  if (!match) return amount;

  let num = match[1];
  const rest = match[2].replace(/^,\s*/, "");

  if (num.includes("/")) {
    const [n, d] = num.split("/").map(Number);
    num = n / d;
  } else {
    num = parseFloat(num);
  }

  if (isNaN(num)) return amount;

  const scaled = num * factor;
  const rounded = Math.round(scaled * 4) / 4;
  const displayNum = rounded % 1 === 0 ? rounded : rounded.toFixed(2);

  return rest ? `${displayNum} ${rest}` : `${displayNum}`;
}
