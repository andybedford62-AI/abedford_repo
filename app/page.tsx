"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight, Bot, Check, ChevronRight, Cpu, Globe, Kanban,
  LayoutDashboard, MessageSquare, Sparkles, Users, Zap,
  BarChart3, Shield, Bell, Star, Menu, X
} from "lucide-react";

// ========================
// Navigation
// ========================
function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0a0a1a]/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-nexus-500 to-violet-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-nexus-600 to-violet-600">
              NexusAI
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "Features", href: "/#features" },
              { label: "Pricing", href: "/#pricing" },
              { label: "About", href: "/#about" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-nexus-500 to-violet-600 text-white text-sm font-medium hover:opacity-90 transition-all shadow-lg shadow-nexus-500/25"
            >
              Start free <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-2">
          {[
            { label: "Features", href: "/#features" },
            { label: "Pricing", href: "/#pricing" },
            { label: "About", href: "/#about" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="block py-2 text-sm font-medium"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            <Link href="/login" className="block py-2 text-center border border-border rounded-lg text-sm font-medium">
              Sign in
            </Link>
            <Link href="/register" className="block py-2 text-center rounded-lg bg-gradient-to-r from-nexus-500 to-violet-600 text-white text-sm font-medium">
              Start free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

// ========================
// Hero Section
// ========================
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-[#060612]">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-nexus-500/20 via-violet-500/20 to-pink-500/20 blur-[120px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-nexus-500/10 rounded-full blur-[80px]" />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, #6272f5 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-nexus-200 dark:border-nexus-800 bg-nexus-50 dark:bg-nexus-950/50 text-nexus-700 dark:text-nexus-300 text-sm font-medium mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          Powered by Claude AI · Now in public beta
          <ChevronRight className="w-3.5 h-3.5" />
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
          The workspace that
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-nexus-500 via-violet-500 to-pink-500">
            thinks with you
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
          NexusAI combines real-time collaboration, AI-powered assistance, Kanban project management,
          and team chat — all in one beautiful workspace. Ship faster, together.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-nexus-500 to-violet-600 text-white font-semibold text-lg hover:opacity-90 transition-all shadow-2xl shadow-nexus-500/30 hover:shadow-nexus-500/50 hover:-translate-y-0.5"
          >
            Start for free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-lg hover:border-nexus-300 dark:hover:border-nexus-600 transition-all"
          >
            View demo
          </Link>
        </div>

        {/* Social proof */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 bg-gradient-to-br from-nexus-400 to-violet-500" />
            ))}
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Trusted by <span className="font-semibold text-gray-900 dark:text-white">2,400+</span> teams worldwide
          </p>
        </div>

        {/* App Screenshot Preview */}
        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#060612] to-transparent z-10 pointer-events-none" style={{ top: "60%" }} />
          <div className="relative mx-auto max-w-5xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-2xl shadow-gray-900/20">
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  );
}

// ========================
// Dashboard Preview (SVG mockup)
// ========================
function DashboardPreview() {
  return (
    <div className="bg-gray-50 dark:bg-[#0d0d21] p-4">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-4 bg-white dark:bg-[#13132b] rounded-xl p-3 border border-gray-100 dark:border-gray-800">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-nexus-500 to-violet-600 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="font-bold text-sm bg-clip-text text-transparent bg-gradient-to-r from-nexus-600 to-violet-600">NexusAI</span>
        <div className="flex-1" />
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-nexus-400 to-violet-500" />
      </div>

      <div className="grid grid-cols-12 gap-3">
        {/* Sidebar */}
        <div className="col-span-2 space-y-1">
          {[
            { icon: LayoutDashboard, label: "Dashboard", active: true },
            { icon: Kanban, label: "Projects" },
            { icon: Bot, label: "AI Chat" },
            { icon: MessageSquare, label: "Team" },
            { icon: BarChart3, label: "Analytics" },
          ].map(({ icon: Icon, label, active }) => (
            <div
              key={label}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs ${
                active
                  ? "bg-nexus-100 dark:bg-nexus-950/50 text-nexus-700 dark:text-nexus-300"
                  : "text-gray-500 dark:text-gray-500"
              }`}
            >
              <Icon className="w-3 h-3" />
              <span className="hidden sm:block">{label}</span>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="col-span-10 space-y-3">
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Tasks Done", value: "24", color: "from-nexus-500 to-violet-600" },
              { label: "In Progress", value: "8", color: "from-amber-500 to-orange-500" },
              { label: "Team Members", value: "12", color: "from-green-500 to-emerald-500" },
              { label: "AI Queries", value: "156", color: "from-pink-500 to-rose-500" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white dark:bg-[#13132b] rounded-xl p-3 border border-gray-100 dark:border-gray-800">
                <div className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${color}`}>{value}</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">{label}</div>
              </div>
            ))}
          </div>

          {/* Kanban preview */}
          <div className="bg-white dark:bg-[#13132b] rounded-xl p-3 border border-gray-100 dark:border-gray-800">
            <div className="text-xs font-semibold mb-2 text-gray-700 dark:text-gray-200">Website Redesign</div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { col: "Backlog", tasks: ["Perf audit", "Dark mode"], color: "bg-slate-500" },
                { col: "In Progress", tasks: ["Rebuild nav", "Copy writing"], color: "bg-blue-500" },
                { col: "In Review", tasks: ["Brand colors"], color: "bg-amber-500" },
                { col: "Done", tasks: ["Hero section"], color: "bg-green-500" },
              ].map(({ col, tasks, color }) => (
                <div key={col} className="space-y-1.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className={`w-2 h-2 rounded-full ${color}`} />
                    <span className="text-[9px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{col}</span>
                  </div>
                  {tasks.map((task) => (
                    <div key={task} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-1.5 text-[9px] text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
                      {task}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========================
// Features
// ========================
const features = [
  {
    icon: Bot,
    title: "Claude AI Assistant",
    description: "Ask anything, get instant help. Summarize meetings, write code, analyze data — your AI copilot is always ready.",
    gradient: "from-violet-500 to-purple-700",
    badge: "Powered by Claude",
  },
  {
    icon: Kanban,
    title: "Kanban Project Boards",
    description: "Visualize work with drag-and-drop boards, custom columns, priorities, deadlines, and team assignments.",
    gradient: "from-nexus-500 to-blue-600",
    badge: "Project Management",
  },
  {
    icon: MessageSquare,
    title: "Real-time Team Chat",
    description: "Channels, threads, direct messages, reactions, and file sharing — everything for seamless team communication.",
    gradient: "from-green-500 to-emerald-600",
    badge: "Communication",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description: "Track team velocity, task completion rates, AI usage, and workspace activity with beautiful charts.",
    gradient: "from-pink-500 to-rose-600",
    badge: "Analytics",
  },
  {
    icon: Users,
    title: "Multi-tenant Workspaces",
    description: "Manage multiple organizations, invite team members, set roles, and control permissions with ease.",
    gradient: "from-amber-500 to-orange-600",
    badge: "Team Management",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "SOC 2 ready with SSO, 2FA, audit logs, data encryption at rest and in transit, and GDPR compliance.",
    gradient: "from-slate-600 to-gray-700",
    badge: "Security",
  },
];

function Features() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-[#080815]" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-nexus-100 dark:bg-nexus-950/50 text-nexus-700 dark:text-nexus-300 text-sm font-medium mb-4">
            <Zap className="w-3.5 h-3.5" />
            Everything you need
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            Built for the AI era
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
            Every feature is designed to help your team move faster with AI assistance baked in at every step.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group bg-white dark:bg-[#0d0d21] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:border-nexus-300 dark:hover:border-nexus-700 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-nexus-500/10"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4 shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 mb-3 ml-0">
                  {feature.badge}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ========================
// Pricing
// ========================
const plans = [
  {
    name: "Free",
    price: 0,
    description: "Perfect for small teams getting started.",
    features: [
      "Up to 3 users",
      "2 projects",
      "100 AI queries/month",
      "Basic analytics",
      "Community support",
    ],
    cta: "Get started free",
    href: "/register",
    highlighted: false,
  },
  {
    name: "Pro",
    price: 29,
    description: "For growing teams that need more power.",
    features: [
      "Up to 25 users",
      "Unlimited projects",
      "5,000 AI queries/month",
      "Advanced analytics",
      "Real-time collaboration",
      "Priority support",
      "Custom integrations",
    ],
    cta: "Start Pro trial",
    href: "/register?plan=pro",
    highlighted: true,
    badge: "Most popular",
  },
  {
    name: "Enterprise",
    price: 99,
    description: "For large organizations with custom needs.",
    features: [
      "Unlimited users",
      "Unlimited projects",
      "Unlimited AI queries",
      "SSO / SAML",
      "Audit logs",
      "SLA guarantee",
      "Dedicated support",
      "Custom contracts",
    ],
    cta: "Contact sales",
    href: "/contact",
    highlighted: false,
  },
];

function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section className="py-24 bg-white dark:bg-[#060612]" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            Simple, transparent pricing
          </h2>
          <p className="max-w-xl mx-auto text-lg text-gray-600 dark:text-gray-400 mb-8">
            Start free, scale as you grow. No hidden fees.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 p-1 rounded-xl bg-gray-100 dark:bg-gray-900">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                !annual ? "bg-white dark:bg-gray-800 shadow text-gray-900 dark:text-white" : "text-gray-500"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                annual ? "bg-white dark:bg-gray-800 shadow text-gray-900 dark:text-white" : "text-gray-500"
              }`}
            >
              Annual <span className="text-green-600 font-semibold">-20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 border-2 transition-all ${
                plan.highlighted
                  ? "border-nexus-500 dark:border-nexus-500 shadow-2xl shadow-nexus-500/20 scale-105 bg-gradient-to-b from-nexus-50 dark:from-nexus-950/30 to-white dark:to-[#060612]"
                  : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0d0d21]"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-nexus-500 to-violet-600 text-white text-xs font-bold">
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                  ${annual && plan.price > 0 ? Math.floor(plan.price * 0.8) : plan.price}
                </span>
                {plan.price > 0 && <span className="text-gray-500 dark:text-gray-400 ml-1">/mo per workspace</span>}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${
                  plan.highlighted
                    ? "bg-gradient-to-r from-nexus-500 to-violet-600 text-white hover:opacity-90 shadow-lg shadow-nexus-500/25"
                    : "border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-nexus-400 dark:hover:border-nexus-500"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========================
// CTA Section
// ========================
function CTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-nexus-600 via-violet-600 to-purple-700 relative overflow-hidden" id="about">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-white/5 blur-[80px] rounded-full" />
      </div>
      <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 text-white/80 text-sm font-medium mb-6">
          <Cpu className="w-3.5 h-3.5" />
          Start shipping with AI today
        </div>
        <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
          Ready to supercharge
          <br /> your team&apos;s workflow?
        </h2>
        <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
          Join thousands of teams that use NexusAI to collaborate smarter, ship faster, and never lose track of what matters.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-nexus-700 font-bold text-lg hover:bg-gray-50 transition-all shadow-2xl"
          >
            Get started — it&apos;s free <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-white/60 text-sm">No credit card required</p>
        </div>
      </div>
    </section>
  );
}

// ========================
// Footer
// ========================
function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-nexus-500 to-violet-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">NexusAI</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              The AI-first workspace for modern teams. Collaborate, manage projects, and ship faster.
            </p>
          </div>
          {[
            { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
            { title: "Company", links: ["About", "Blog", "Careers", "Press"] },
            { title: "Legal", links: ["Privacy", "Terms", "Security", "Cookies"] },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-white font-semibold mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((l) => (
                  <li key={l}>
                    <Link href="#" className="text-sm hover:text-white transition-colors">{l}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">© 2026 NexusAI, Inc. All rights reserved.</p>
          <div className="flex items-center gap-2 text-sm">
            <Globe className="w-4 h-4" />
            English
          </div>
        </div>
      </div>
    </footer>
  );
}

// ========================
// Main Page
// ========================
export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
