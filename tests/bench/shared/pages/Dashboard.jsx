import { Input } from "../components/Input.jsx";
import { Modal } from "../components/Modal.jsx";
import { cn } from "../utils/helpers.js";

/**
 * second page fixture that repeats the same literal strings found in other
 * files and adds a few more collapsible and single-class canonicalization targets.
 */
export function Dashboard() {
  const headerClasses = cn(
    // repeated baseline literal (cache stress).
    "text-sm font-bold text-gray-700",
    // repeated literal that canonicalizes (cache + worker stress).
    "[display:flex]",
    // repeated collapsible literal (cache + worker stress).
    "w-10 h-10",
    // already-canonical layout utilities.
    "flex items-center justify-between"
  );

  return (
    <div>
      <header class={headerClasses}>
        <h1>Dashboard</h1>
      </header>
      <main>
        <Input />
        <Modal />
      </main>
    </div>
  );
}
