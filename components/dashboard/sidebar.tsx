"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard, FolderKanban, Bot, MessageSquare, BarChart3,
  Settings, Users, Bell, LogOut, Sparkles, ChevronDown,
  Plus, HelpCircle, Zap
} from "lucide-react";
import { cn, generateInitials } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/projects", icon: FolderKanban, label: "Projects" },
  { href: "/ai", icon: Bot, label: "AI Assistant", badge: "NEW" },
  { href: "/chat", icon: MessageSquare, label: "Team Chat" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/team", icon: Users, label: "Team" },
];

const bottomItems = [
  { href: "/settings", icon: Settings, label: "Settings" },
  { href: "/help", icon: HelpCircle, label: "Help & Support" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  const user = session?.user;
  const initials = user?.name ? generateInitials(user.name) : "U";

  return (
    <aside className="w-64 h-screen flex flex-col bg-white dark:bg-[#0a0a1a] border-r border-gray-100 dark:border-gray-800 overflow-hidden flex-shrink-0">
      {/* Logo + Workspace */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={() => setWorkspaceOpen(!workspaceOpen)}
          className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-nexus-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 text-left overflow-hidden">
            <div className="text-sm font-bold text-gray-900 dark:text-white truncate">NexusAI</div>
            <div className="text-[10px] text-gray-400 dark:text-gray-500">Pro workspace</div>
          </div>
          <ChevronDown className={cn("w-3.5 h-3.5 text-gray-400 transition-transform", workspaceOpen && "rotate-180")} />
        </button>
      </div>

      {/* Quick actions */}
      <div className="px-3 py-3 border-b border-gray-100 dark:border-gray-800">
        <Link
          href="/projects/new"
          className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-gradient-to-r from-nexus-500 to-violet-600 text-white text-sm font-medium hover:opacity-90 transition-all shadow-sm shadow-nexus-500/25"
        >
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 scrollbar-thin">
        {navItems.map(({ href, icon: Icon, label, badge }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "sidebar-item",
                isActive && "active"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-gradient-to-r from-nexus-500 to-violet-600 text-white uppercase tracking-wide">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade CTA (for free plan) */}
      <div className="mx-3 mb-3 p-3 rounded-xl bg-gradient-to-br from-nexus-50 dark:from-nexus-950/40 to-violet-50 dark:to-violet-950/20 border border-nexus-200 dark:border-nexus-800/50">
        <div className="flex items-center gap-2 mb-1.5">
          <Zap className="w-3.5 h-3.5 text-nexus-600 dark:text-nexus-400" />
          <span className="text-xs font-bold text-nexus-700 dark:text-nexus-300">Upgrade to Pro</span>
        </div>
        <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">Unlock unlimited AI queries & projects</p>
        <Link
          href="/settings/billing"
          className="block text-center py-1.5 rounded-lg bg-gradient-to-r from-nexus-500 to-violet-600 text-white text-[11px] font-semibold hover:opacity-90 transition-all"
        >
          Upgrade now
        </Link>
      </div>

      {/* Bottom items */}
      <div className="px-3 pb-2 space-y-0.5">
        {bottomItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn("sidebar-item", pathname === href && "active")}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{label}</span>
          </Link>
        ))}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="sidebar-item w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Sign out</span>
        </button>
      </div>

      {/* User profile */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-nexus-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt={user.name ?? ""} className="w-8 h-8 rounded-full object-cover" />
            ) : initials}
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user?.name}</div>
            <div className="text-[10px] text-gray-400 truncate">{user?.email}</div>
          </div>
          <Bell className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        </div>
      </div>
    </aside>
  );
}
