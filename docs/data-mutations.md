# Data Mutations

## CRITICAL RULES

### 1. Database Mutations via `/data` Directory

All database mutations MUST go through helper functions in the `src/data` directory.

- **NEVER** write inline database mutations in components, server actions, or anywhere outside `src/data`
- **ALWAYS** use Drizzle ORM — **NEVER use raw SQL**
- Each file in `src/data` should group related operations (e.g., `data/workouts.ts`, `data/exercises.ts`)

Example helper function:
```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function createWorkout(userId: string, name: string, date: Date) {
  const [workout] = await db
    .insert(workouts)
    .values({ userId, name, date })
    .returning();
  return workout;
}

export async function deleteWorkout(workoutId: string, userId: string) {
  await db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}
```

### 2. Server Actions via Colocated `actions.ts` Files

All data mutations MUST be triggered via **Server Actions** defined in colocated `actions.ts` files.

- **NEVER** mutate data from Client Components directly
- **NEVER** use Route Handlers (`src/app/api/`) for mutations
- Server Actions must be defined in a file named `actions.ts` colocated with the route that uses them

Example structure:
```
src/
  app/
    workouts/
      page.tsx
      actions.ts       ← server actions for this route
      [id]/
        page.tsx
        actions.ts     ← server actions for this route
```

Each `actions.ts` file must begin with `"use server"`:
```ts
// src/app/workouts/actions.ts
"use server";
```

### 3. Typed Parameters — No FormData

All server action parameters MUST be explicitly typed.

- **NEVER** use `FormData` as a parameter type
- **ALWAYS** use typed objects or primitives as parameters
- Extract and parse any form values before calling the server action

```ts
// ✅ Correct
export async function createWorkout(params: { name: string; date: Date }) { ... }

// ❌ Wrong
export async function createWorkout(formData: FormData) { ... }
```

### 4. Validate All Arguments with Zod

Every server action MUST validate its arguments using [Zod](https://zod.dev/) before doing anything else.

- **ALWAYS** define a Zod schema for each server action's parameters
- **ALWAYS** call `.parse()` or `.safeParse()` at the top of the action before any other logic
- **NEVER** trust or use params that have not been validated

Example:
```ts
// src/app/workouts/actions.ts
"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  date: z.coerce.date(),
});

export async function createWorkoutAction(params: { name: string; date: Date }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { name, date } = createWorkoutSchema.parse(params);

  await createWorkout(session.user.id, name, date);
}
```

### 5. No Redirects in Server Actions

Server actions MUST NOT call `redirect()`. Redirects must be handled client-side after the server action resolves.

- **NEVER** call `redirect()` from `next/navigation` inside a server action
- **ALWAYS** let the server action return normally, then navigate from the client using `router.push()` or similar

```ts
// ✅ Correct — redirect handled client-side
async function handleSubmit() {
  await createWorkoutAction({ name, date });
  router.push("/dashboard");
}

// ❌ Wrong — redirect inside server action
export async function createWorkoutAction(params: { name: string; date: Date }) {
  await createWorkout(userId, name, date);
  redirect("/dashboard"); // never do this
}
```

### 6. User Data Isolation in Mutations

Every mutation that touches user data MUST be scoped to the authenticated user.

- **ALWAYS** get the user ID from the server-side session (`auth()`), never from client-supplied input
- **ALWAYS** pass `userId` to the data helper so ownership is enforced at the query level
- **NEVER** trust a record `id` from URL params or client input without verifying ownership

## Summary

| Rule | Requirement |
|------|-------------|
| Where to write DB mutation logic | `src/data` directory only |
| How to mutate the DB | Drizzle ORM only, no raw SQL |
| How to expose mutations to the UI | Server Actions in colocated `actions.ts` files |
| Server action parameter types | Explicit TypeScript types — no `FormData` |
| Argument validation | Zod — always validate at the top of every action |
| User data scoping | Always use authenticated `userId` from the server session |
| Redirects | Never use `redirect()` in server actions — use `router.push()` client-side |
