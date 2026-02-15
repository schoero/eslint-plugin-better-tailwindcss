# better-tailwindcss/enforce-shorthand-classes

This rule identifies when multiple longhand Tailwind CSS classes can be replaced with a single shorthand class, improving code readability and reducing bundle size.

<br/>

> [!NOTE]
> This rule might interfere with [`better-tailwindcss/enforce-canonical-classes`](./enforce-canonical-classes.md) if both rules are enabled. It is recommended to use only one of them to avoid conflicting fixes.

<br/>

## Options

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
// ❌ BAD: using separate padding classes
<div class="pt-4 pr-4 pb-4 pl-4" />;
```

```tsx
// ✅ GOOD: using shorthand padding class
<div class="p-4" />;
```

```tsx
// ❌ BAD: using separate width and height classes
<div class="w-4 h-4" />;
```

```tsx
// ✅ GOOD: using shorthand size class
<div class="size-4" />;
```
