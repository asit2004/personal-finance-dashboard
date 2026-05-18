# 🏦 FinanceAI — Market-Ready Product Brief & Implementation Plan

> **Status:** In Development · **Phase:** 3 of 7 · **Target:** Production SaaS
> **Stack:** Next.js · MongoDB · Auth.js · OpenRouter · Upstash · Resend

---

## 📌 Table of Contents

1. [Product Vision](#1-product-vision)
2. [Target Audience](#2-target-audience)
3. [Core Features](#3-core-features)
4. [System Architecture](#4-system-architecture)
5. [Folder Structure](#5-folder-structure)
6. [Database Schema](#6-database-schema)
7. [API Design](#7-api-design)
8. [AI Systems](#8-ai-systems)
9. [Phase-by-Phase Roadmap](#9-phase-by-phase-roadmap)
10. [New UI Pages](#10-new-ui-pages)
11. [Engineering Decisions](#11-engineering-decisions)
12. [Environment Variables](#12-environment-variables)
13. [Priority Build Order](#13-priority-build-order)

---

## 1. Product Vision

> *"Apple-level financial intelligence for Gen Z users."*

**FinanceAI is NOT** another boring expense tracker.

**FinanceAI IS** an AI-native financial intelligence platform that:
- Automatically tracks and categorizes spending
- Intelligently detects recurring subscriptions
- Provides AI-powered financial coaching
- Visualizes money behavior beautifully
- Improves financial discipline over time

### Design Inspiration
| App | What We Steal |
|-----|--------------|
| CRED | Premium card UI, reward psychology, dark glassmorphism |
| Jupiter | Clean transaction flow, smart insights, India-first |
| Linear | Keyboard shortcuts, command palette, minimal clutter |
| Stripe Dashboard | Data density, chart quality, typography |
| Apple Wallet | Simplicity, animation quality, trust signals |

---

## 2. Target Audience

### Primary Users
- 🎓 College students
- 👨‍💻 Young professionals (22–32)
- 🧑‍🎨 Freelancers
- 🚀 Startup founders
- ⚡ Gen Z users

### User Pain Points
| Pain | Current Reality |
|------|----------------|
| Multiple payment apps | No unified view |
| Blind spending habits | No automatic tracking |
| Subscription creep | Don't know what they're paying for |
| Budgeting failure | Manual, boring, forgotten |
| No financial coaching | Generic YouTube advice |

---

## 3. Core Features

### ✅ MVP Features (Build Now)

#### 3.1 Authentication
- Email + password with bcrypt hashing
- Google OAuth via Auth.js
- JWT sessions (server-side, httpOnly cookies)
- Rate-limited login (5 attempts → 15 min lockout)

#### 3.2 Expense Tracking
Users can:
- Add expenses manually
- Import bank statements (CSV)
- Paste SMS transaction alerts
- View categorized, searchable transaction history

**Transaction Shape:**
```typescript
{
  amount: number           // positive = income, negative = expense
  merchant: string
  category: TransactionCategory
  paymentMethod: "upi" | "card" | "cash" | "netbanking" | "wallet"
  date: Date
  recurring: boolean
  source: "manual" | "sms" | "csv"
}
```

#### 3.3 AI Expense Categorization
Auto-detect categories using rule-based engine (Phase 1) → ML (Phase 2):
| Merchant | Category |
|----------|----------|
| Swiggy, Zomato | Food |
| Uber, Ola, Rapido | Transport |
| Netflix, Spotify, Prime | Entertainment |
| HDFC EMI, SBI | Finance |
| Apollo, Practo | Health |
| Byju's, Udemy | Education |

**Phase 1:** 200+ merchant lookup rules + keyword patterns
**Phase 2:** Fine-tuned classification model via OpenRouter

#### 3.4 Finance Dashboard
- Monthly spending overview
- Spending by category (pie/donut charts)
- Budget progress rings
- Savings trends (area chart)
- Recent transactions feed
- Subscription cost summary
- Financial health score

#### 3.5 AI Financial Coach
Real insights, not generic advice:
- *"You spent 27% more on food this month — ₹4,200 extra vs last month."*
- *"Your subscriptions cost ₹2,149/month. 3 of them are unused."*
- *"At this rate, you'll exceed your food budget in 8 days."*
- *"Reducing Swiggy to 3x/week saves you ₹18,000/year."*

#### 3.6 Subscription Detector
Auto-detect recurring payments:
- Pattern recognition across 6 months of transactions
- Match against known subscription brands
- Renewal countdown + reminder emails
- Monthly subscription spend total
- Cancellation suggestions for low-usage subscriptions

#### 3.7 Smart Budgeting
- Create category budgets
- Set percentage-based alert thresholds (default: 80%)
- AI-recommended budget limits based on historical spending
- Visual progress with color-coded warnings

#### 3.8 Financial Health Score
Score (0–100) across 5 weighted pillars:
| Pillar | Weight | Ideal |
|--------|--------|-------|
| Savings Rate | 25% | Save >33% of income |
| Budget Adherence | 25% | Stay under all budgets |
| Expense Diversity | 20% | No single category >30% |
| Subscription Efficiency | 15% | Subscriptions <5% of income |
| Month-over-Month Consistency | 15% | Stable or improving |

**Grades:** 90+ Excellent · 75+ Good · 60+ Fair · <60 Needs Work

---

### 🔮 Future Features

#### Phase 2
- OCR receipt scanner (camera → transaction)
- Voice transaction input ("Add ₹200 Swiggy order")
- Predictive spending alerts
- AI finance chatbot (conversational)

#### Phase 3
- UPI integration (RBI compliance required)
- QR code payments
- Split expenses (Splitwise-style)
- Investment portfolio tracking
- Mutual fund performance overlay

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                         │
│  Next.js · React · TypeScript · Tailwind v4 · Framer Motion │
│  Recharts · R3F · Zustand · Zod                             │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS
┌─────────────────────▼───────────────────────────────────────┐
│                  NEXT.JS SERVER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  App Router  │  │  API Routes  │  │  Server Actions  │  │
│  │  (RSC + CC)  │  │  /api/*      │  │  (mutations)     │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Auth.js    │  │  Middleware  │  │   Rate Limiter   │  │
│  │  (sessions)  │  │  (protect)   │  │  (Upstash Redis) │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└────────┬──────────────────────┬──────────────────────────────┘
         │                      │
┌────────▼──────┐    ┌──────────▼──────────────────────────┐
│   MongoDB     │    │      EXTERNAL SERVICES               │
│  (Mongoose)   │    │  OpenRouter AI  — insight generation │
│               │    │  Upstash Redis  — rate limit + cache │
│  Collections: │    │  Resend         — transactional email│
│  - users      │    │  Cloudinary     — avatar uploads     │
│  - txns       │    └─────────────────────────────────────┘
│  - budgets    │
│  - subscrs    │
│  - insights   │
└───────────────┘
```

**Why Next.js API routes instead of Express?**
Same Node.js runtime. Shared TypeScript types between client and server. No CORS config. Single deployment. For MVP scale (<100k users), there is no measurable performance difference. Extract to microservices only when you hit real bottlenecks.

---

## 5. Folder Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── page.tsx                  ← Main dashboard
│   │   ├── transactions/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx         ← Transaction detail
│   │   ├── budgets/page.tsx
│   │   ├── subscriptions/page.tsx    ← NEW
│   │   ├── analytics/page.tsx
│   │   ├── insights/page.tsx
│   │   ├── score/page.tsx            ← NEW: Health score
│   │   ├── settings/page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   ├── transactions/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── budgets/route.ts
│   │   ├── subscriptions/route.ts
│   │   ├── insights/
│   │   │   ├── route.ts
│   │   │   └── generate/route.ts
│   │   ├── categorize/route.ts
│   │   ├── score/route.ts
│   │   ├── import/
│   │   │   ├── sms/route.ts
│   │   │   └── csv/route.ts
│   │   └── user/route.ts
│   ├── layout.tsx
│   ├── globals.css
│   └── not-found.tsx
│
├── components/
│   ├── 3d/
│   ├── charts/
│   ├── dashboard/
│   │   ├── overview-cards.tsx
│   │   ├── spending-chart.tsx
│   │   ├── budget-rings.tsx
│   │   └── recent-transactions.tsx
│   ├── layout/
│   ├── transactions/
│   │   ├── transaction-list.tsx
│   │   ├── transaction-row.tsx
│   │   ├── add-transaction-modal.tsx
│   │   └── import-modal.tsx
│   ├── budgets/
│   ├── subscriptions/
│   │   ├── subscription-card.tsx
│   │   └── subscription-detector.tsx
│   ├── insights/
│   │   ├── insight-card.tsx
│   │   └── ai-coach.tsx
│   ├── score/
│   │   └── health-score-ring.tsx
│   └── ui/
│
├── lib/
│   ├── db/
│   │   ├── mongoose.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Transaction.ts
│   │   │   ├── Budget.ts
│   │   │   ├── Subscription.ts
│   │   │   └── Insight.ts
│   │   └── queries/
│   │       ├── transactions.ts
│   │       ├── budgets.ts
│   │       └── insights.ts
│   ├── ai/
│   │   ├── categorizer.ts
│   │   ├── insight-generator.ts
│   │   ├── subscription-detector.ts
│   │   └── score-engine.ts
│   ├── parsers/
│   │   ├── sms-parser.ts
│   │   └── csv-parser.ts
│   ├── validations/
│   │   ├── transaction.ts
│   │   ├── budget.ts
│   │   └── user.ts
│   ├── animations.ts
│   ├── utils.ts
│   └── constants.ts
│
├── store/
│   ├── useUIStore.ts
│   ├── useTransactionStore.ts
│   ├── useAuthStore.ts
│   └── useBudgetStore.ts
│
├── hooks/
│   ├── use-transactions.ts
│   ├── use-budgets.ts
│   ├── use-insights.ts
│   ├── use-media-query.ts
│   └── use-mouse-position.ts
│
├── types/
│   ├── index.ts
│   ├── api.ts
│   └── next-auth.d.ts
│
└── middleware.ts
```

---

## 6. Database Schema

### User Collection
```typescript
{
  _id: ObjectId,
  name: string,
  email: string,             // unique index
  password: string,          // bcrypt hashed, undefined for OAuth users
  avatar?: string,           // Cloudinary URL
  plan: "free" | "pro" | "enterprise",
  currency: "INR" | "USD",   // default INR
  onboardingComplete: boolean,
  monthlyIncome?: number,
  savingsGoal?: number,
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId,          // indexed
  description: string,
  merchant: string,
  amount: number,            // positive = income, negative = expense
  type: "income" | "expense",
  category: TransactionCategory,
  subCategory?: string,
  paymentMethod: "upi" | "card" | "cash" | "netbanking" | "wallet",
  date: Date,                // indexed
  recurring: boolean,
  recurringInterval?: "daily" | "weekly" | "monthly" | "yearly",
  tags: string[],
  note?: string,
  status: "completed" | "pending" | "failed",
  source: "manual" | "sms" | "csv" | "api",
  rawSmsText?: string,
  createdAt: Date
}
// Indexes: { userId: 1, date: -1 }, { userId: 1, category: 1 }
```

### Budget Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  category: TransactionCategory,
  name: string,
  limit: number,
  period: "weekly" | "monthly" | "yearly",
  color: string,
  alertAt: number,           // 0-100 percent, default 80
  active: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Subscription Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  name: string,
  amount: number,
  currency: string,
  billingCycle: "monthly" | "yearly" | "weekly",
  nextRenewal: Date,
  category: "streaming" | "saas" | "health" | "news" | "other",
  status: "active" | "paused" | "cancelled",
  detectedAt: Date,
  logo?: string,
  transactionIds: ObjectId[]
}
```

### Insight Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  title: string,
  body: string,
  type: "warning" | "success" | "tip" | "info",
  impact: "high" | "medium" | "low",
  category?: TransactionCategory,
  actionLabel?: string,
  actionUrl?: string,
  read: boolean,
  generatedAt: Date,
  expiresAt: Date            // TTL index — auto-delete after 7 days
}
```

---

## 7. API Design

```
POST   /api/auth/register
POST   /api/auth/[...nextauth]

GET    /api/transactions          ?page, limit, search, category, type, dateFrom, dateTo
POST   /api/transactions
GET    /api/transactions/:id
PATCH  /api/transactions/:id
DELETE /api/transactions/:id
GET    /api/transactions/stats

GET    /api/budgets
POST   /api/budgets
PATCH  /api/budgets/:id
DELETE /api/budgets/:id

GET    /api/subscriptions
POST   /api/subscriptions
PATCH  /api/subscriptions/:id
POST   /api/subscriptions/detect

POST   /api/categorize
POST   /api/insights/generate
GET    /api/insights
GET    /api/score

POST   /api/import/csv
POST   /api/import/sms

GET    /api/user
PATCH  /api/user
POST   /api/user/onboarding
```

**Standard API response shape:**
```typescript
// Success
{ data: T, meta?: { page, total, limit } }

// Error
{ error: string, code: string, statusCode: number }
```

---

## 8. AI Systems

### 8.1 Rule-Based Categorizer
```
Input  → merchant name + description
Step 1 → normalize (lowercase, trim, remove punctuation)
Step 2 → exact merchant lookup (200+ rules)
          "swiggy" → food
          "netflix" → entertainment
          "hdfc emi" → finance
Step 3 → keyword pattern match on description
          "salary" → salary
          "rent" → housing
Step 4 → fallback → "other"
Output → { category, confidence, method }
```

### 8.2 Subscription Detector
```
Algorithm:
1. Fetch 6 months of transactions
2. Group by normalized merchant
3. Check for amount repeating at ±3 day intervals (monthly)
4. Match against known subscription brand list
5. Create Subscription document if ≥2 pattern matches
Runs: on import + monthly cron job
```

### 8.3 Financial Health Score
```
Score (0–100) = weighted sum of:
  Savings Rate       25% → min(100, savings/income * 300)
  Budget Adherence   25% → avg(budgets: 1 - spent/limit)
  Expense Diversity  20% → penalize >30% in one category
  Subscription Eff.  15% → penalize subscriptions >5% income
  Consistency        15% → month-over-month stability
```

### 8.4 OpenRouter AI Insights
```
Trigger → POST /api/insights/generate
Model   → mistralai/mistral-7b-instruct (~$0.001/call)
Input   → last 30 days spending + budgets + score
Output  → 5 specific, actionable JSON insights
Cache   → MongoDB, 24h TTL, regenerate via Vercel Cron
```

### 8.5 SMS Parser (Indian Banks)
```
Supported: SBI, HDFC, ICICI, Axis, Kotak, PNB, Canara
Regex captures: amount, merchant, account last 4, date
Example:
  "HDFC Bank: Rs.250.00 debited from a/c XX1234 on 12-05-25
   to VPA swiggy@ybl. Ref No 123456789"
→ { amount: -250, merchant: "Swiggy", method: "upi", date: "2025-05-12" }
```

---

## 9. Phase-by-Phase Roadmap

### ✅ Phase 1 — Foundation (COMPLETE)
- [x] Next.js App Router setup
- [x] Tailwind v4 design system
- [x] All dashboard pages (UI)
- [x] Dark/light theme
- [x] Responsive layout
- [x] Framer Motion animations
- [x] 3D hero elements (R3F)
- [x] Recharts integration

### ✅ Phase 2 — Core UI (COMPLETE)
- [x] Animated charts + skeletons
- [x] Error boundaries
- [x] SEO metadata
- [x] Loading states
- [x] Command palette (⌘K)
- [x] Add transaction modal
- [x] Zustand stores (UI, Transaction, Auth)
- [x] Auth pages (login/register)
- [x] Mock middleware

### 🔄 Phase 3 — Database + Real Auth (NOW)
- [ ] MongoDB Atlas setup
- [ ] Mongoose models (User, Transaction, Budget, Subscription, Insight)
- [ ] Auth.js with credentials + Google OAuth
- [ ] Transaction CRUD API routes
- [ ] Budget CRUD API routes
- [ ] Replace all mock data with real DB calls
- [ ] Data fetching hooks (SWR)

### ⏳ Phase 4 — AI Intelligence (Week 2)
- [ ] Rule-based categorizer (200+ rules)
- [ ] Subscription detector algorithm
- [ ] Financial health score engine
- [ ] SMS parser (Indian banks)
- [ ] CSV bank statement import
- [ ] Subscriptions page UI
- [ ] Score page UI with animated gauge

### ⏳ Phase 5 — OpenRouter AI (Week 3)
- [ ] OpenRouter integration
- [ ] AI insight generation + 24h caching
- [ ] Spending prediction alerts
- [ ] AI coach chat UI upgrade
- [ ] Vercel Cron for insight regeneration

### ⏳ Phase 6 — Production Polish (Week 4)
- [ ] Rate limiting (Upstash Redis)
- [ ] Email notifications (Resend)
- [ ] Onboarding flow
- [ ] Sentry error tracking
- [ ] MongoDB indexes + query optimization
- [ ] Bundle size audit
- [ ] CSP headers
- [ ] Custom domain + Vercel deploy

---

## 10. New UI Pages

### `/subscriptions`
```
Header: Total subscription spend (₹2,149/month)
Cards: One per subscription with logo, amount, renewal date, status badge
Actions: Mark as cancelled, view transaction history
Alert: "3 subscriptions renewing this week"
```

### `/score`
```
Hero: Animated circular gauge (0-100)
Grade label: "GOOD" / "EXCELLENT" / "NEEDS WORK"
Breakdown: 5 pillar progress bars with explanations
History: Score trend over last 6 months
Tips: "Do X to improve your score by ~8 points"
```

---

## 11. Engineering Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Backend | Next.js API routes | Shared types, no CORS, single deploy |
| Database | MongoDB + Mongoose | Flexible schema for messy bank data |
| Auth | Auth.js v5 | OAuth + credentials, production-battle-tested |
| AI | OpenRouter Mistral 7B | $0.001/call vs $0.01 OpenAI, sufficient for finance |
| Cache | Upstash Redis | Serverless-native, rate limiting + insight cache |
| Email | Resend | Best DX, 3000/month free |
| Charts | Recharts | Already integrated, sufficient for MVP |
| State | Zustand | Already integrated, zero boilerplate |
| Validation | Zod | Client + server shared schemas |
| Currency | INR primary | India-first market (Swiggy, Zomato, UPI use cases) |

---

## 12. Environment Variables

```bash
# Database
MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/financeai"

# Auth
AUTH_SECRET=""                    # openssl rand -base64 32
NEXTAUTH_URL="https://yourdomain.vercel.app"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# AI
OPENROUTER_API_KEY=""
OPENROUTER_MODEL="mistralai/mistral-7b-instruct"

# Cache + Rate Limiting
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# Email
RESEND_API_KEY=""
RESEND_FROM_EMAIL="noreply@financeai.com"

# App
NEXT_PUBLIC_APP_URL="https://yourdomain.vercel.app"
NEXT_PUBLIC_CURRENCY="INR"
```

---

## 13. Priority Build Order

```
WEEK 1 — Ship real backend
  1.  MongoDB Atlas account (free tier M0)
  2.  lib/db/mongoose.ts — connection singleton
  3.  lib/db/models/User.ts
  4.  lib/db/models/Transaction.ts
  5.  lib/db/models/Budget.ts
  6.  Auth.js setup — credentials provider
  7.  Google OAuth wiring
  8.  POST /api/auth/register
  9.  GET+POST /api/transactions
  10. PATCH+DELETE /api/transactions/:id
  11. GET+POST /api/budgets
  12. Replace mock data everywhere

WEEK 2 — Intelligence layer
  13. lib/ai/categorizer.ts (200+ merchant rules)
  14. Auto-categorize on transaction create
  15. lib/ai/subscription-detector.ts
  16. POST /api/subscriptions/detect
  17. /subscriptions page UI
  18. lib/ai/score-engine.ts
  19. GET /api/score
  20. /score page UI + animated gauge
  21. lib/parsers/sms-parser.ts
  22. lib/parsers/csv-parser.ts

WEEK 3 — AI coach
  23. OpenRouter integration
  24. POST /api/insights/generate
  25. Insight caching (MongoDB TTL)
  26. Vercel Cron job (daily insight refresh)
  27. AI coach UI upgrade
  28. Spending prediction alerts

WEEK 4 — Production
  29. Upstash rate limiting
  30. Resend email (budget alerts + weekly digest)
  31. User onboarding flow
  32. Sentry setup
  33. Performance audit
  34. Custom domain
  35. Launch 🚀
```

---

*Generated: 2026-05-18 · Version: 1.0 · Author: FinanceAI Engineering*
