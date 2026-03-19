# Data Fetching

## CRITICAL RULES

### 1. Server Components Only

ALL data fetching MUST be done exclusively via **Server Components**.

- **NEVER** fetch data in Client Components (`"use client"`)
- **NEVER** fetch data via Route Handlers (`src/app/api/`)
- **NEVER** use `useEffect` + `fetch` patterns
- **NEVER** use SWR, React Query, or any client-side data fetching library

If a component needs data, it must be a Server Component. Pass data down as props to any Client Components that need it for interactivity.

### 2. Database Queries via `/data` Directory

All database queries MUST go through helper functions in the `/data` directory.

- **NEVER** write inline database queries in components or anywhere outside `/data`
- **ALWAYS** use Drizzle ORM — **NEVER use raw SQL**
- Each file in `/data` should group related queries (e.g., `data/workouts.ts`, `data/exercises.ts`)

Example structure:
```
src/
  data/
    workouts.ts
    exercises.ts
    sets.ts
```

Example helper function:
```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getWorkoutsForUser(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}
```

### 3. User Data Isolation — NEVER Skip This

Every query that returns user data MUST be scoped to the currently authenticated user.

- **ALWAYS** filter by `userId` in every query
- **NEVER** fetch all rows and filter in memory
- **NEVER** trust a `userId` or record `id` from URL params, form input, or any client-supplied value without verifying ownership against the authenticated session

The authenticated user's ID must come from the server-side session (e.g., `auth()` from your auth library), never from the client.

Example of correct ownership check:
```ts
// src/data/workouts.ts
export async function getWorkoutById(workoutId: string, userId: string) {
  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));

  return workout ?? null;
}
```

```ts
// src/app/workouts/[id]/page.tsx (Server Component)
import { auth } from "@/auth";
import { getWorkoutById } from "@/data/workouts";

export default async function WorkoutPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workout = await getWorkoutById(params.id, session.user.id);
  if (!workout) notFound();

  return <WorkoutDetail workout={workout} />;
}
```

## Summary

| Rule | Requirement |
|------|-------------|
| Where to fetch data | Server Components only |
| Where to write queries | `/data` directory only |
| How to query the DB | Drizzle ORM only, no raw SQL |
| User data scoping | Always filter by authenticated `userId` from the server session |
