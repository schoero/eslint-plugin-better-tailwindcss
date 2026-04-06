# better-tailwindcss/enforce-consistent-variant-order

Enforce Tailwind CSS variant order for class names.

<br/>

## Options

This rule has no custom options.

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
// ❌ BAD: variants are not in Tailwind's recommended order
<div class="hover:lg:text-red-500" />;
```

```tsx
// ✅ GOOD: variants follow Tailwind's recommended order
<div class="lg:hover:text-red-500" />;
```

<br/>

> [!NOTE]
> This rule only enforces variant order for Tailwind CSS v4 projects.
