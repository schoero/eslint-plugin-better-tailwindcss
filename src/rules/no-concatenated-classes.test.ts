import { describe, it } from "vitest";

import { noConcatenatedClasses } from "better-tailwindcss:rules/no-concatenated-classes.js";
import { lint } from "better-tailwindcss:tests/utils/lint.js";


describe(noConcatenatedClasses.name, () => {

  it("should not report static class strings", () => {
    lint(noConcatenatedClasses, {
      valid: [
        {
          angular: `<img class="bg-red-500 text-white" />`,
          astro: `<img class="bg-red-500 text-white" />`,
          html: `<img class="bg-red-500 text-white" />`,
          jsx: `() => <img className="bg-red-500 text-white" />`,
          svelte: `<img class="bg-red-500 text-white" />`,
          vue: `<template><img class="bg-red-500 text-white" /></template>`,

          css: `a { @apply bg-red-500 text-white; }`
        }
      ]
    });
  });

  it("should not report concatenated literals separated by whitespace", () => {
    lint(noConcatenatedClasses, {
      valid: [
        {
          angular: `<img [class]="'bg-red-500 ' + 'text-white'" />`,
          astro: `<img class={"bg-red-500 " + "text-white"} />`,
          jsx: `() => <img className={"bg-red-500 " + "text-white"} />`,
          svelte: `<img class={"bg-red-500 " + "text-white"} />`,
          vue: `<template><img :class="'bg-red-500 ' + 'text-white'" /></template>`
        },
        {
          angular: `<img [class]="'bg-red-500' + ' text-white'" />`,
          astro: `<img class={"bg-red-500" + " text-white"} />`,
          jsx: `() => <img className={"bg-red-500" + " text-white"} />`,
          svelte: `<img class={"bg-red-500" + " text-white"} />`,
          vue: `<template><img :class="'bg-red-500' + ' text-white'" /></template>`
        }
      ]
    });
  });

  it("should report classes concatenated with plus operator", () => {
    lint(noConcatenatedClasses, {
      invalid: [
        {
          angular: `<img [class]="'bg-' + color" />`,
          astro: `<img class={"bg-" + color} />`,
          jsx: `() => <img className={"bg-" + color} />`,
          svelte: `<img class={"bg-" + color} />`,
          vue: `<template><img :class="'bg-' + color" /></template>`,

          errors: 1
        },
        {
          angular: `<img [class]="color + '-500'" />`,
          astro: `<img class={color + "-500"} />`,
          jsx: `() => <img className={color + "-500"} />`,
          svelte: `<img class={color + "-500"} />`,
          vue: `<template><img :class="color + '-500'" /></template>`,

          errors: 1
        },
        {
          angular: `<img [class]="'bg-' + color + '-500'" />`,
          astro: `<img class={"bg-" + color + "-500"} />`,
          jsx: `() => <img className={"bg-" + color + "-500"} />`,
          svelte: `<img class={"bg-" + color + "-500"} />`,
          vue: `<template><img :class="'bg-' + color + '-500'" /></template>`,

          errors: 2
        }
      ]
    });
  });

  it("should report interpolated class strings", () => {
    lint(noConcatenatedClasses, {
      invalid: [
        {
          angular: `<img [class]="\`bg-\${color}\`" />`,
          astro: `<img class={\`bg-\${color}\`} />`,
          jsx: `() => <img className={\`bg-\${color}\`} />`,
          svelte: `<img class={\`bg-\${color}\`} />`,
          vue: `<template><img :class="\`bg-\${color}\`" /></template>`,

          errors: 1
        },
        {
          angular: `<img [class]="\`\${color}-500\`" />`,
          astro: `<img class={\`\${color}-500\`} />`,
          jsx: `() => <img className={\`\${color}-500\`} />`,
          svelte: `<img class={\`\${color}-500\`} />`,
          vue: `<template><img :class="\`\${color}-500\`" /></template>`,

          errors: 1
        },
        {
          angular: `<img [class]="\`bg-\${color}-500\`" />`,
          astro: `<img class={\`bg-\${color}-500\`} />`,
          jsx: `() => <img className={\`bg-\${color}-500\`} />`,
          svelte: `<img class={\`bg-\${color}-500\`} />`,
          vue: `<template><img :class="\`bg-\${color}-500\`" /></template>`,

          errors: 2
        }
      ]
    });
  });

  it("should only report the edge classes that are actually concatenated", () => {
    lint(noConcatenatedClasses, {
      invalid: [
        {
          angular: `<img [class]="'static bg-' + color + ' text-white trailing'" />`,
          astro: `<img class={"static bg-" + color + " text-white trailing"} />`,
          jsx: `() => <img className={"static bg-" + color + " text-white trailing"} />`,
          svelte: `<img class={"static bg-" + color + " text-white trailing"} />`,
          vue: `<template><img :class="'static bg-' + color + ' text-white trailing'" /></template>`,

          errors: 1
        }
      ]
    });
  });

  it("should not report interpolation separated from classes by whitespace", () => {
    lint(noConcatenatedClasses, {
      valid: [
        {
          angular: `<img [class]="\`bg-red-500 \${color}\`" />`,
          astro: `<img class={\`bg-red-500 \${color}\`} />`,
          jsx: `() => <img className={\`bg-red-500 \${color}\`} />`,
          svelte: `<img class={\`bg-red-500 \${color}\`} />`,
          vue: `<template><img :class="\`bg-red-500 \${color}\`" /></template>`
        },
        {
          angular: `<img [class]="\`\${color} bg-red-500\`" />`,
          astro: `<img class={\`\${color} bg-red-500\`} />`,
          jsx: `() => <img className={\`\${color} bg-red-500\`} />`,
          svelte: `<img class={\`\${color} bg-red-500\`} />`,
          vue: `<template><img :class="\`\${color} bg-red-500\`" /></template>`
        }
      ]
    });
  });

  it("should report multiple interpolations in one class string", () => {
    lint(noConcatenatedClasses, {
      invalid: [
        {
          angular: `<img [class]="\`bg-\${color}-\${shade}-500\`" />`,
          astro: `<img class={\`bg-\${color}-\${shade}-500\`} />`,
          jsx: `() => <img className={\`bg-\${color}-\${shade}-500\`} />`,
          svelte: `<img class={\`bg-\${color}-\${shade}-500\`} />`,
          vue: `<template><img :class="\`bg-\${color}-\${shade}-500\`" /></template>`,

          errors: 3
        }
      ]
    });
  });

  it("should not report templates without literal classs", () => {
    lint(noConcatenatedClasses, {
      valid: [
        {
          angular: `<img [class]="\`\${color}\`" />`,
          astro: `<img class={\`\${color}\`} />`,
          jsx: `() => <img className={\`\${color}\`} />`,
          svelte: `<img class={\`\${color}\`} />`,
          vue: `<template><img :class="\`\${color}\`" /></template>`
        },
        {
          angular: `<img [class]="\`\${color}\${shade}\`" />`,
          astro: `<img class={\`\${color}\${shade}\`} />`,
          jsx: `() => <img className={\`\${color}\${shade}\`} />`,
          svelte: `<img class={\`\${color}\${shade}\`} />`,
          vue: `<template><img :class="\`\${color}\${shade}\`" /></template>`
        }
      ]
    });
  });

  it("should report interpolated class fragments with outer whitespace", () => {
    lint(noConcatenatedClasses, {
      invalid: [
        {
          angular: `<img [class]="\` bg-\${color} \`" />`,
          astro: `<img class={\` bg-\${color} \`} />`,
          jsx: `() => <img className={\` bg-\${color} \`} />`,
          svelte: `<img class={\` bg-\${color} \`} />`,
          vue: `<template><img :class="\` bg-\${color} \`" /></template>`,

          errors: 1
        },
        {
          angular: `<img [class]="\` \${color}-500  \`" />`,
          astro: `<img class={\` \${color}-500  \`} />`,
          jsx: `() => <img className={\` \${color}-500  \`} />`,
          svelte: `<img class={\` \${color}-500  \`} />`,
          vue: `<template><img :class="\` \${color}-500  \`" /></template>`,

          errors: 1
        }
      ]
    });
  });

  it("should report mixed plus and template concatenation", () => {
    lint(noConcatenatedClasses, {
      invalid: [
        {
          angular: `<img [class]="\`bg-\${color}\` + '-500'" />`,
          astro: `<img class={"bg-" + \`\${color}\` + "-500"} />`,
          jsx: `() => <img className={"bg-" + \`\${color}\` + "-500"} />`,
          svelte: `<img class={"bg-" + \`\${color}\` + "-500"} />`,
          vue: `<template><img :class="'bg-' + \`\${color}\` + '-500'" /></template>`,

          errors: 2
        }
      ]
    });
  });

  it("should not report ternary branches when the left literal ends with a whitespace", () => {
    lint(noConcatenatedClasses, {
      valid: [
        {
          angular: `<div [class]="'flex w-full min-w-0 ' + (menuOpen ? 'gap-1' : 'flex-col gap-0')"></div>`,
          astro: `<div class={"flex w-full min-w-0 " + (menuOpen ? "gap-1" : "flex-col gap-0")} />`,
          jsx: `() => <div className={"flex w-full min-w-0 " + (menuOpen ? "gap-1" : "flex-col gap-0")} />`,
          svelte: `<div class={"flex w-full min-w-0 " + (menuOpen ? "gap-1" : "flex-col gap-0")} />`,
          vue: `<template><div :class="'flex w-full min-w-0 ' + (menuOpen ? 'gap-1' : 'flex-col gap-0')"></div></template>`
        }
      ]
    });
  });

  it("should not report ternary branches when the right literal starts with a whitespace", () => {
    lint(noConcatenatedClasses, {
      valid: [
        {
          angular: `<div [class]="'flex w-full min-w-0' + (menuOpen ? ' gap-1' : ' flex-col gap-0')"></div>`,
          astro: `<div class={"flex w-full min-w-0" + (menuOpen ? " gap-1" : " flex-col gap-0")} />`,
          jsx: `() => <div className={"flex w-full min-w-0" + (menuOpen ? " gap-1" : " flex-col gap-0")} />`,
          svelte: `<div class={"flex w-full min-w-0" + (menuOpen ? " gap-1" : " flex-col gap-0")} />`,
          vue: `<template><div :class="'flex w-full min-w-0' + (menuOpen ? ' gap-1' : ' flex-col gap-0')"></div></template>`
        }
      ]
    });
  });

  it("should report ternary branches when neither side has surrounding whitespace", () => {
    lint(noConcatenatedClasses, {
      invalid: [
        {
          angular: `<div [class]="'flex w-full min-w-0' + (menuOpen ? 'gap-1' : 'flex-col gap-0')"></div>`,
          astro: `<div class={"flex w-full min-w-0" + (menuOpen ? "gap-1" : "flex-col gap-0")} />`,
          jsx: `() => <div className={"flex w-full min-w-0" + (menuOpen ? "gap-1" : "flex-col gap-0")} />`,
          svelte: `<div class={"flex w-full min-w-0" + (menuOpen ? "gap-1" : "flex-col gap-0")} />`,
          vue: `<template><div :class="'flex w-full min-w-0' + (menuOpen ? 'gap-1' : 'flex-col gap-0')"></div></template>`,

          errors: 3
        }
      ]
    });
  });

  it("should not report deeply nested ternary branches when the left literal ends with a whitespace", () => {
    lint(noConcatenatedClasses, {
      valid: [
        {
          angular: `<div [class]="'flex w-full min-w-0 ' + (menuOpen ? 'gap-1 ' + (sidebarOpen ? 'left-100' : 'left-0') : 'flex-col gap-0')"></div>`,
          astro: `<div class={"flex w-full min-w-0 " + (menuOpen ? "gap-1 " + (sidebarOpen ? "left-100" : "left-0")  : "flex-col gap-0")} />`,
          jsx: `() => <div className={"flex w-full min-w-0 " + (menuOpen ? "gap-1 " + (sidebarOpen ? "left-100" : "left-0") : "flex-col gap-0")} />`,
          svelte: `<div class={"flex w-full min-w-0 " + (menuOpen ? "gap-1 " + (sidebarOpen ? "left-100" : "left-0") : "flex-col gap-0")} />`,
          vue: `<template><div :class="'flex w-full min-w-0 ' + (menuOpen ? 'gap-1 ' + (sidebarOpen ? 'left-100' : 'left-0') : 'flex-col gap-0')"></div></template>`
        }
      ]
    });
  });

  it("should not report deeply nested ternary branches when the right literal ends with a whitespace", () => {
    lint(noConcatenatedClasses, {
      valid: [
        {
          angular: `<div [class]="'flex w-full min-w-0' + (menuOpen ? ' gap-1' + (sidebarOpen ? ' left-100' : ' left-0') : ' flex-col gap-0')"></div>`,
          astro: `<div class={"flex w-full min-w-0" + (menuOpen ? " gap-1" + (sidebarOpen ? " left-100" : " left-0")  : " flex-col gap-0")} />`,
          jsx: `() => <div className={"flex w-full min-w-0" + (menuOpen ? " gap-1" + (sidebarOpen ? " left-100" : " left-0") : " flex-col gap-0")} />`,
          svelte: `<div class={"flex w-full min-w-0" + (menuOpen ? " gap-1" + (sidebarOpen ? " left-100" : " left-0") : " flex-col gap-0")} />`,
          vue: `<template><div :class="'flex w-full min-w-0' + (menuOpen ? ' gap-1' + (sidebarOpen ? ' left-100' : ' left-0') : ' flex-col gap-0')"></div></template>`
        }
      ]
    });
  });

  it("should report deeply nested ternary branches when neither literal has surrounding whitespace", () => {
    lint(noConcatenatedClasses, {
      invalid: [
        {
          angular: `<div [class]="'flex w-full min-w-0' + (menuOpen ? 'gap-1' + (sidebarOpen ? 'left-100' : 'left-0') : 'flex-col gap-0')"></div>`,
          astro: `<div class={"flex w-full min-w-0" + (menuOpen ? "gap-1" + (sidebarOpen ? "left-100" : "left-0")  : "flex-col gap-0")} />`,
          jsx: `() => <div className={"flex w-full min-w-0" + (menuOpen ? "gap-1" + (sidebarOpen ? "left-100" : "left-0") : "flex-col gap-0")} />`,
          svelte: `<div class={"flex w-full min-w-0" + (menuOpen ? "gap-1" + (sidebarOpen ? "left-100" : "left-0") : "flex-col gap-0")} />`,
          vue: `<template><div :class="'flex w-full min-w-0' + (menuOpen ? 'gap-1' + (sidebarOpen ? 'left-100' : 'left-0') : 'flex-col gap-0')"></div></template>`,

          errors: 5
        }
      ]
    });
  });

  it("should not report concatenation with a whitespace-only literal", () => {
    lint(noConcatenatedClasses, {
      valid: [
        {
          angular: `<img [class]="'bg-red-500' + ' '" />`,
          astro: `<img class={"bg-red-500" + " "} />`,
          jsx: `() => <img className={"bg-red-500" + " "} />`,
          svelte: `<img class={"bg-red-500" + " "} />`,
          vue: `<template><img :class="'bg-red-500' + ' '" /></template>`
        }
      ]
    });
  });

  it("should report ternary branches with leading whitespace only", () => {
    lint(noConcatenatedClasses, {
      invalid: [
        {
          angular: `<div [class]="' flex' + (menuOpen ? 'gap-1' : 'gap-2')"></div>`,
          astro: `<div class={" flex" + (menuOpen ? "gap-1" : "gap-2")} />`,
          jsx: `() => <div className={" flex" + (menuOpen ? "gap-1" : "gap-2")} />`,
          svelte: `<div class={" flex" + (menuOpen ? "gap-1" : "gap-2")} />`,
          vue: `<template><div :class="' flex' + (menuOpen ? 'gap-1' : 'gap-2')"></div></template>`,

          errors: 3
        }
      ]
    });
  });

  it("should not report multiple interpolations separated by whitespace", () => {
    lint(noConcatenatedClasses, {
      valid: [
        {
          angular: `<img [class]="\`\${color} \${shade}\`" />`,
          astro: `<img class={\`\${color} \${shade}\`} />`,
          jsx: `() => <img className={\`\${color} \${shade}\`} />`,
          svelte: `<img class={\`\${color} \${shade}\`} />`,
          vue: `<template><img :class="\`\${color} \${shade}\`" /></template>`
        }
      ]
    });
  });

  it("should not report when no class literals are present", () => {
    lint(noConcatenatedClasses, {
      valid: [
        {
          angular: `<img [class]="\`\${color}\${shade}\`" />`,
          astro: `<img class={\`\${color}\${shade}\`} />`,
          jsx: `() => <img className={\`\${color}\${shade}\`} />`,
          svelte: `<img class={\`\${color}\${shade}\`} />`,
          vue: `<template><img :class="\`\${color}\${shade}\`" /></template>`
        }
      ]
    });
  });

  it("should report literal class joined to leading interpolation without whitespace", () => {
    lint(noConcatenatedClasses, {
      invalid: [
        {
          angular: `<img [class]="\`\${color}-500\`" />`,
          astro: `<img class={\`\${color}-500\`} />`,
          jsx: `() => <img className={\`\${color}-500\`} />`,
          svelte: `<img class={\`\${color}-500\`} />`,
          vue: `<template><img :class="\`\${color}-500\`" /></template>`,

          errors: 1
        }
      ]
    });
  });

  it("should report literal class joined to trailing interpolation without whitespace", () => {
    lint(noConcatenatedClasses, {
      invalid: [
        {
          angular: `<img [class]="\`bg-\${color}\`" />`,
          astro: `<img class={\`bg-\${color}\`} />`,
          jsx: `() => <img className={\`bg-\${color}\`} />`,
          svelte: `<img class={\`bg-\${color}\`} />`,
          vue: `<template><img :class="\`bg-\${color}\`" /></template>`,

          errors: 1
        }
      ]
    });
  });

  it("should report when a template starts with an interpolation immediately followed by a class", () => {
    lint(noConcatenatedClasses, {
      invalid: [
        {
          angular: `<img [class]="\`\${color}text-white\`" />`,
          astro: `<img class={\`\${color}text-white\`} />`,
          jsx: `() => <img className={\`\${color}text-white\`} />`,
          svelte: `<img class={\`\${color}text-white\`} />`,
          vue: `<template><img :class="\`\${color}text-white\`" /></template>`,

          errors: 1
        }
      ]
    });
  });

  it("should report when a template ends with a class immediately followed by an interpolation", () => {
    lint(noConcatenatedClasses, {
      invalid: [
        {
          angular: `<img [class]="\`bg-red-500\${color}\`" />`,
          astro: `<img class={\`bg-red-500\${color}\`} />`,
          jsx: `() => <img className={\`bg-red-500\${color}\`} />`,
          svelte: `<img class={\`bg-red-500\${color}\`} />`,
          vue: `<template><img :class="\`bg-red-500\${color}\`" /></template>`,

          errors: 1
        }
      ]
    });
  });

  it("should not report interpolations separated from all static classes by whitespace", () => {
    lint(noConcatenatedClasses, {
      valid: [
        {
          angular: `<img [class]="\`bg-red-500 \${color} text-white\`" />`,
          astro: `<img class={\`bg-red-500 \${color} text-white\`} />`,
          jsx: `() => <img className={\`bg-red-500 \${color} text-white\`} />`,
          svelte: `<img class={\`bg-red-500 \${color} text-white\`} />`,
          vue: `<template><img :class="\`bg-red-500 \${color} text-white\`" /></template>`
        }
      ]
    });
  });

  it("should report every concatenated edge around multiple interpolations", () => {
    lint(noConcatenatedClasses, {
      invalid: [
        {
          angular: `<img [class]="\`bg-\${color}\${shade}\${opacity}text-white\`" />`,
          astro: `<img class={\`bg-\${color}\${shade}\${opacity}text-white\`} />`,
          jsx: `() => <img className={\`bg-\${color}\${shade}\${opacity}text-white\`} />`,
          svelte: `<img class={\`bg-\${color}\${shade}\${opacity}text-white\`} />`,
          vue: `<template><img :class="\`bg-\${color}\${shade}\${opacity}text-white\`" /></template>`,

          errors: 2
        },
        {
          angular: `<img [class]="\`bg-\${color}-\${shade}/\${opacity}\`" />`,
          astro: `<img class={\`bg-\${color}-\${shade}/\${opacity}\`} />`,
          jsx: `() => <img className={\`bg-\${color}-\${shade}/\${opacity}\`} />`,
          svelte: `<img class={\`bg-\${color}-\${shade}/\${opacity}\`} />`,
          vue: `<template><img :class="\`bg-\${color}-\${shade}/\${opacity}\`" /></template>`,

          errors: 3
        }
      ]
    });
  });

});
