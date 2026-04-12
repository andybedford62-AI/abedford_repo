"use client";

import { useEffect, useState } from "react";
import { Users, Trash2, Eye, ArrowLeft, Search, Shield } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  _count: { workspaceMembers: number; aiConversations: number };
}

export default function AdminUsersPage() {
  const { data: session, update } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [impersonating, setImpersonating] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/users").then((r) => r.json()).then((data) => {
      setUsers(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, []);

  const deleteUser = async (id: string) => {
    setDeleting(id);
    await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setDeleting(null);
    setConfirmDelete(null);
  };

  const impersonate = async (userId: string) => {
    setImpersonating(userId);
    await update({ impersonateUserId: userId });
    window.location.href = "/dashboard";
  };

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const myId = session?.user?.id;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Users</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{users.length} total accounts</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0d0d21] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-nexus-400"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-nexus-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0d0d21] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-0">
            {/* Header */}
            <div className="col-span-4 grid grid-cols-[1fr_auto_auto_auto] px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <span>User</span>
              <span className="px-4">Role</span>
              <span className="px-4">Workspaces</span>
              <span className="px-4">Actions</span>
            </div>

            {filtered.map((user) => (
              <div key={user.id} className="col-span-4 grid grid-cols-[1fr_auto_auto_auto] items-center px-5 py-4 border-b border-gray-50 dark:border-gray-800/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-nexus-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {(user.name?.[0] ?? user.email[0]).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        {user.name ?? "—"}
                        {user.id === myId && <span className="text-[10px] text-nexus-500 font-bold">(you)</span>}
                      </div>
                      <div className="text-xs text-gray-400">{user.email}</div>
                    </div>
                  </div>
                </div>

                <div className="px-4">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold",
                    user.role === "SUPER_ADMIN" ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400" :
                    user.role === "ADMIN" ? "bg-nexus-100 text-nexus-700 dark:bg-nexus-950/50 dark:text-nexus-300" :
                    "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  )}>
                    {user.role}
                  </span>
                </div>

                <div className="px-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                  {user._count.workspaceMembers}
                </div>

                <div className="px-4 flex items-center gap-2">
                  {user.id !== myId && (
                    <>
                      <button
                        onClick={() => impersonate(user.id)}
                        disabled={!!impersonating}
                        title="View as this user"
                        className="p-1.5 rounded-lg hover:bg-nexus-100 dark:hover:bg-nexus-950/50 text-gray-400 hover:text-nexus-600 transition-colors disabled:opacity-50"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {confirmDelete === user.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => deleteUser(user.id)}
                            disabled={deleting === user.id}
                            className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors"
                          >
                            {deleting === user.id ? "..." : "Confirm"}
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="px-2 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-xs font-semibold transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(user.id)}
                          title="Delete user"
                          className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/50 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
