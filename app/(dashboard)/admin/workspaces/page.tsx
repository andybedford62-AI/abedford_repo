"use client";

import { useEffect, useState } from "react";
import { Building2, Trash2, ArrowLeft, Search, Users, FolderKanban } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: string;
  createdAt: string;
  _count: { members: number; projects: number };
}

export default function AdminWorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/workspaces").then((r) => r.json()).then((data) => {
      setWorkspaces(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, []);

  const deleteWorkspace = async (id: string) => {
    setDeleting(id);
    await fetch(`/api/admin/workspaces?id=${id}`, { method: "DELETE" });
    setWorkspaces((prev) => prev.filter((w) => w.id !== id));
    setDeleting(null);
    setConfirmDelete(null);
  };

  const filtered = workspaces.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Workspaces</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{workspaces.length} total workspaces</p>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or slug..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0d0d21] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-nexus-400"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-nexus-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ws) => (
            <div key={ws.id} className="bg-white dark:bg-[#0d0d21] rounded-2xl border border-gray-200 dark:border-gray-800 p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {ws.name[0].toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">{ws.name}</span>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold",
                    ws.plan === "FREE" ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" :
                    ws.plan === "PRO" ? "bg-nexus-100 text-nexus-700 dark:bg-nexus-950/50 dark:text-nexus-300" :
                    "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                  )}>
                    {ws.plan}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{ws.slug}</div>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{ws._count.members} members</span>
                  <span className="flex items-center gap-1"><FolderKanban className="w-3 h-3" />{ws._count.projects} projects</span>
                </div>
              </div>

              <div>
                {confirmDelete === ws.id ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => deleteWorkspace(ws.id)}
                      disabled={deleting === ws.id}
                      className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors"
                    >
                      {deleting === ws.id ? "Deleting..." : "Confirm Delete"}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-xs font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(ws.id)}
                    className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/50 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete workspace"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
