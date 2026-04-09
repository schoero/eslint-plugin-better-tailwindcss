import { describe, it } from "vitest";

import { noUnnecessaryWhitespace } from "better-tailwindcss:rules/no-unnecessary-whitespace.js";
import { lint } from "better-tailwindcss:tests/utils/lint.js";
import { MatcherType, SelectorKind } from "better-tailwindcss:types/rule.js";


describe("es", () => {

  it("should match callees names via regex", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `testStyles(" lint ");`,
          jsxOutput: `testStyles("lint");`,
          svelte: `<script>testStyles(" lint ");</script>`,
          svelteOutput: `<script>testStyles("lint");</script>`,
          vue: `<script>testStyles(" lint ");</script>`,
          vueOutput: `<script>testStyles("lint");</script>`,

          errors: 2,
          options: [{
            callees: ["^.*Styles$"]
          }]
        }
      ]
    });
  });

  it("should support callee target last for curried calls", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `testStyles(" keep ")(" lint ");`,
          jsxOutput: `testStyles(" keep ")("lint");`,
          svelte: `<script>testStyles(" keep ")(" lint ");</script>`,
          svelteOutput: `<script>testStyles(" keep ")("lint");</script>`,
          vue: `<script>testStyles(" keep ")(" lint ");</script>`,
          vueOutput: `<script>testStyles(" keep ")("lint");</script>`,

          errors: 2,
          options: [{
            selectors: [
              {
                callTarget: "last",
                kind: SelectorKind.Callee,
                name: "^testStyles$"
              }
            ]
          }]
        }
      ]
    });
  });

  it("should support callee target all for curried calls", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `testStyles(" first ")(" second ");`,
          jsxOutput: `testStyles("first")("second");`,
          svelte: `<script>testStyles(" first ")(" second ");</script>`,
          svelteOutput: `<script>testStyles("first")("second");</script>`,
          vue: `<script>testStyles(" first ")(" second ");</script>`,
          vueOutput: `<script>testStyles("first")("second");</script>`,

          errors: 4,
          options: [{
            selectors: [
              {
                callTarget: "all",
                kind: SelectorKind.Callee,
                name: "^testStyles$"
              }
            ]
          }]
        }
      ]
    });
  });

  it("should support numeric and negative callee targets", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `testStyles(" keep ")(" middle ")(" lint ");`,
          jsxOutput: `testStyles(" keep ")(" middle ")("lint");`,
          svelte: `<script>testStyles(" keep ")(" middle ")(" lint ");</script>`,
          svelteOutput: `<script>testStyles(" keep ")(" middle ")("lint");</script>`,
          vue: `<script>testStyles(" keep ")(" middle ")(" lint ");</script>`,
          vueOutput: `<script>testStyles(" keep ")(" middle ")("lint");</script>`,

          errors: 2,
          options: [{
            selectors: [
              {
                callTarget: -1,
                kind: SelectorKind.Callee,
                name: "^testStyles$"
              }
            ]
          }]
        }
      ],
      valid: [
        {
          jsx: `testStyles(" keep ")(" middle ")(" lint ");`,
          svelte: `<script>testStyles(" keep ")(" middle ")(" lint ");</script>`,
          vue: `<script>testStyles(" keep ")(" middle ")(" lint ");</script>`,

          options: [{
            selectors: [
              {
                callTarget: 5,
                kind: SelectorKind.Callee,
                name: "^testStyles$"
              }
            ]
          }]
        }
      ]
    });
  });

  it("should support targetCall for curried calls", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `testStyles(" keep ")(" lint ");`,
          jsxOutput: `testStyles(" keep ")("lint");`,
          svelte: `<script>testStyles(" keep ")(" lint ");</script>`,
          svelteOutput: `<script>testStyles(" keep ")("lint");</script>`,
          vue: `<script>testStyles(" keep ")(" lint ");</script>`,
          vueOutput: `<script>testStyles(" keep ")("lint");</script>`,

          errors: 2,
          options: [{
            selectors: [
              {
                kind: SelectorKind.Callee,
                name: "^testStyles$",
                targetCall: "last"
              }
            ]
          }]
        }
      ]
    });
  });

  it("should lint all targetArguments by default", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `testStyles(" lint ", " lint ");`,
          jsxOutput: `testStyles("lint", "lint");`,
          svelte: `<script>testStyles(" lint ", " lint ");</script>`,
          svelteOutput: `<script>testStyles("lint", "lint");</script>`,
          vue: `<script>testStyles(" lint ", " lint ");</script>`,
          vueOutput: `<script>testStyles("lint", "lint");</script>`,

          errors: 4,
          options: [{
            selectors: [
              {
                kind: SelectorKind.Callee,
                name: "^testStyles$"
              }
            ]
          }]
        }
      ]
    });
  });

  it("should support targetArgument for direct callee arguments", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `testStyles(" lint ", " keep ");`,
          jsxOutput: `testStyles("lint", " keep ");`,
          svelte: `<script>testStyles(" lint ", " keep ");</script>`,
          svelteOutput: `<script>testStyles("lint", " keep ");</script>`,
          vue: `<script>testStyles(" lint ", " keep ");</script>`,
          vueOutput: `<script>testStyles("lint", " keep ");</script>`,

          errors: 2,
          options: [{
            selectors: [
              {
                kind: SelectorKind.Callee,
                name: "^testStyles$",
                targetArgument: "first"
              }
            ]
          }]
        },
        {
          jsx: `testStyles(" keep ", " lint ");`,
          jsxOutput: `testStyles(" keep ", "lint");`,
          svelte: `<script>testStyles(" keep ", " lint ");</script>`,
          svelteOutput: `<script>testStyles(" keep ", "lint");</script>`,
          vue: `<script>testStyles(" keep ", " lint ");</script>`,
          vueOutput: `<script>testStyles(" keep ", "lint");</script>`,

          errors: 2,
          options: [{
            selectors: [
              {
                kind: SelectorKind.Callee,
                name: "^testStyles$",
                targetArgument: 1
              }
            ]
          }]
        },
        {
          jsx: `testStyles(...foo, " lint ");`,
          jsxOutput: `testStyles(...foo, "lint");`,
          svelte: `<script>testStyles(...foo, " lint ");</script>`,
          svelteOutput: `<script>testStyles(...foo, "lint");</script>`,
          vue: `<script>testStyles(...foo, " lint ");</script>`,
          vueOutput: `<script>testStyles(...foo, "lint");</script>`,

          errors: 2,
          options: [{
            selectors: [
              {
                kind: SelectorKind.Callee,
                name: "^testStyles$",
                targetArgument: 1
              }
            ]
          }]
        }
      ],
      valid: [
        {
          jsx: `testStyles(" keep ", " keep ");`,
          svelte: `<script>testStyles(" keep ", " keep ");</script>`,
          vue: `<script>testStyles(" keep ", " keep ");</script>`,

          options: [{
            selectors: [
              {
                kind: SelectorKind.Callee,
                name: "^testStyles$",
                targetArgument: 5
              }
            ]
          }]
        },
        {
          jsx: `testStyles(...foo, " keep ");`,
          svelte: `<script>testStyles(...foo, " keep ");</script>`,
          vue: `<script>testStyles(...foo, " keep ");</script>`,

          options: [{
            selectors: [
              {
                kind: SelectorKind.Callee,
                name: "^testStyles$",
                targetArgument: 0
              }
            ]
          }]
        }
      ]
    });
  });

  it("should apply first and last targetArgument to raw argument positions", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `testStyles(" lint ", ...foo);`,
          jsxOutput: `testStyles("lint", ...foo);`,
          svelte: `<script>testStyles(" lint ", ...foo);</script>`,
          svelteOutput: `<script>testStyles("lint", ...foo);</script>`,
          vue: `<script>testStyles(" lint ", ...foo);</script>`,
          vueOutput: `<script>testStyles("lint", ...foo);</script>`,

          errors: 2,
          options: [{
            selectors: [
              {
                kind: SelectorKind.Callee,
                name: "^testStyles$",
                targetArgument: "first"
              }
            ]
          }]
        }
      ],
      valid: [
        {
          jsx: `testStyles(...foo, " keep ");`,
          svelte: `<script>testStyles(...foo, " keep ");</script>`,
          vue: `<script>testStyles(...foo, " keep ");</script>`,

          options: [{
            selectors: [
              {
                kind: SelectorKind.Callee,
                name: "^testStyles$",
                targetArgument: "first"
              }
            ]
          }]
        },
        {
          jsx: `testStyles(" keep ", ...foo);`,
          svelte: `<script>testStyles(" keep ", ...foo);</script>`,
          vue: `<script>testStyles(" keep ", ...foo);</script>`,

          options: [{
            selectors: [
              {
                kind: SelectorKind.Callee,
                name: "^testStyles$",
                targetArgument: "last"
              }
            ]
          }]
        }
      ]
    });
  });

  it("should support combining targetCall and targetArgument", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `testStyles(" keep ", " ignore ")(" lint ", " keep ");`,
          jsxOutput: `testStyles(" keep ", " ignore ")("lint", " keep ");`,
          svelte: `<script>testStyles(" keep ", " ignore ")(" lint ", " keep ");</script>`,
          svelteOutput: `<script>testStyles(" keep ", " ignore ")("lint", " keep ");</script>`,
          vue: `<script>testStyles(" keep ", " ignore ")(" lint ", " keep ");</script>`,
          vueOutput: `<script>testStyles(" keep ", " ignore ")("lint", " keep ");</script>`,

          errors: 2,
          options: [{
            selectors: [
              {
                kind: SelectorKind.Callee,
                name: "^testStyles$",
                targetArgument: "first",
                targetCall: "last"
              }
            ]
          }]
        }
      ]
    });
  });

  it("should apply matchers only inside selected arguments", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `testStyles(...[{ objectKey: " lint " }], " keep ");`,
          jsxOutput: `testStyles(...[{ objectKey: "lint" }], " keep ");`,
          svelte: `<script>testStyles(...[{ objectKey: " lint " }], " keep ");</script>`,
          svelteOutput: `<script>testStyles(...[{ objectKey: "lint" }], " keep ");</script>`,
          vue: `<script>testStyles(...[{ objectKey: " lint " }], " keep ");</script>`,
          vueOutput: `<script>testStyles(...[{ objectKey: "lint" }], " keep ");</script>`,

          errors: 2,
          options: [{
            selectors: [
              {
                kind: SelectorKind.Callee,
                match: [{ type: MatcherType.ObjectValue }],
                name: "^testStyles$",
                targetArgument: 0
              }
            ]
          }]
        }
      ],
      valid: [
        {
          jsx: `testStyles({ objectKey: " keep " }, " keep ");`,
          svelte: `<script>testStyles({ objectKey: " keep " }, " keep ");</script>`,
          vue: `<script>testStyles({ objectKey: " keep " }, " keep ");</script>`,

          options: [{
            selectors: [
              {
                kind: SelectorKind.Callee,
                match: [{ type: MatcherType.ObjectValue }],
                name: "^testStyles$",
                targetArgument: "last"
              }
            ]
          }]
        }
      ]
    });
  });

  it("should match anonymous arrow function returns", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `testStyles(() => " lint ", () => { return " lint "; });`,
          jsxOutput: `testStyles(() => "lint", () => { return "lint"; });`,
          svelte: `<script>testStyles(() => " lint ", () => { return " lint "; });</script>`,
          svelteOutput: `<script>testStyles(() => "lint", () => { return "lint"; });</script>`,
          vue: `<script>testStyles(() => " lint ", () => { return " lint "; });</script>`,
          vueOutput: `<script>testStyles(() => "lint", () => { return "lint"; });</script>`,

          errors: 4,
          options: [{
            selectors: [{
              kind: SelectorKind.Callee,
              match: [{
                match: [{ type: MatcherType.String }],
                type: MatcherType.AnonymousFunctionReturn
              }],
              name: "^testStyles$"
            }]
          }]
        }
      ]
    });
  });

  it("should only match concise arrow returned expression", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `testStyles((param = " keep ") => " lint ");`,
          jsxOutput: `testStyles((param = " keep ") => "lint");`,
          svelte: `<script>testStyles((param = " keep ") => " lint ");</script>`,
          svelteOutput: `<script>testStyles((param = " keep ") => "lint");</script>`,
          vue: `<script>testStyles((param = " keep ") => " lint ");</script>`,
          vueOutput: `<script>testStyles((param = " keep ") => "lint");</script>`,

          errors: 2,
          options: [{
            selectors: [{
              kind: SelectorKind.Callee,
              match: [{
                match: [{ type: MatcherType.String }],
                type: MatcherType.AnonymousFunctionReturn
              }],
              name: "^testStyles$"
            }]
          }]
        }
      ]
    });
  });

  it("should not match non-return literals inside anonymous arrow function block bodies", () => {
    lint(noUnnecessaryWhitespace, {
      valid: [
        {
          jsx: `testStyles(() => { const value = " keep "; return value; });`,
          svelte: `<script>testStyles(() => { const value = " keep "; return value; });</script>`,
          vue: `<script>testStyles(() => { const value = " keep "; return value; });</script>`,

          options: [{
            selectors: [{
              kind: SelectorKind.Callee,
              match: [{
                match: [{ type: MatcherType.String }],
                type: MatcherType.AnonymousFunctionReturn
              }],
              name: "^testStyles$"
            }]
          }]
        }
      ]
    });
  });

  it("should match anonymous normal function returns", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `testStyles(function() { return " lint "; });`,
          jsxOutput: `testStyles(function() { return "lint"; });`,
          svelte: `<script>testStyles(function() { return " lint "; });</script>`,
          svelteOutput: `<script>testStyles(function() { return "lint"; });</script>`,
          vue: `<script>testStyles(function() { return " lint "; });</script>`,
          vueOutput: `<script>testStyles(function() { return "lint"; });</script>`,

          errors: 2,
          options: [{
            selectors: [{
              kind: SelectorKind.Callee,
              match: [{
                match: [{ type: MatcherType.String }],
                type: MatcherType.AnonymousFunctionReturn
              }],
              name: "^testStyles$"
            }]
          }]
        }
      ]
    });
  });

  it("should support all other nested matcher types inside anonymousFunctionReturn", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `testStyles(() => ({ " objectKey ": " objectValue " }));`,
          jsxOutput: `testStyles(() => ({ "objectKey": "objectValue" }));`,
          svelte: `<script>testStyles(() => ({ " objectKey ": " objectValue " }));</script>`,
          svelteOutput: `<script>testStyles(() => ({ "objectKey": "objectValue" }));</script>`,
          vue: `<script>testStyles(() => ({ " objectKey ": " objectValue " }));</script>`,
          vueOutput: `<script>testStyles(() => ({ "objectKey": "objectValue" }));</script>`,

          errors: 4,
          options: [{
            selectors: [{
              kind: SelectorKind.Callee,
              match: [{
                match: [
                  { type: MatcherType.ObjectKey },
                  { type: MatcherType.ObjectValue }
                ],
                type: MatcherType.AnonymousFunctionReturn
              }],
              name: "^testStyles$"
            }]
          }]
        },
        {
          jsx: `testStyles(() => " string ");`,
          jsxOutput: `testStyles(() => "string");`,
          svelte: `<script>testStyles(() => " string ");</script>`,
          svelteOutput: `<script>testStyles(() => "string");</script>`,
          vue: `<script>testStyles(() => " string ");</script>`,
          vueOutput: `<script>testStyles(() => "string");</script>`,

          errors: 2,
          options: [{
            selectors: [{
              kind: SelectorKind.Callee,
              match: [{
                match: [
                  { type: MatcherType.String }
                ],
                type: MatcherType.AnonymousFunctionReturn
              }],
              name: "^testStyles$"
            }]
          }]
        }
      ]
    });
  });

  it("should not cross function boundary twice for anonymousFunctionReturn", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `testStyles(() => { setTimeout(() => { return " keep "; }); return " lint "; });`,
          jsxOutput: `testStyles(() => { setTimeout(() => { return " keep "; }); return "lint"; });`,
          svelte: `<script>testStyles(() => { setTimeout(() => { return " keep "; }); return " lint "; });</script>`,
          svelteOutput: `<script>testStyles(() => { setTimeout(() => { return " keep "; }); return "lint"; });</script>`,
          vue: `<script>testStyles(() => { setTimeout(() => { return " keep "; }); return " lint "; });</script>`,
          vueOutput: `<script>testStyles(() => { setTimeout(() => { return " keep "; }); return "lint"; });</script>`,

          errors: 2,
          options: [{
            selectors: [{
              kind: SelectorKind.Callee,
              match: [{
                match: [
                  { type: MatcherType.String }
                ],
                type: MatcherType.AnonymousFunctionReturn
              }],
              name: "^testStyles$"
            }]
          }]
        }
      ]
    });
  });

  it("should match member expression callee names", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `const classes = []; classes.push(" lint ");`,
          jsxOutput: `const classes = []; classes.push("lint");`,
          svelte: `<script>const classes = []; classes.push(" lint ");</script>`,
          svelteOutput: `<script>const classes = []; classes.push("lint");</script>`,
          vue: `<script>const classes = []; classes.push(" lint ");</script>`,
          vueOutput: `<script>const classes = []; classes.push("lint");</script>`,

          errors: 2,
          options: [{
            callees: [[
              "^classes\\.push$",
              [{ match: MatcherType.String }]
            ]]
          }]
        }
      ]
    });
  });

  it("should match nested member expression callee names", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `const foo = { bar: { push: (value) => value } }; foo.bar.push(" lint ");`,
          jsxOutput: `const foo = { bar: { push: (value) => value } }; foo.bar.push("lint");`,
          svelte: `<script>const foo = { bar: { push: (value) => value } }; foo.bar.push(" lint ");</script>`,
          svelteOutput: `<script>const foo = { bar: { push: (value) => value } }; foo.bar.push("lint");</script>`,
          vue: `<script>const foo = { bar: { push: (value) => value } }; foo.bar.push(" lint ");</script>`,
          vueOutput: `<script>const foo = { bar: { push: (value) => value } }; foo.bar.push("lint");</script>`,

          errors: 2,
          options: [{
            callees: [[
              "^foo\\.bar\\.push$",
              [{ match: MatcherType.String }]
            ]]
          }]
        }
      ]
    });
  });

  it("should match callee selectors via path", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `const classes = ["keep"]; classes.push(" lint ");`,
          jsxOutput: `const classes = ["keep"]; classes.push("lint");`,
          svelte: `<script>const classes = ["keep"]; classes.push(" lint ");</script>`,
          svelteOutput: `<script>const classes = ["keep"]; classes.push("lint");</script>`,
          vue: `<script>const classes = ["keep"]; classes.push(" lint ");</script>`,
          vueOutput: `<script>const classes = ["keep"]; classes.push("lint");</script>`,

          errors: 2,
          options: [{
            selectors: [
              {
                kind: SelectorKind.Callee,
                match: [{ type: MatcherType.String }],
                path: "^classes\\.push$"
              }
            ]
          }]
        }
      ]
    });
  });

  it("should match variable names via regex", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `const testStyles = " lint ";`,
          jsxOutput: `const testStyles = "lint";`,
          svelte: `<script>const testStyles = " lint ";</script>`,
          svelteOutput: `<script>const testStyles = "lint";</script>`,
          vue: `<script>const testStyles = " lint ";</script>`,
          vueOutput: `<script>const testStyles = "lint";</script>`,

          errors: 2,
          options: [{
            variables: ["^.*Styles$"]
          }]
        }
      ]
    });
  });

  it("should match default exports via variable selectors", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `export default " lint ";`,
          jsxOutput: `export default "lint";`,

          errors: 2,
          options: [{
            selectors: [
              {
                kind: SelectorKind.Variable,
                name: "^default$"
              }
            ]
          }]
        }
      ]
    });
  });

  it("should not dereference exported default identifiers for variable selectors", () => {
    lint(noUnnecessaryWhitespace, {
      valid: [
        {
          jsx: `const classes = " lint "; export default classes;`,

          options: [{
            selectors: [
              {
                kind: SelectorKind.Variable,
                name: "^default$"
              }
            ]
          }]
        }
      ]
    });
  });

  it("should match default-exported objects", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `export default { slots: { root: " lint ", icon: " keep " }, title: " keep " };`,
          jsxOutput: `export default { slots: { root: "lint", icon: " keep " }, title: " keep " };`,

          errors: 2,
          options: [{
            selectors: [
              {
                kind: SelectorKind.Variable,
                match: [
                  {
                    path: "^slots\\.root$",
                    type: MatcherType.ObjectValue
                  }
                ],
                name: "^default$"
              }
            ]
          }]
        }
      ]
    });
  });

  it("should match attributes via regex", () => {
    lint(noUnnecessaryWhitespace, {
      invalid: [
        {
          jsx: `<img testStyles=" lint " />`,
          jsxOutput: `<img testStyles="lint" />`,
          svelte: `<img testStyles=" lint " />`,
          svelteOutput: `<img testStyles="lint" />`,
          vue: `<template><img testStyles=" lint " /> </template>`,
          vueOutput: `<template><img testStyles="lint" /> </template>`,

          errors: 2,
          options: [{
            attributes: ["^.*Styles$"]
          }]
        }
      ]
    });
  });

  // #234
  it("should ignore literals in binary comparisons", () => {
    lint(noUnnecessaryWhitespace, {
      valid: [
        {
          jsx: `<img class={{ "bg-primary": category === " members " }} />`,
          svelte: `<img class={{ "bg-primary": category === " members " }} />`,
          vue: `<template><img :class="{ 'bg-primary': category === ' members ' }" /></template>`,

          options: [{
            attributes: [[
              "^v-bind:class$",
              [{ match: MatcherType.ObjectValue }]
            ], [
              "class",
              [{ match: MatcherType.ObjectValue }]
            ]]
          }]
        }
      ]
    });
  });

  // #332
  it("should not leak variable selectors into callee selectors when assigned to a variable", () => {
    lint(noUnnecessaryWhitespace, {
      valid: [
        {
          jsx: `const variable = function func({ classes = " sm " }) {}`,

          options: [{
            selectors: [{
              kind: SelectorKind.Variable,
              match: [
                {
                  type: MatcherType.String
                }
              ],
              name: "^variable$"
            }]
          }]
        }
      ]
    });
  });

});
