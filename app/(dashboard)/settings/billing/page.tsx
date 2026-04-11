"use client";

import { useState } from "react";
import { Check, Zap, Crown, Building2, ArrowRight, CreditCard, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const PLAN_CONFIGS = [
  {
    key: "FREE",
    name: "Free",
    price: 0,
    description: "For small teams just getting started",
    icon: Zap,
    color: "from-gray-500 to-slate-600",
    features: ["Up to 3 users", "2 projects", "100 AI queries/month", "Community support"],
    current: true,
  },
  {
    key: "PRO",
    name: "Pro",
    price: 29,
    description: "For growing teams that need more power",
    icon: Crown,
    color: "from-nexus-500 to-violet-600",
    features: ["Up to 25 users", "Unlimited projects", "5,000 AI queries/month", "Advanced analytics", "Priority support", "Custom integrations"],
    popular: true,
  },
  {
    key: "ENTERPRISE",
    name: "Enterprise",
    price: 99,
    description: "For large organizations",
    icon: Building2,
    color: "from-amber-500 to-orange-600",
    features: ["Unlimited users", "Unlimited everything", "SSO / SAML", "Audit logs", "SLA guarantee", "Dedicated support"],
  },
];

export default function BillingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [annual, setAnnual] = useState(false);

  const handleUpgrade = async (planKey: string) => {
    setLoading(planKey);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey, workspaceId: "current" }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto page-enter">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Billing & Subscription</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your workspace subscription and billing</p>
      </div>

      {/* Current plan */}
      <div className="bg-white dark:bg-[#0d0d21] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="w-4 h-4 text-nexus-500" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Current Plan</span>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Free Plan</h2>
            <p className="text-sm text-gray-500 mt-1">No billing information on file</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-extrabold text-gray-900 dark:text-white">$0</div>
            <div className="text-sm text-gray-400">/month</div>
          </div>
        </div>
      </div>

      {/* Billing period toggle */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Choose a plan</h2>
        <div className="inline-flex items-center gap-3 p-1 rounded-xl bg-gray-100 dark:bg-gray-900">
          <button
            onClick={() => setAnnual(false)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              !annual ? "bg-white dark:bg-gray-800 shadow text-gray-900 dark:text-white" : "text-gray-500"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              annual ? "bg-white dark:bg-gray-800 shadow text-gray-900 dark:text-white" : "text-gray-500"
            )}
          >
            Annual <span className="text-green-600 font-bold">-20%</span>
          </button>
        </div>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {PLAN_CONFIGS.map((plan) => {
          const Icon = plan.icon;
          const price = annual && plan.price > 0 ? Math.floor(plan.price * 0.8) : plan.price;

          return (
            <div
              key={plan.key}
              className={cn(
                "relative rounded-2xl border-2 p-6 transition-all",
                plan.popular
                  ? "border-nexus-500 dark:border-nexus-500 shadow-xl shadow-nexus-500/10"
                  : "border-gray-200 dark:border-gray-800"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-nexus-500 to-violet-600 text-white text-xs font-bold whitespace-nowrap">
                  Most popular
                </div>
              )}

              <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${plan.color} mb-4 shadow-sm`}>
                <Icon className="w-4 h-4 text-white" />
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{plan.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{plan.description}</p>

              <div className="mb-5">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">${price}</span>
                {plan.price > 0 && <span className="text-gray-400 text-sm ml-1">/month</span>}
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {plan.current ? (
                <div className="text-center py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 text-sm font-medium">
                  Current plan
                </div>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan.key)}
                  disabled={loading === plan.key}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all",
                    plan.popular
                      ? "bg-gradient-to-r from-nexus-500 to-violet-600 text-white hover:opacity-90 shadow-lg shadow-nexus-500/25"
                      : "border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-nexus-400 dark:hover:border-nexus-600"
                  )}
                >
                  {loading === plan.key ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>Upgrade to {plan.name} <ArrowRight className="w-3.5 h-3.5" /></>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="bg-white dark:bg-[#0d0d21] rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {[
            { q: "Can I cancel anytime?", a: "Yes! You can cancel your subscription anytime. You'll retain access until the end of your billing period." },
            { q: "What payment methods do you accept?", a: "We accept all major credit cards (Visa, Mastercard, Amex) and bank transfers for annual plans." },
            { q: "Is there a free trial?", a: "All paid plans come with a 14-day free trial. No credit card required to start." },
            { q: "What happens when I hit AI query limits?", a: "We'll notify you at 80% usage. Once you hit the limit, AI features will be paused until the next billing cycle or you upgrade." },
          ].map(({ q, a }) => (
            <div key={q} className="border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0 last:pb-0">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">{q}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
