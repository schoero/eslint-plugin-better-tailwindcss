import { cn } from "../utils/helpers.js";

/**
 * small component with a conditional helper call and repeated literals
 * to exercise the callee parser branch and cache behavior.
 */
export function Badge({ active }) {
  return (
    <span
      class={cn(
        // repeated baseline literal across files (cache stress).
        "text-sm font-bold text-gray-700",
        // repeated literal that canonicalizes across files (cache stress).
        "[display:flex]",
        // already-canonical conditional classes.
        active ? "bg-green-500 text-white" : "bg-gray-200 text-gray-800"
      )}
    >
      Badge
    </span>
  );
}
