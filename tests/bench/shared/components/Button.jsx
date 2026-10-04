import { cn } from "../utils/helpers.js";

/**
 * warm-up / baseline component with only already-canonical classes.
 * This measures the cheapest path through parsing, splitting, and linting.
 */
export function Button() {
  const base = "flex items-center justify-center rounded px-4 py-2 text-white";

  return (
    <button
      class={cn(
        // baseline canonical utility string passed through a helper.
        base,
        // repeated baseline literal to stress the literal cache.
        "text-sm font-bold text-gray-700",
        // simple variant classes, all already canonical.
        "bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-300"
      )}
      type="button"
    >
      Submit
    </button>
  );
}
