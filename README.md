# NexusAI — AI-Powered SaaS Team Workspace

> The AI-first workspace for modern teams. Better than any co-working tool.

![NexusAI](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma)
![Claude](https://img.shields.io/badge/Claude-Sonnet_4.6-violet?logo=anthropic)

---

## What is NexusAI?

NexusAI is a **full-stack SaaS workspace platform** that combines:

| Feature | Description |
|---|---|
| 🤖 **Claude AI Assistant** | Streaming AI chat powered by claude-sonnet-4-6 with conversation history |
| 📋 **Kanban Project Boards** | Drag-and-drop task management with custom columns, priorities & assignments |
| 💬 **Real-time Team Chat** | Channels, reactions, file sharing — full Slack-style messaging |
| 📊 **Analytics Dashboard** | Team velocity, completion rates, AI usage with Recharts |
| 👥 **Multi-tenant Workspaces** | Multiple orgs, role-based access (Owner/Admin/Member/Viewer) |
| 💳 **Stripe Billing** | Free/Starter/Pro/Enterprise plans with webhooks |
| 🔐 **Auth (NextAuth v5)** | Credentials + GitHub + Google OAuth, JWT sessions |
| 📄 **Document Collaboration** | Rich documents linked to projects |

---

## Tech Stack

- **Framework**: Next.js 14 (App Router, RSC, Server Actions)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + custom design system
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js v5 (beta) with Prisma adapter
- **AI**: Anthropic Claude API (`@anthropic-ai/sdk`) with SSE streaming
- **Billing**: Stripe (Checkout, Webhooks, Subscriptions)
- **Real-time**: Pusher (channels + events)
- **Charts**: Recharts
- **State**: Zustand + TanStack Query
- **UI**: Radix UI primitives + custom components

---

## Project Structure

```
nexusai/
├── app/
│   ├── (auth)/                  # Login & Register pages
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/             # Protected app routes
│   │   ├── layout.tsx           # Dashboard shell (sidebar + topbar)
│   │   ├── dashboard/page.tsx   # Main dashboard
│   │   ├── projects/            # Kanban board & project management
│   │   ├── ai/page.tsx          # Claude AI assistant
│   │   ├── chat/page.tsx        # Team messaging
│   │   ├── analytics/page.tsx   # Charts & insights
│   │   ├── team/page.tsx        # Member management
│   │   └── settings/            # Workspace & billing settings
│   ├── api/
│   │   ├── auth/                # NextAuth + registration
│   │   ├── ai/chat/             # Claude streaming API
│   │   ├── tasks/               # CRUD task operations
│   │   ├── projects/            # Project management
│   │   └── billing/             # Stripe checkout + webhooks
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing page
├── components/
│   ├── dashboard/               # Sidebar, Topbar
│   ├── projects/                # KanbanBoard, ProjectHeader
│   └── analytics/               # AnalyticsDashboard (Recharts)
├── lib/
│   ├── db.ts                    # Prisma client singleton
│   ├── utils.ts                 # Utilities & helpers
│   └── stripe.ts                # Stripe client + plan configs
├── prisma/
│   ├── schema.prisma            # Full DB schema (17 models)
│   └── seed.ts                  # Demo data seeder
├── auth.ts                      # NextAuth config
└── middleware.ts                 # Route protection
```

---

## Quick Start

### 1. Clone & Install
```bash
git clone <repo> nexusai
cd nexusai
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
# Fill in: DATABASE_URL, AUTH_SECRET, ANTHROPIC_API_KEY, STRIPE keys, PUSHER keys
```

### 3. Setup Database
```bash
npm run db:push       # Push schema to DB
npm run db:generate   # Generate Prisma client
npm run db:seed       # Seed demo data
```

### 4. Run Development Server
```bash
npm run dev
# Open http://localhost:3000
```

### Demo Login
```
Email:    alice@nexusai.demo
Password: demo123!
```

---

## Key Features Deep Dive

### 🤖 Claude AI Assistant
- Streaming responses via SSE (`ReadableStream`)
- Conversation history with 20-message context window
- Workspace-aware system prompt
- Saved conversations with titles
- Markdown rendering (code blocks, headers, lists)
- Quick prompt suggestions

### 📋 Kanban Board
- HTML5 drag-and-drop across columns
- Optimistic UI updates with server sync
- Priority levels: Low / Medium / High / Urgent
- Task detail slide-over panel
- Inline task creation per column
- Progress tracking per project

### 💳 Stripe Integration
- Checkout session creation
- Webhook handler (subscription lifecycle)
- Plan enforcement per workspace
- Annual billing toggle (20% discount)
- Customer portal support

### 🔐 Multi-tenant Auth
- Workspace isolation via `workspaceId`
- Role-based access: OWNER → ADMIN → MEMBER → VIEWER
- Middleware protecting all `/dashboard/*` routes
- OAuth (GitHub, Google) + email/password

---

## Database Schema

17 Prisma models:
- `User`, `Account`, `Session`, `VerificationToken`
- `Workspace`, `WorkspaceMember`, `WorkspaceInvite`
- `Project`, `Column`, `Task`, `TaskComment`, `Attachment`
- `Document`
- `Channel`, `Message`, `MessageReaction`
- `AiConversation`, `AiMessage`
- `Notification`, `ActivityLog`

---

## Deployment

Deploy to Vercel in one click:
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Set up PostgreSQL (Vercel Postgres / Supabase / Neon)
5. Configure Stripe webhook endpoint: `https://yourdomain.com/api/billing/webhook`

---

## License

MIT © NexusAI
