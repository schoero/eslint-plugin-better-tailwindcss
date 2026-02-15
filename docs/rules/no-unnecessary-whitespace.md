# better-tailwindcss/no-unnecessary-whitespace

Disallow unnecessary whitespace in between and around tailwind classes.

<br/>

## Options

### `allowMultiline`

  Allow multi-line class declarations.  
  If this option is disabled, template literal strings will be collapsed into a single line string wherever possible. Must be set to `true` when used in combination with [better-tailwindcss/enforce-consistent-line-wrapping](./enforce-consistent-line-wrapping.md).  
  
  **Type**: `boolean`  
  **Default**: `true`

<br/>

<br/>

<details>
  <summary>Common options</summary>

  <br/>

  These options are common to all rules and can also be set globally via the [`settings` object](../settings/settings.md).

  <br/>

### `selectors`

  Flat list of selectors that determines where Tailwind class strings are linted.

  **Type**: Array of [Selectors](../configuration/advanced.md#selectors)
  **Default**: See [defaults API](../api/defaults.md)

</details>

<br/>

## Examples

```tsx
// ❌ BAD: random unnecessary whitespace
<div class=" text-black    underline  hover:text-opacity-70   " />;
```

```tsx
// ✅ GOOD: only necessary whitespace is remaining
<div class="text-black underline hover:text-opacity-70"/>;
```
