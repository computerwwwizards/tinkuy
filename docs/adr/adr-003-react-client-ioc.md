# ADR 0003: React Client-Side Inversion of Control (IoC) Container Pattern

- **Status:** Living
- **Date:** 2026-10-19
- **Deciders:** Core Maintainers (`@computerwwwizards`)
- **Target Scope:** React Applications, Client Components & IoC Architecture

---

## 1. Context and Problem Statement

When incorporating Inversion of Control (IoC) and Dependency Injection (DI) into React applications (especially in Next.js App Router or Server Components environments), global or module-scoped container instances risk leaking state across distinct server requests. Furthermore, instantiating containers directly within React render bodies without memoization causes container re-creation on every re-render, breaking singleton lifecycles and component reference stability.

---

## 2. Decision Drivers

- **SSR & Server Components Safety:** Prevent request-scoped state leaks across concurrent server renders.
- **Single Instance Stability:** Ensure IoC containers persist safely throughout a component lifecycle without re-creation.
- **React 19 Alignment:** Use modern React 19 Context provider paradigms without deprecated patterns.
- **Testability & Decoupling:** Facilitate dependency mocking and Anti-Corruption Layer (ACL) isolation.

---

## 3. Decisions

### 3.1 Strict Client Boundary (`'use client'`)
- All IoC container initialization components and context providers **must** be marked with the `'use client'` directive.
- IoC containers must never be declared as mutable global singletons in server-rendered modules.

### 3.2 Lazy State Initialization via `useState`
- Container creation inside React provider components **must** utilize lazy state initialization:
  ```tsx
  'use client';
  import { createContext, useContext, useState } from 'react';
  import { BasicContainer } from '@computerwwwizards/dependency-injection';

  export const IocContext = createContext<BasicContainer<AppServices> | null>(null);

  export function IocProvider({ children }: { children: React.ReactNode }) {
    const [ioc] = useState(() => {
      const container = new BasicContainer<AppServices>();
      // Register services, plugins, or ACL implementations
      return container;
    });

    return <IocContext value={ioc}>{children}</IocContext>;
  }
  ```
- **Rationale:** Passing a initializer function `() => new Container()` to `useState` ensures the container is constructed exactly once during initial mount on the client and persists across re-renders.

### 3.3 React 19 Context Value JSX Syntax
- Providers must use the React 19 `<Context value={ioc}>` JSX syntax instead of legacy `<Context.Provider value={ioc}>`.

### 3.4 Consumption via Custom Hook
- Consumers access registered container dependencies via a strongly-typed hook (e.g., `useIoc()`), ensuring clear error reporting if consumed outside the provider tree.

---

## 4. Consequences

### Positive
- **Request Isolation:** Completely eliminates cross-request memory contamination on the server.
- **Reference Stability:** Guarantees singleton instances bound to the container remain stable across client re-renders.
- **Type Safety & Modularity:** Cleanly decouples domain logic and Anti-Corruption Layers (ACL) from UI rendering logic.

### Trade-offs
- Container services are only accessible within client component trees wrapped by the `IocProvider`.
