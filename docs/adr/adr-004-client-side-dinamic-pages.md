# ADR: Client-Side Dynamic Pages in SSG

- **Status:** Living
- **Start Date:** 2026-10-20

## Summary

To support dynamic client-side pages in a Static Site Generation (SSG) build, dynamic routes must use **URL query parameters** read via a **client-side hook**, rely on a colocated **`loading.tsx`** file to automatically provide the `Suspense` boundary, and **explicitly throw a bailout error at server/build time** inside the services injected into the IoC container.

## Motivation

In an SSG environment, pages are generated ahead of time as static files. Using dynamic path segments (`/resource/:id`) for unbounded or runtime-only parameters fails because:

1. **Static Host Resolution:** Static file hosts cannot resolve arbitrary path segments that were not generated at build time.
2. **Client Navigation Payloads:** Client-side routing expects static payload files (such as RSC payloads) to exist on the server for every path segment.
3. **Server/Build-Time Execution:** During the SSG build pass, code runs in a server/build environment where runtime parameters and client state do not exist.

Addressing pages via query parameters and forcing a server-time bailout in IoC-injected services allows a single static page shell to be generated at build time while deferring actual execution to the client runtime.

## Guide-level explanation

When creating a dynamic client-side page under SSG, follow four steps:

1. **Use Query Parameters:** Define a single static route path and pass dynamic values through query parameters (`?key=value`) instead of path parameters (`/:id`).
2. **Read Parameters with the Hook:** Access the query parameters on the client using the routing hook (`useSearchParams`).
3. **Use `loading.tsx` for Automatic Suspense:** Place a `loading.tsx` file in the route directory so the page automatically gets wrapped in a `Suspense` boundary without manual boundary boilerplate.
4. **Throw a Bailout Error in IoC Services at Server Time:** Any service injected into the IoC container that is called during the server/build pass must throw an explicit bailout error when running in the server environment, halting server-side execution and letting the `Suspense` boundary (`loading.tsx`) take over for the static output.

## Reference-level explanation

### 1. Query Parameters and Hook Consumption

- The route is defined as a fixed static path so the SSG build outputs a single static entry and payload for that route.
- Dynamic identifiers are passed in the URL search string and read exclusively through the client hook.

### 2. Automatic Suspense via `loading.tsx`

- Using the client search parameter hook or bailing out during static generation requires a `Suspense` boundary above the page component.
- Defining `loading.tsx` at the route level automatically provides this `Suspense` boundary and defines the fallback HTML emitted during the static build.

### 3. Server-Time Bailout Error in IoC-Injected Services

- The architecture uses an IoC container to inject services into the application.
- During the SSG build (server time), these injected services cannot fulfill client-runtime operations.
- Instead of running or returning dummy data during the build, the services injected into the IoC must **explicitly throw a bailout error** when executed at server time.
- Throwing this error aborts the server-side render pass of the page and forces the framework to fall back to the `Suspense` boundary provided by `loading.tsx`, deferring real service execution until the page runs on the client.

## Drawbacks

- URLs rely on query strings (`?id=...`) rather than path segments (`/:id`).
- Every route using this pattern must include a `loading.tsx` boundary (or equivalent `Suspense` wrapper) so the thrown bailout error is caught during the build.

## Rationale and alternatives

- **Dynamic Path Segments (`/:id`):** Rejected because static hosts and client-side RSC payload requests fail with `404` when navigating to paths that were not pre-rendered at build time.
- **Not Throwing in IoC Services at Server Time:** Rejected because allowing services to run or return empty states during the SSG build either breaks the build or bakes invalid state into the static HTML instead of triggering the `Suspense` fallback.

## Unresolved questions

- None at this stage; this document is a living ADR and will be updated as the pattern evolves.
