# better-tailwindcss/no-restricted-classes

Disallow the usage of certain classes. This can be useful to disallow classes that are not recommended to be used in your project. For example, you can enforce the use of semantic color names or disallow features like child variants (`*:`) or the `!important` modifier (`!`) in your project.

It is also possible to provide a custom error message and a fix for the disallowed class. The fix can be used to automatically replace the disallowed class with a recommended one.

<br/>

## Options

### `restrict`

  The classes that should be disallowed. The patterns in this list are treated as regular expressions.
  Matched groups of the regular expression can be used in the error message or fix by using the `$1`, `$2`, etc. syntax.

  **Type**: `string[] | { pattern: string, message?: string, fix?: string }[]`  
  **Default**: `[]`

  Make sure to match possible variants and modifiers of the class names as well:

  ```json
  {
    "restrict": [{
      "fix": "$1$2-success$3",
      "message": "Restricted class: Use '$1$2-success$3' instead.",
      "pattern": "^([a-zA-Z0-9:/_-]*:)?(text|bg)-green-500(\\/[0-9]{1,3})?$"
    }]
  }
  ```

<br/>

<details>
  <summary>Common options</summary>

  <br/>

  These options are common to all rules and can also be set globally via the [`settings` object](../settings/settings.md).

  <br/>

### `attributes`

  The name of the attribute that contains the tailwind classes.  

  **Type**: Array of [Matchers](../configuration/advanced.md)  
  **Default**: [Name](../configuration/advanced.md#name-based-matching) for `"class"` and [strings Matcher](../configuration/advanced.md#types-of-matchers) for `"class", "className"`

  <br/>

### `callees`

  List of function names which arguments should also get linted.
  
  **Type**: Array of [Matchers](../configuration/advanced.md)  
  **Default**: [Matchers](../configuration/advanced.md#types-of-matchers) for `"cc", "clb", "clsx", "cn", "cnb", "ctl", "cva", "cx", "dcnb", "objstr", "tv", "twJoin", "twMerge"`

  <br/>

### `variables`

  List of variable names whose initializer should also get linted.  
  
  **Type**: Array of [Matchers](../configuration/advanced.md)  
  **Default**:  [strings Matcher](../configuration/advanced.md#types-of-matchers) for `"className", "classNames", "classes", "style", "styles"`

  <br/>

### `tags`

  List of template literal tag names whose content should get linted.  
  
  **Type**: Array of [Matchers](../configuration/advanced.md)  
  **Default**: None

  Note: When using the `tags` option, it is recommended to use the [strings Matcher](../configuration/advanced.md#types-of-matchers) for your tag names. This will ensure that nested expressions get linted correctly.

</details>

<br/>

## Examples

```tsx
// ❌ BAD: disallow the use of the `text-green-500` class with option `{ restrict: [{ pattern: "^(.*)-green-500$", message: "Restricted class: Use '$1-success' instead." }] }`
<div class="text-green-500" />;
//          ~~~~~~~~~~~~~~ Restricted class: Use 'text-success' instead.
```

```tsx
// ❌ BAD: disallow the use of the child variants with option `{ restrict: ["^\\*+:.*"] }`
<div class="rounded *:mx-0" />;
//                  ~~~~~~
```

```tsx
// ❌ BAD: disallow the use of the important modifier `{ restrict: ["^.*!$"] }`
<div class="rounded p-4!" />;
//                  ~~~~
```
