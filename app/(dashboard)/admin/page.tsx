"use client";

import { useEffect, useState } from "react";
import { Users, Building2, FolderKanban, CreditCard, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

interface Stats {
  totalUsers: number;
  totalWorkspaces: number;
  totalProjects: number;
  paidWorkspaces: number;
}

export default function AdminPage() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (session && role !== "SUPER_ADMIN") {
      window.location.href = "/dashboard";
      return;
    }
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats);
  }, [session, role]);

  const cards = [
    { label: "Total Users", value: stats?.totalUsers, icon: Users, color: "from-nexus-500 to-violet-600", href: "/admin/users" },
    { label: "Workspaces", value: stats?.totalWorkspaces, icon: Building2, color: "from-blue-500 to-cyan-600", href: "/admin/workspaces" },
    { label: "Projects", value: stats?.totalProjects, icon: FolderKanban, color: "from-green-500 to-emerald-600", href: "#" },
    { label: "Paid Workspaces", value: stats?.paidWorkspaces, icon: CreditCard, color: "from-amber-500 to-orange-600", href: "#" },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-xs font-bold mb-3">
          SUPER ADMIN
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Admin Panel</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage all users, workspaces, and platform data</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href} className="group bg-white dark:bg-[#0d0d21] rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:border-nexus-300 dark:hover:border-nexus-700 transition-all">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-sm`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {value ?? "—"}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/admin/users" className="group flex items-center gap-4 bg-white dark:bg-[#0d0d21] rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:border-nexus-300 dark:hover:border-nexus-700 transition-all">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nexus-500 to-violet-600 flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900 dark:text-white text-sm">Manage Users</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">View, impersonate, or delete user accounts</div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-nexus-400 transition-colors" />
        </Link>

        <Link href="/admin/workspaces" className="group flex items-center gap-4 bg-white dark:bg-[#0d0d21] rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:border-nexus-300 dark:hover:border-nexus-700 transition-all">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900 dark:text-white text-sm">Manage Workspaces</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">View and delete workspaces and all their data</div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-nexus-400 transition-colors" />
        </Link>
      </div>
    </div>
  );
}
