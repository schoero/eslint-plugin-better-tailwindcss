# Contributing to eslint-plugin-better-tailwindcss

First off, thank you for considering contributing to **eslint-plugin-better-tailwindcss**! Your help is essential to making this project better. This document provides guidelines and instructions for contributing.

<br />

## How Can I Contribute?

### Reporting Bugs

If you find a bug, please create an issue on [GitHub Issues](https://github.com/schoero/eslint-plugin-better-tailwindcss/issues) with:

- **Clear title and description** of the issue
- **Steps to reproduce** the problem
- **Expected behavior** vs **actual behavior**
- **Your environment**: Node.js version, npm version, ESLint version, Tailwind CSS version
- **Code examples** or screenshots if applicable

<br />

### Feature Requests

Feature requests are tracked as GitHub issues. When creating a feature request, include:

- **Clear title and description**
- **Use case and benefits** of the proposed feature
- **Possible implementation** approach (if you have ideas)
- **Examples** of how the feature would be used

<br />

### Pull Requests

Pull requests are appreciated! Here's the process:

#### Prerequisites

- Node.js `^20.11.0` or `>=21.2.0`
- npm `>=8.0.0`

<br />

##### Installation

```bash
git clone https://github.com/schoero/eslint-plugin-better-tailwindcss.git
cd eslint-plugin-better-tailwindcss
npm install
```

<br />

##### Fork the repository and create your branch from `main`

   ```bash
   git checkout -b feat/your-feature-name
   ```

<br />

##### Set up the development environment

   ```bash
   npm install
   ```

<br />

##### Make your changes

- Follow the project's code style
- Add tests for new features or bug fixes
- Update documentation if needed
- Keep commits atomic and write clear commit messages

<br />

##### Run the test suite

   ```bash
   npm test
   ```

   If you use vscode, you can open a test file and press <kbd>F5</kbd> to run all tests in the file in debug mode.  

   The plugin supports both Tailwind CSS v3 and v4. Use the following commands to test against both versions:  

   ```bash
   npm run install:v3
   npm run test:v3
   npm run install:v4
   npm run test:v4
   ```

<br />

##### Fix linting and formatting issues

   ```bash
   npm run lint:fix
   ```

<br />

##### Check type validity

   ```bash
   npm run typecheck
   ```

<br />

##### Build the project

   ```bash
   npm run build
   ```

<br />

##### Commit and push your changes

```bash
git add .
git commit -m "feat: add new feature" # or "fix: fix issue", "docs: update docs", etc.
git push origin feat/your-feature-name
```

Use conventional commit messages:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `test:` for test changes
- `refactor:` for code refactoring
- `chore:` for maintenance tasks
- `ci:` for CI/CD changes

Example: `feat: add new rule for enforcing class ordering`

<br />

##### Create a pull request on GitHub with

- Clear title and description
- Reference to related issues
- Summary of changes

<br />

### Test Template

The project includes a sophisticated testing abstraction that automatically tests rules across multiple parsers (Angular, Astro, HTML, JSX, Svelte, and Vue). Use the `lint()` helper from `tests/utils/lint.ts`:

```ts
import { describe, it } from "vitest";

import { yourRule } from "better-tailwindcss:rules/your-rule.js";
import { lint } from "better-tailwindcss:tests/utils/lint.js";

describe(yourRule.name, () => {
  it("should describe what it does", () => {
    lint(yourRule, {
      invalid: [
        {
          angular: '<img class="bad classes" />',
          angularOutput: '<img class="fixed classes" />',
          html: '<img class="bad classes" />',
          htmlOutput: '<img class="fixed classes" />',
          jsx: '() => <img class="bad classes" />',
          jsxOutput: '() => <img class="fixed classes" />',
          svelte: '<img class="bad classes" />',
          svelteOutput: '<img class="fixed classes" />',
          vue: '<template><img class="bad classes" /></template>',
          vueOutput: '<template><img class="fixed classes" /></template>',

          errors: 1,
          options: [{ /* rule options */ }]
        }
      ],
      valid: [
        {
          angular: '<img class="valid classes" />',
          html: '<img class="valid classes" />',
          jsx: '() => <img class="valid classes" />',
          svelte: '<img class="valid classes" />',
          vue: '<template><img class="valid classes" /></template>',

          options: [{ /* rule options */ }]
        }
      ]
    });
  });
});
```

<br />

## Recognition

Contributors will be recognized in:

- Pull request acknowledgments
- CHANGELOG entries
- GitHub contributors list

Thank you for your contributions!
