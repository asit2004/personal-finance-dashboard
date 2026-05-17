# FinanceAI — Implementation Plan

## Phase 3 Feature Set: Auth, Command Palette, Add Transaction Modal, Zustand Stores

---

## 1. Zustand Store Architecture

### Store Topology

```
src/store/
  useUIStore.ts          ← Modal visibility, sidebar state
  useTransactionStore.ts ← Transaction list, filters, optimistic updates
  useAuthStore.ts        ← User session, auth status
```

### `useUIStore` (complete)

Manages UI-only state that multiple unrelated components need simultaneously.

- `commandPaletteOpen` / `openCommandPalette()` / `closeCommandPalette()`
- `addTransactionOpen` / `openAddTransaction()` / `closeAddTransaction()`
- `sidebarCollapsed` / `toggleSidebar()` / `setSidebarCollapsed(collapsed)`

**Why Zustand here instead of prop drilling:** Header needs to open the command palette, DashboardShell needs to render it, and the Sidebar needs to know if it's collapsed — three sibling subtrees with shared state.

---

### `useTransactionStore` (target shape)

```typescript
interface TransactionStore {
  transactions: Transaction[];
  filters: TransactionFilters;
  isLoading: boolean;

  setTransactions: (txns: Transaction[]) => void;
  addTransaction: (txn: Transaction) => void;       // optimistic
  removeTransaction: (id: string) => void;           // optimistic
  setFilter: (key: keyof TransactionFilters, value: unknown) => void;
  resetFilters: () => void;
}

interface TransactionFilters {
  search: string;
  type: "all" | "income" | "expense";
  category: string | null;
  dateFrom: string | null;
  dateTo: string | null;
}
```

Seeded from `mockTransactions` at initialisation. When DB is wired, swap the seed for a Server Action call in a `useEffect` inside a client-side data hook.

---

### `useAuthStore` (target shape)

```typescript
interface AuthStore {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: UserProfile | null) => void;
  logout: () => void;
}
```

Seeded from `mockUser` at initialisation. When Auth.js ships, replace with a `useSession()` hook from `next-auth/react` that syncs into this store.

---

## 2. Middleware (Cookie-Based Mock Auth)

**File:** `src/middleware.ts`

```
Route match: /(dashboard)/*, /(api)/*
Protected routes → check cookie `financeai_auth=1`
If missing → redirect to /login
Public routes: /login, /register, /
```

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/transactions", "/budgets", "/analytics", "/insights", "/settings", "/profile"];
// Root "/" also protected since it renders the dashboard

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuth = request.cookies.get("financeai_auth")?.value === "1";
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");

  if (!isAuth && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (isAuth && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next|favicon.ico|public).*)"] };
```

---

## 3. Auth Pages Architecture

### Folder Structure

```
src/app/(auth)/
  layout.tsx          ← Centered layout, gradient background, no sidebar
  login/page.tsx      ← Email + password + OAuth buttons + "remember me"
  register/page.tsx   ← Name + email + password + confirm + terms checkbox
```

### Login Page Components

1. **Logo + headline** — gradient text, tagline
2. **OAuth buttons** — Google + GitHub (2-column grid)
3. **Divider** — "or continue with email"
4. **Email input** with validation
5. **Password input** with toggle visibility
6. **Remember me** checkbox + Forgot password link
7. **Submit button** — loading state, gradient
8. **Footer** — "Don't have an account? Sign up"

### Form Validation (Zod)

```typescript
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  terms: z.literal(true, { errorMap: () => ({ message: "You must accept the terms" }) }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
```

### Mock Auth Flow

1. User submits → validate with Zod
2. Set cookie `financeai_auth=1; path=/; max-age=604800` (7 days)
3. `router.push("/")` → middleware allows through

---

## 4. Command Palette (⌘K)

### Architecture

- `AnimatePresence` wrapper at `DashboardShell` root
- `useEffect` in `DashboardShell` for keyboard listener (`Cmd+K` / `Ctrl+K`)
- Input ref auto-focused on open via `autoFocus`
- `useUIStore.commandPaletteOpen` controls visibility
- Escape key closes palette
- Click-outside-overlay closes palette

### Section Layout

```
┌─────────────────────────────────────────────┐
│ 🔍 Search commands and transactions...       │
├─────────────────────────────────────────────┤
│ NAVIGATE                                     │
│   🏠 Dashboard          /                    │
│   💳 Transactions       /transactions        │
│   📊 Budgets            /budgets             │
│   📈 Analytics          /analytics           │
│   🤖 AI Insights        /insights            │
│   ⚙️  Settings           /settings            │
├─────────────────────────────────────────────┤
│ ACTIONS                                      │
│   ➕ Add Transaction    ⌘T                   │
│   🌙 Toggle Theme       ⌘⇧T                  │
├─────────────────────────────────────────────┤
│ RECENT TRANSACTIONS                          │
│   Netflix Subscription  -$15.99             │
│   Monthly Salary        +$8,500             │
└─────────────────────────────────────────────┘
```

### Filtering Logic

```typescript
const filtered = useMemo(() => {
  if (!query) return allItems;
  return allItems.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );
}, [query, allItems]);
```

### Keyboard Navigation

- `ArrowUp` / `ArrowDown` → move selection index
- `Enter` → execute selected item action
- `Escape` → close
- Selection wraps (last → first, first → last)

---

## 5. Add Transaction Modal

### Architecture

- Mounted once at `DashboardShell` root (not per-page, prevents re-mounts)
- `AnimatePresence` for enter/exit animation
- `useUIStore.addTransactionOpen` controls visibility
- Backdrop click closes modal
- Escape key closes modal
- On submit → `useTransactionStore.addTransaction()` (optimistic)

### Form Fields

| Field       | Type     | Validation                              |
|-------------|----------|-----------------------------------------|
| description | text     | required, min 2 chars                   |
| amount      | number   | required, positive, max 1,000,000       |
| type        | select   | "income" or "expense"                   |
| category    | select   | from CATEGORIES list                    |
| date        | date     | required, not future (optional warning) |
| merchant    | text     | optional                                |
| notes       | textarea | optional, max 500 chars                 |

### Zod Schema

```typescript
const addTransactionSchema = z.object({
  description: z.string().min(2, "Description required"),
  amount: z.coerce.number().positive("Amount must be positive").max(1_000_000),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Category required"),
  date: z.string().min(1, "Date required"),
  merchant: z.string().optional(),
  notes: z.string().max(500).optional(),
});
```

### Animation

```typescript
// Modal backdrop
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}

// Modal panel
initial={{ opacity: 0, scale: 0.95, y: 10 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.95, y: 10 }}
transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] as const }
```

---

## 6. Wiring Checklist

### `DashboardShell`

- [ ] Remove local `useState` for sidebar (use `useUIStore`)
- [ ] Add `useEffect` for `Cmd+K` keyboard shortcut
- [ ] Render `<CommandPalette />` inside `<AnimatePresence>`
- [ ] Render `<AddTransactionModal />` inside `<AnimatePresence>`

### `Header`

- [ ] Import `useUIStore` → call `openCommandPalette()` on search click
- [ ] Import `useUIStore` → call `openAddTransaction()` on plus button click

### `Sidebar`

- [ ] Import `useUIStore` → read `sidebarCollapsed`, call `toggleSidebar()`

### `src/app/(dashboard)/transactions/page.tsx`

- [ ] Import `useTransactionStore` → read `transactions` instead of `mockTransactions`
- [ ] Add "Add Transaction" button that calls `openAddTransaction()`

---

## 7. Common Mistakes to Avoid

1. **Don't pass `useUIStore()` return value as props** — import the hook directly in each component that needs it.

2. **Don't forget `"use client"` on components that use Zustand** — Zustand hooks are client-side only.

3. **Don't mount modals inside page components** — mount them at the shell level to prevent re-mounts on navigation.

4. **Don't `router.push()` inside server components** — use `redirect()` from `next/navigation` for server-side redirects.

5. **Don't read `userId` from form data** — always read from server session.

6. **Don't use `float` for money** — always `Decimal` in DB and formatted with `formatCurrency()`.

7. **Don't use `any` type** — especially in Zod schemas; use `z.infer<typeof schema>` for derived types.

---

## 8. Testing Checklist

Before pushing each feature:

- [ ] `npm run build` passes with zero errors
- [ ] `npm run lint` passes with zero errors  
- [ ] All 10 routes load without console errors
- [ ] Dark/light theme toggle works on auth pages
- [ ] ⌘K opens/closes palette; Escape closes it
- [ ] Arrow keys navigate palette items
- [ ] Add Transaction modal opens/closes; form validates
- [ ] New transaction appears in Transactions page list
- [ ] Mobile: sidebar collapses, hamburger works
- [ ] Mobile: modal fits viewport on small screens
