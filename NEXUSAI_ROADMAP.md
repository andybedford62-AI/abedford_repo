# NexusAI — MVP & Launch Roadmap

## Legend
- 🔴 URGENT — Blocking or security risk, fix before any real users
- 🟡 MVP — Required before public launch
- 🟢 NICE TO HAVE — Post-launch improvements
- ✅ DONE — Already built

---

## Authentication & Security

- ✅ Email + password login/register
- ✅ NextAuth JWT session
- ✅ Password change in settings
- 🔴 **Forgot password / reset email flow** — `/forgot-password` link exists on login page but page returns 404
- 🔴 **Email verification on signup** — users register with any email and are immediately active
- 🔴 **Rate limiting on API routes** — no protection against brute force or abuse (login, register, invite endpoints especially)
- 🟡 OAuth (GitHub / Google) — buttons exist on login but providers likely not configured in Vercel env (need GITHUB_ID, GITHUB_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
- 🟡 Session expiry / remember me option
- 🟢 Two-factor authentication (2FA)
- 🟢 SSO / SAML for enterprise

---

## Pages & Navigation

- ✅ Landing page
- ✅ Login / Register
- ✅ Dashboard
- ✅ Projects list + board
- ✅ Channels / messaging
- ✅ Team management + invite
- ✅ Settings (workspace, notifications, security, appearance)
- ✅ Super Admin panel
- ✅ Accept invite landing page
- 🔴 **404 page** — missing custom page, Next.js shows default
- 🔴 **500 / error page** — no custom error boundary
- 🟡 **Terms of Service page** — `/terms` linked from register form, currently 404
- 🟡 **Privacy Policy page** — `/privacy` linked from register form, currently 404
- 🟡 **Forgot password page** — linked from login, currently 404
- 🟡 Onboarding wizard for first-time users (after register, guide them through workspace setup)
- 🟢 Public project / portfolio view (share a read-only project link)
- 🟢 Status page

---

## Projects & Tasks

- ✅ Create project (with template wizard — just added)
- ✅ Kanban board with columns and drag-and-drop tasks
- ✅ Task creation with priority, assignee, due date
- 🟡 **Task detail / edit view** — currently tasks can only be created; need a click-to-open detail modal with edit, comments, attachments
- 🟡 **Task comments** — no way to discuss a specific task
- 🟡 **File attachments on tasks** — need cloud storage (Vercel Blob or S3)
- 🟡 **Task search** — no global search exists anywhere in the app
- 🟡 **Task filters** — filter board by assignee, priority, due date
- 🟡 **Project progress indicator** — % complete based on Done column count
- 🟢 Calendar / timeline view (Gantt-style)
- 🟢 Task dependencies (block/blocked by)
- 🟢 Recurring tasks
- 🟢 Time tracking per task
- 🟢 Custom fields on tasks
- 🟢 Task import (CSV)
- 🟢 Task export (CSV / PDF)
- 🟢 Milestones / epics

---

## Team & Workspace

- ✅ Workspace create / rename / delete
- ✅ Invite by email (existing user adds directly, new user gets email link)
- ✅ Role management (Owner, Admin, Member, Viewer)
- ✅ Remove members
- 🟡 **Multiple workspaces per user** — currently a user is locked to their first workspace; no workspace switcher
- 🟡 **Pending invites list** — show sent invites that haven't been accepted yet, with option to resend/cancel
- 🟡 **Viewer role enforcement** — Viewer role exists in DB but no UI/API gate preventing Viewers from creating tasks
- 🟢 Guest access (outside workspace, scoped to specific project)
- 🟢 Workspace transfer (change owner)
- 🟢 Teams / groups within a workspace

---

## Messaging & Channels

- ✅ Public channels with messages
- 🟡 **Real-time messages** — currently requires page refresh; need WebSockets or polling (Pusher, Ably, or Next.js SSE)
- 🟡 **Direct messages** (1:1 between members)
- 🟡 **File sharing in channels**
- 🟡 **Message reactions / emoji**
- 🟡 **@mentions** with notifications
- 🟢 Thread replies
- 🟢 Message search
- 🟢 Pin messages
- 🟢 Channel archiving

---

## Notifications

- 🔴 **Notification system** — bell icon in navbar appears to exist but notifications may not be wired or shown
- 🟡 In-app notification dropdown (task assigned, mentioned, invite accepted)
- 🟡 Email notifications (task due soon, new message)
- 🟡 Notification preferences per event type
- 🟢 Push notifications (browser / mobile)
- 🟢 Slack / Teams integration for alerts
- 🟢 Weekly digest email

---

## AI Assistant

- ✅ Chat with Claude (claude-haiku-4-5-20251001)
- ✅ Conversation persistence
- 🟡 **AI context awareness** — AI currently has no knowledge of the user's projects, tasks, or workspace; feed relevant context in the system prompt
- 🟡 **AI actions** — let AI create tasks, summarize boards, or draft messages directly
- 🟢 Per-project AI chat
- 🟢 AI-generated project summaries / status reports
- 🟢 AI task prioritization suggestions

---

## Billing & Monetization

- 🟡 **Stripe integration** — no subscription/billing exists; needed before public launch
- 🟡 Plan tiers (Free, Pro, Team, Enterprise)
- 🟡 Usage limits per plan (# of members, projects, AI messages)
- 🟡 Billing portal (manage subscription, invoices)
- 🟡 Trial period logic
- 🟢 Annual vs monthly billing toggle
- 🟢 Seat-based pricing
- 🟢 Coupon / promo code support

---

## Infrastructure & DevOps

- ✅ Vercel deployment (andybedford62aiabedfordrepo)
- ✅ Neon PostgreSQL database
- ✅ Resend for transactional email
- 🔴 **Environment variable documentation** — document all required env vars in one place so setup is repeatable
- 🟡 **Database backups** — confirm Neon automated backups are enabled
- 🟡 Staging environment (separate Vercel project + DB for testing)
- 🟡 Error monitoring (Sentry or Vercel's built-in)
- 🟡 Logging / observability
- 🟡 Custom domain + SSL (replace vercel.app URL)
- 🟢 CDN for static assets
- 🟢 Edge caching for API routes
- 🟢 Database connection pooling (PgBouncer / Neon serverless driver)

---

## Mobile & UX

- 🟡 **Mobile responsiveness audit** — sidebar, kanban board, and team page likely need work on small screens
- 🟡 **Loading skeletons** — most pages show spinner; skeleton UI improves perceived performance
- 🟡 **Empty states** — no tasks, no channels, new workspace should guide the user, not show blank space
- 🟢 Native mobile app (React Native / Expo)
- 🟢 Progressive Web App (PWA) support
- 🟢 Keyboard shortcuts
- 🟢 Accessibility audit (WCAG 2.1 AA)

---

## Analytics & Reporting

- 🟢 Workspace activity feed / audit log (actions like "Jane created task X")
- 🟢 Project velocity / burn-down chart
- 🟢 Team workload view (who has too many tasks)
- 🟢 Admin analytics dashboard (platform-wide metrics)

---

## Integrations

- 🟢 GitHub (link PRs to tasks)
- 🟢 Slack (channel notifications)
- 🟢 Zapier / Make webhook support
- 🟢 Google Calendar sync for due dates
- 🟢 REST API + API keys for external apps

---

## Project Setup Checklist (per new project)

When creating a new project, the wizard now guides through:
- ✅ Choose a template (Kanban, Scrum, Simple, Bug Tracker, Content Calendar)
- ✅ Name, description, color, due date
- ✅ Columns auto-created from template
- 🟡 Assign team members to project at creation time
- 🟡 Create first task / milestone during setup
- 🟢 Upload a project brief / document
- 🟢 Set project-level goals / OKRs

---

## Quick Win Priority Order

1. 🔴 Custom 404/500 pages
2. 🔴 Forgot password flow
3. 🔴 Terms + Privacy pages (even placeholder)
4. 🔴 Rate limiting (at minimum on `/api/auth`)
5. 🟡 Task detail modal with edit + comments
6. 🟡 Notification dropdown wired up
7. 🟡 Real-time messages (polling as quick fix, WebSockets later)
8. 🟡 Mobile responsiveness fixes
9. 🟡 Stripe billing
10. 🟡 OAuth provider setup (GitHub/Google)
