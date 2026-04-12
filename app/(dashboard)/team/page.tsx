"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  UserPlus, Mail, Shield, Crown, User, MoreHorizontal,
  Loader2, CheckCircle, AlertCircle, ChevronDown, Trash2, Edit2,
} from "lucide-react";
import { generateInitials, formatDate } from "@/lib/utils";

type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

interface Member {
  id: string;
  role: WorkspaceRole;
  joinedAt: string;
  userId: string;
  user: { name: string | null; email: string | null; image: string | null };
}

interface WorkspaceData {
  id: string;
  name: string;
  members: Member[];
  myRole: WorkspaceRole;
}

const ROLE_CONFIG: Record<WorkspaceRole, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  OWNER: { label: "Owner", icon: Crown, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-950/30" },
  ADMIN: { label: "Admin", icon: Shield, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-950/30" },
  MEMBER: { label: "Member", icon: User, color: "text-gray-600", bg: "bg-gray-100 dark:bg-gray-800" },
  VIEWER: { label: "Viewer", icon: User, color: "text-gray-500", bg: "bg-gray-50 dark:bg-gray-900" },
};

function ActionsMenu({
  member,
  currentUserId,
  onRoleChange,
  onRemove,
}: {
  member: Member;
  currentUserId: string;
  onRoleChange: (id: string, role: WorkspaceRole) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const roles: WorkspaceRole[] = ["ADMIN", "MEMBER", "VIEWER"];

  const handleRole = async (role: WorkspaceRole) => {
    setLoading(true);
    setOpen(false);
    await onRoleChange(member.id, role);
    setLoading(false);
  };

  const handleRemove = async () => {
    if (!confirm(`Remove ${member.user.name ?? member.user.email} from workspace?`)) return;
    setLoading(true);
    setOpen(false);
    await onRemove(member.id);
    setLoading(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreHorizontal className="w-4 h-4" />}
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-50 w-44 bg-white dark:bg-[#1a1a35] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-1 text-sm">
          <div className="px-3 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Change Role</div>
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => handleRole(role)}
              className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${member.role === role ? "text-nexus-600 dark:text-nexus-400 font-semibold" : "text-gray-700 dark:text-gray-300"}`}
            >
              <Edit2 className="w-3 h-3" />
              {ROLE_CONFIG[role].label}
              {member.role === role && " ✓"}
            </button>
          ))}
          <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
          <button
            onClick={handleRemove}
            className="w-full text-left px-3 py-2 flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Remove member
          </button>
        </div>
      )}
    </div>
  );
}

export default function TeamPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [data, setData] = useState<WorkspaceData | null>(null);
  const [loadingPage, setLoadingPage] = useState(true);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>("MEMBER");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMsg, setInviteMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchTeam = async () => {
    const res = await fetch("/api/team");
    if (res.ok) {
      const json = await res.json();
      setData(json);
    }
    setLoadingPage(false);
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteMsg(null);

    const res = await fetch("/api/team/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    });

    const json = await res.json();
    if (res.ok) {
      setInviteMsg({ type: "success", text: json.message });
      setInviteEmail("");
      fetchTeam(); // Refresh member list in case they were added directly
    } else {
      setInviteMsg({ type: "error", text: json.error || "Failed to send invite." });
    }
    setInviteLoading(false);
  };

  const handleRoleChange = async (memberId: string, role: WorkspaceRole) => {
    const res = await fetch(`/api/team/members/${memberId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      fetchTeam();
    }
  };

  const handleRemove = async (memberId: string) => {
    const res = await fetch(`/api/team/members/${memberId}`, { method: "DELETE" });
    if (res.ok) {
      fetchTeam();
    }
  };

  if (loadingPage) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-nexus-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Could not load team data.
      </div>
    );
  }

  const isAdmin = ["OWNER", "ADMIN"].includes(data.myRole);
  const currentUserId = session?.user?.id ?? "";

  return (
    <div className="max-w-4xl mx-auto page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Team Members</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {data.members.length} member{data.members.length !== 1 ? "s" : ""} in {data.name}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => document.getElementById("invite-section")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-nexus-500 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-nexus-500/25"
          >
            <UserPlus className="w-4 h-4" />
            Invite Member
          </button>
        )}
      </div>

      {/* Members table */}
      <div className="bg-white dark:bg-[#0d0d21] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="grid grid-cols-12 px-5 py-3 border-b border-gray-100 dark:border-gray-800 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <div className="col-span-5">Member</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-3">Joined</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {data.members.map((member) => {
            const roleConfig = ROLE_CONFIG[member.role] ?? ROLE_CONFIG.MEMBER;
            const RoleIcon = roleConfig.icon;
            const isCurrentUser = member.userId === currentUserId;
            const canManage = isAdmin && !isCurrentUser && member.role !== "OWNER";

            return (
              <div key={member.id} className="grid grid-cols-12 px-5 py-4 items-center hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                {/* User info */}
                <div className="col-span-5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-nexus-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden">
                    {member.user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={member.user.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      generateInitials(member.user.name ?? "U")
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {member.user.name}
                      </span>
                      {isCurrentUser && (
                        <span className="px-1.5 py-0.5 rounded-full bg-nexus-100 dark:bg-nexus-950/50 text-nexus-700 dark:text-nexus-300 text-[9px] font-bold uppercase tracking-wide">
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{member.user.email}</span>
                    </div>
                  </div>
                </div>

                {/* Role */}
                <div className="col-span-2">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${roleConfig.bg} ${roleConfig.color}`}>
                    <RoleIcon className="w-3 h-3" />
                    {roleConfig.label}
                  </div>
                </div>

                {/* Joined */}
                <div className="col-span-3 text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(new Date(member.joinedAt))}
                </div>

                {/* Actions */}
                <div className="col-span-2 flex justify-end">
                  {canManage && (
                    <ActionsMenu
                      member={member}
                      currentUserId={currentUserId}
                      onRoleChange={handleRoleChange}
                      onRemove={handleRemove}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invite section */}
      {isAdmin && (
        <div id="invite-section" className="mt-6 bg-white dark:bg-[#0d0d21] rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            <Mail className="w-4 h-4 text-nexus-500" />
            Invite by Email
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            If the user already has an account they&apos;ll be added instantly. Otherwise an email invite is sent.
          </p>

          {inviteMsg && (
            <div className={`mb-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm border ${
              inviteMsg.type === "success"
                ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
                : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
            }`}>
              {inviteMsg.type === "success" ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              {inviteMsg.text}
            </div>
          )}

          <form onSubmit={handleInvite} className="flex gap-3">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
              required
              className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-nexus-400 dark:focus:border-nexus-600 transition-colors"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as WorkspaceRole)}
              className="px-3 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-nexus-400 transition-colors"
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
              <option value="VIEWER">Viewer</option>
            </select>
            <button
              type="submit"
              disabled={inviteLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-nexus-500 to-violet-600 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-all shadow-sm shadow-nexus-500/25 whitespace-nowrap"
            >
              {inviteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Send Invite
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
