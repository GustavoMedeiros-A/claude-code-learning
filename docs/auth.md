# Authentication

## Auth Provider

**This app uses [Clerk](https://clerk.com) for all authentication.**

- Do NOT implement custom auth, session management, or JWT handling
- Do NOT use NextAuth, Auth.js, or any other auth library
- All auth must go through Clerk's SDK and helpers

## Installation

Clerk is used via the `@clerk/nextjs` package.

## Middleware

Clerk requires middleware to protect routes. Define it in `src/middleware.ts`:

```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

## Getting the Current User

Always retrieve the authenticated user's ID server-side using Clerk's `auth()` helper. Never trust a user ID from the client.

```ts
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();

if (!userId) {
  redirect("/sign-in");
}
```

Use this pattern in Server Components and data-fetching functions. Pass `userId` down to `/data` helpers to scope queries — see `/docs/data-fetching.md`.

## Sign In / Sign Up Pages

Use Clerk's hosted components or embed them directly:

```ts
// src/app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return <SignIn />;
}
```

```ts
// src/app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return <SignUp />;
}
```

## Environment Variables

Clerk requires these environment variables:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

Never hardcode these values. Always use `.env.local` for local development and the appropriate secrets manager in production.

## Rules Summary

| Rule | Requirement |
|------|-------------|
| Auth provider | Clerk only — no other auth libraries |
| Getting current user | `auth()` from `@clerk/nextjs/server` in Server Components |
| Route protection | Clerk middleware in `src/middleware.ts` |
| User ID source | Always from server-side `auth()`, never from client input |
