# UI Coding Standards

## Component Library

**Only shadcn/ui components may be used for UI in this project.**

- Do NOT create custom components. Every UI element must come from the shadcn/ui library.
- If a needed component does not yet exist in the project, add it via the shadcn CLI:
  ```bash
  npx shadcn@latest add <component-name>
  ```
- Components are installed into `src/components/ui/` and should not be modified unless absolutely necessary.
- Compose pages and features by combining shadcn/ui primitives — do not wrap them in custom abstractions.

## Date Formatting

All date formatting must use [date-fns](https://date-fns.org/).

Dates must be displayed in the following format:

```
1st Sep 2026
2nd Aug 2026
3rd Jan 2026
4th Jun 2024
```

Use the `do MMM yyyy` format token with `date-fns/format`:

```ts
import { format } from "date-fns";

format(new Date("2026-09-01"), "do MMM yyyy"); // "1st Sep 2026"
format(new Date("2026-08-02"), "do MMM yyyy"); // "2nd Aug 2026"
```

Do not use `toLocaleDateString`, `Intl.DateTimeFormat`, or any other date formatting approach — always use `date-fns`.
