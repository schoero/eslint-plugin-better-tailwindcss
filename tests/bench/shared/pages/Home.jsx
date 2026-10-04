import { Button } from "../components/Button.jsx";
import { Card } from "../components/Card.jsx";
import { cn, twMerge } from "../utils/helpers.js";

/**
 * page-level fixture that imports and uses helpers and components.
 * Repeats the same literal strings found in components to stress caches.
 */
export function Home() {
  const heroClasses = cn(
    // repeated literal that canonicalizes (cache + worker stress).
    "[display:flex]",
    // repeated collapsible literal (cache + worker stress).
    "w-10 h-10",
    // already-canonical layout utilities.
    "flex flex-col items-center justify-center gap-4"
  );

  const linkClasses = twMerge(
    // repeated baseline literal (cache stress).
    "text-sm font-bold text-gray-700",
    // already-canonical interactive classes.
    "hover:underline transition-colors"
  );

  return (
    <div class={heroClasses}>
      <Button />
      <Card>
        <a class={linkClasses} href="/">
          Home
        </a>
      </Card>
    </div>
  );
}
