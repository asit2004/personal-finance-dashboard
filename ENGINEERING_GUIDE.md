# FinanceAI — Engineering Guide

Deep reference for understanding how this codebase is architected and why.

---

## 1. How Zustand Works (Internally)

Zustand uses a publish-subscribe pattern over a plain JavaScript closure. Understanding this prevents subtle bugs.

### The Closure

```typescript
const useStore = create<State>((set, get) => ({
  count: 0,
  increment: () => set({ count: get().count + 1 }),
}));
```

`create()` creates a **store object** (not a React context). It holds:
- The current state as a plain object
- A `Set<listener>` of subscriber functions
- A `setState` function that merges new state and notifies all listeners

When you call `set()`, Zustand does a shallow merge (`Object.assign`) of the new values, then calls every listener. Each listener is a React component's `forceUpdate` equivalent.

### Why This Beats Context

React Context re-renders **every consumer** when the context value changes, even if the component only uses one field. Zustand uses **selector functions** to subscribe to specific slices:

```typescript
// Only re-renders when commandPaletteOpen changes — not when sidebar state changes
const isOpen = useUIStore(s => s.commandPaletteOpen);
```

This selector memoization is why Zustand scales: hundreds of components can subscribe to the same store without performance problems.

### The Immer Pattern (if you add it)

For complex state like transaction arrays, `immer` middleware lets you write mutating code that produces immutable updates:

```typescript
import { immer } from "zustand/middleware/immer";

const useStore = create(immer<State>((set) => ({
  items: [],
  addItem: (item) => set((state) => { state.items.push(item); }),
})));
```

---

## 2. How Auth Works in Next.js App Router

### The Three Layers

This app uses **three independent auth checks** — each layer catches what the previous can miss.

**Layer 1: Middleware** (`src/middleware.ts`)
- Runs on the Edge Runtime before any page renders
- Reads cookies from the request
- Redirects unauthenticated users to `/login`
- Fastest: no DB calls, no React rendering
- Weakness: Can be bypassed by direct RSC fetch calls (hence layer 2)

**Layer 2: Server Component Check**
```typescript
// In any layout or page Server Component:
const session = await auth();
if (!session) redirect("/login");
```
- Runs on the Node.js runtime
- Can access DB (Prisma) to verify session is still valid
- Protects against stale cookies

**Layer 3: Server Action Guard**
```typescript
// At the top of every Server Action:
const session = await auth();
if (!session) throw new Error("Unauthorized");
const userId = session.user.id; // NEVER from form data
```
- Defense in depth: even if layers 1 & 2 are bypassed, malicious API calls fail

### Cookie-Based Mock Auth (Current Implementation)

The mock flow sets a plain cookie and relies on middleware to check it. When you ship Auth.js:

1. `npm install next-auth@beta @auth/prisma-adapter`
2. Create `src/auth.ts` with providers and Prisma adapter
3. Replace cookie check in middleware with `auth()` from Auth.js
4. Replace `mockUser` with `session.user` from Auth.js

### Why `userId` Must Come from the Server Session

Never trust client-supplied IDs. An attacker can send any `userId` in a form body. The server session is cryptographically signed and tamper-proof.

```typescript
// WRONG — never do this
const userId = formData.get("userId") as string;

// RIGHT — always do this
const session = await auth();
const userId = session.user.id;
```

---

## 3. How Command Palettes Work

### The Architecture Pattern

A command palette is essentially a **filtered list with keyboard navigation**. The components:

1. **Overlay** — full-screen transparent backdrop that closes palette on click
2. **Panel** — the actual UI, centered, glass-morphism style
3. **Input** — auto-focused text input
4. **Grouped list** — sections with labels, each item has icon + label + shortcut + action
5. **Highlight state** — active item index, styled differently

### The Filtering Pipeline

```
Raw items (static routes + actions + dynamic transactions)
    ↓ filter by query string (fuzzy or exact substring)
    ↓ group by category
    ↓ limit results per group (e.g., max 5 recent transactions)
    ↓ render
```

All filtering happens in `useMemo` to avoid recomputation on every keystroke.

### Keyboard Navigation State Machine

```
State: { activeIndex: number }

ArrowDown → activeIndex = (activeIndex + 1) % totalItems
ArrowUp   → activeIndex = (activeIndex - 1 + totalItems) % totalItems
Enter     → execute items[activeIndex].action()
Escape    → close()
```

The `activeIndex` must skip section header rows (they aren't actionable). Common approach: `flatItems` array contains only actionable items, separate from the grouped render structure.

### Auto-Scroll to Active Item

```typescript
useEffect(() => {
  activeItemRef.current?.scrollIntoView({ block: "nearest" });
}, [activeIndex]);
```

### Portal vs Inline Rendering

Command palettes are mounted at the document root to escape `overflow: hidden` parents. Options:

1. `createPortal(content, document.body)` — explicit portal
2. Mount at top-level layout (DashboardShell) — simpler, same effect in this app
3. `<dialog>` element — native, handles focus trap and Escape automatically

This app uses option 2 (shell-level mounting) since DashboardShell is already the top-level client boundary.

---

## 4. How Modal Systems Are Architected

### The Mount-Once Pattern

**Wrong:** Mount modal in each page that needs it.
```
/transactions/page.tsx → renders <AddTransactionModal />
/budgets/page.tsx      → renders <AddTransactionModal />
```
Problem: Modal unmounts and remounts on every navigation, losing animation state and causing content flicker.

**Right:** Mount modal once at the shell level.
```
DashboardShell → renders <AddTransactionModal /> always
```
The modal is hidden (Framer Motion opacity:0 + pointer-events:none) when closed. It's always in the DOM, always mounted. Zustand state (not component state) controls visibility.

### Focus Trap

When a modal is open, keyboard focus must be trapped inside:
```typescript
// Minimal focus trap
useEffect(() => {
  if (!isOpen) return;
  const focusable = modalRef.current?.querySelectorAll(
    'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable?.[0] as HTMLElement;
  const last = focusable?.[focusable.length - 1] as HTMLElement;
  first?.focus();

  const handleTab = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;
    if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
      e.preventDefault();
      (e.shiftKey ? last : first).focus();
    }
  };
  document.addEventListener("keydown", handleTab);
  return () => document.removeEventListener("keydown", handleTab);
}, [isOpen]);
```

### Body Scroll Lock

Prevent body scroll while modal is open:
```typescript
useEffect(() => {
  document.body.style.overflow = isOpen ? "hidden" : "";
  return () => { document.body.style.overflow = ""; };
}, [isOpen]);
```

---

## 5. How React Hook Form + Zod Works

### The Integration Pattern

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });
type FormData = z.infer<typeof schema>;

const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
});
```

`zodResolver` bridges Zod validation to React Hook Form's validation API. On submit, RHF calls your Zod schema's `safeParse`. If it fails, errors appear in `formState.errors` keyed by field name.

### Controlled vs Uncontrolled

React Hook Form uses **uncontrolled** inputs by default (direct DOM refs, not React state). This is dramatically faster for large forms — no re-render on every keystroke.

`register()` attaches RHF's ref to your input. For custom components (like a Select), use `Controller`:

```typescript
<Controller
  control={control}
  name="category"
  render={({ field }) => <Select {...field} options={CATEGORIES} />}
/>
```

---

## 6. How Framer Motion AnimatePresence Works

### The Exit Animation Problem

By default, React unmounts components immediately when they leave the tree — there's no time for exit animations to play.

`AnimatePresence` solves this by:
1. Detecting when a direct child is removed from the tree
2. Keeping the child mounted long enough to play its `exit` animation
3. Actually unmounting after the animation completes

### The `key` Requirement

```typescript
// WRONG — key missing, AnimatePresence can't track identity
<AnimatePresence>
  {isOpen && <Modal />}
</AnimatePresence>

// RIGHT — stable key lets AnimatePresence track enter/exit
<AnimatePresence>
  {isOpen && <Modal key="add-transaction-modal" />}
</AnimatePresence>
```

### Mode: `wait` vs Default

```typescript
// Default: enter and exit animations play simultaneously
<AnimatePresence>

// wait: exit completes before enter starts (page transitions)
<AnimatePresence mode="wait">
```

Use `wait` for page-level transitions. Use default for modals (overlay fades in while panel scales up simultaneously).

---

## 7. How Tailwind v4 Differs from v3

This project uses Tailwind v4, which is a significant architectural shift.

### No `tailwind.config.ts`

Configuration is done in CSS instead:
```css
/* globals.css */
@import "tailwindcss";

@theme inline {
  --color-primary: oklch(62% 0.25 264);
  --font-sans: var(--font-geist-sans);
}
```

`@theme inline` injects CSS custom properties and makes them available as Tailwind classes (`bg-primary`, `text-primary`, etc.).

### PostCSS Plugin Change

```javascript
// postcss.config.mjs — v4 uses @tailwindcss/postcss, not tailwindcss
export default {
  plugins: { "@tailwindcss/postcss": {} },
};
```

### `cn()` Utility

```typescript
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

`clsx` handles conditional classes. `twMerge` resolves Tailwind conflicts (e.g., `p-4 p-6` → `p-6`).

---

## 8. CSS Custom Properties Design System

All colors are CSS custom properties toggled by a `data-theme` attribute on `<html>`:

```css
:root {
  --bg: #ffffff;
  --fg: #09090b;
  --primary: oklch(62% 0.25 264);
}

[data-theme="dark"] {
  --bg: #06060e;
  --fg: #fafafa;
}
```

`ThemeProvider` applies `document.documentElement.setAttribute("data-theme", theme)`.

**Why this approach over Tailwind's dark mode:** CSS custom properties work with any runtime value (user preference, time of day, per-widget themes) without needing to rebuild the CSS. All components use `var(--bg)` etc., and theme changes are instant with zero re-renders.

---

## 9. React Three Fiber Architecture

### Dynamic Import (Always)

```typescript
const HeroScene = dynamic(() => import("@/components/3d/hero-scene"), {
  ssr: false,
  loading: () => <div className="w-full h-64 animate-pulse rounded-2xl bg-[var(--surface)]" />,
});
```

Three.js requires `window` and `WebGL` context — unavailable during SSR. `ssr: false` completely excludes it from the server bundle.

### DPR Cap

```typescript
<Canvas dpr={[1, 1.5]}>
```

Pixel ratio above 1.5 has diminishing visual returns but linearly increases GPU work. On Retina displays (2x DPR), this halves the render load.

### The `useFrame` Loop

`useFrame` runs on every animation frame (60fps). **Do not** put mouse position in React state — it would trigger 60 re-renders per second of the entire component tree.

```typescript
// WRONG — state update on every frame = 60 re-renders/sec
const [mouse, setMouse] = useState({ x: 0, y: 0 });
useEffect(() => {
  window.addEventListener("mousemove", (e) => setMouse({ x: e.clientX, ... }));
}, []);

// RIGHT — ref update, no re-renders
const mouseRef = useMousePosition(); // returns a ref
useFrame(() => {
  mesh.current.rotation.y = mouseRef.current.normalizedX * 0.1;
});
```

---

## 10. Next.js App Router Mental Model

### Route Groups

`(dashboard)` and `(auth)` are **route groups** — the parentheses make them invisible to the URL. They exist purely to share a layout.

```
src/app/
  (dashboard)/
    layout.tsx     ← DashboardShell wraps all dashboard pages
    page.tsx       → renders at URL "/"
    transactions/
      page.tsx     → renders at URL "/transactions"
  (auth)/
    layout.tsx     ← Centered auth layout, no sidebar
    login/
      page.tsx     → renders at URL "/login"
```

### Server vs Client Components

Default: every component in `app/` is a **Server Component**. They run only on the server, can `await` data directly, and never ship their code to the client.

Add `"use client"` when you need:
- React state (`useState`, `useReducer`)
- Effects (`useEffect`)
- Browser APIs (`window`, `document`)
- Event handlers (`onClick`, `onChange`)
- Third-party hooks (Zustand, Framer Motion, React Hook Form)

**Rule of thumb:** Push `"use client"` as deep as possible. A Server Component can import a Client Component, but a Client Component cannot import a Server Component (it would become client-side).

### Loading + Error Boundaries

- `loading.tsx` — co-located with `page.tsx`, automatically wraps the page in a `<Suspense>` boundary
- `error.tsx` — must be `"use client"`, automatically wraps page in an error boundary
- These compose: loading shows during navigation, error shows on runtime exception

---

## 11. TypeScript Patterns in This Codebase

### Money Values

```typescript
// DB: Decimal (Prisma maps this to string on the client)
// Runtime: number (after parseFloat)
// Display: formatCurrency(amount) → "$8,500.00"
```

Never arithmetic on currency strings. Always parse to number first, format to string last.

### Discriminated Unions

```typescript
type Transaction = {
  type: "income";
  amount: number; // always positive
} | {
  type: "expense";
  amount: number; // always negative
};
```

This makes it impossible to have `type: "income"` with a negative amount — the type system enforces the invariant.

### Type-Safe Zustand

```typescript
// Don't use `any` for set/get types
const useStore = create<StoreType>()((set, get) => ({
  // TypeScript infers all types from StoreType
}));

// Use z.infer for Zod-derived types
type LoginData = z.infer<typeof loginSchema>;
```

---

## 12. Production Readiness Checklist

Before deploying to Vercel:

### Security
- [ ] Replace mock auth with real Auth.js session validation
- [ ] All Server Actions start with `const session = await auth()`
- [ ] `userId` never read from client/form data
- [ ] Rate limiting on auth endpoints (Upstash Redis + @upstash/ratelimit)
- [ ] Content Security Policy headers in `next.config.ts`
- [ ] `.env.local` is gitignored, never committed

### Performance
- [ ] All images use `next/image` with explicit `width` and `height`
- [ ] Dynamic imports for all 3D components (`ssr: false`)
- [ ] `dpr={[1, 1.5]}` on all Canvas elements
- [ ] Route prefetching via `<Link prefetch>` on nav items

### Accessibility
- [ ] All modals have `role="dialog"` and `aria-modal="true"`
- [ ] Command palette has `role="combobox"` + `aria-expanded`
- [ ] All icon-only buttons have `aria-label`
- [ ] Color contrast ratio ≥ 4.5:1 for text
- [ ] Focus trap in all modals
- [ ] `prefers-reduced-motion` check before playing animations

### SEO
- [ ] Every page has unique `title` and `description` metadata
- [ ] Root layout has `openGraph` and `twitter` cards
- [ ] `not-found.tsx` returns 404 status (App Router does this automatically)
- [ ] `sitemap.ts` generated for public pages

### Monitoring
- [ ] Sentry for error tracking (`@sentry/nextjs`)
- [ ] Vercel Analytics for performance
- [ ] Structured logging for Server Actions
