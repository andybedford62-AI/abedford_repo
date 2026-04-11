import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Settings, Building2, Bell, Lock, Palette } from "lucide-react";
import Link from "next/link";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const membership = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: { workspace: true },
  });

  if (!membership) redirect("/onboarding");

  const settingsSections = [
    {
      href: "/settings/workspace",
      icon: Building2,
      title: "Workspace",
      desc: "Name, logo, slug, and general workspace settings",
      color: "from-nexus-500 to-violet-600",
    },
    {
      href: "/settings/billing",
      icon: Settings,
      title: "Billing",
      desc: "Subscription plan, payment methods, and invoices",
      color: "from-green-500 to-emerald-600",
    },
    {
      href: "/settings/notifications",
      icon: Bell,
      title: "Notifications",
      desc: "Email, push, and in-app notification preferences",
      color: "from-amber-500 to-orange-600",
    },
    {
      href: "/settings/security",
      icon: Lock,
      title: "Security",
      desc: "Password, two-factor authentication, and sessions",
      color: "from-red-500 to-rose-600",
    },
    {
      href: "/settings/appearance",
      icon: Palette,
      title: "Appearance",
      desc: "Theme, language, and display preferences",
      color: "from-violet-500 to-purple-600",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto page-enter">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Manage your workspace and account preferences
        </p>
      </div>

      {/* Workspace info */}
      <div className="bg-white dark:bg-[#0d0d21] rounded-2xl border border-gray-200 dark:border-gray-800 p-5 mb-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-nexus-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg">
          {membership.workspace.name[0].toUpperCase()}
        </div>
        <div>
          <div className="font-bold text-gray-900 dark:text-white">{membership.workspace.name}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            nexusai.app/{membership.workspace.slug} · {membership.workspace.plan} plan
          </div>
        </div>
        <div className="ml-auto">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            membership.workspace.plan === "FREE"
              ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              : membership.workspace.plan === "PRO"
              ? "bg-nexus-100 text-nexus-700 dark:bg-nexus-950/50 dark:text-nexus-300"
              : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
          }`}>
            {membership.workspace.plan}
          </span>
        </div>
      </div>

      {/* Settings grid */}
      <div className="space-y-3">
        {settingsSections.map(({ href, icon: Icon, title, desc, color }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-4 bg-white dark:bg-[#0d0d21] rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:border-nexus-300 dark:hover:border-nexus-700 transition-all"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 dark:text-white text-sm">{title}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</div>
            </div>
            <div className="text-gray-300 dark:text-gray-600 group-hover:text-nexus-400 transition-colors">
              →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
