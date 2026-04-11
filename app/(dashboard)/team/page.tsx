import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { UserPlus, Mail, Shield, Crown, User, MoreHorizontal } from "lucide-react";
import { generateInitials, formatDate } from "@/lib/utils";

const ROLE_CONFIG = {
  OWNER: { label: "Owner", icon: Crown, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-950/30" },
  ADMIN: { label: "Admin", icon: Shield, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-950/30" },
  MEMBER: { label: "Member", icon: User, color: "text-gray-600", bg: "bg-gray-100 dark:bg-gray-800" },
  VIEWER: { label: "Viewer", icon: User, color: "text-gray-500", bg: "bg-gray-50 dark:bg-gray-900" },
};

export default async function TeamPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const membership = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: {
      workspace: {
        include: {
          members: {
            include: { user: true },
            orderBy: { joinedAt: "asc" },
          },
        },
      },
    },
  });

  if (!membership) redirect("/onboarding");

  const { workspace } = membership;
  const isAdmin = ["OWNER", "ADMIN"].includes(membership.role);

  return (
    <div className="max-w-4xl mx-auto page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Team Members</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {workspace.members.length} member{workspace.members.length !== 1 ? "s" : ""} in {workspace.name}
          </p>
        </div>
        {isAdmin && (
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-nexus-500 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-nexus-500/25">
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
          {workspace.members.map((member) => {
            const roleConfig = ROLE_CONFIG[member.role] ?? ROLE_CONFIG.MEMBER;
            const RoleIcon = roleConfig.icon;
            const isCurrentUser = member.userId === session.user!.id;

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
                  {formatDate(member.joinedAt)}
                </div>

                {/* Actions */}
                <div className="col-span-2 flex justify-end">
                  {isAdmin && !isCurrentUser && (
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invite section */}
      {isAdmin && (
        <div className="mt-6 bg-white dark:bg-[#0d0d21] rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            <Mail className="w-4 h-4 text-nexus-500" />
            Invite by Email
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Send an invitation link to add new members to your workspace.
          </p>
          <div className="flex gap-3">
            <input
              type="email"
              placeholder="colleague@company.com"
              className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-nexus-400 dark:focus:border-nexus-600 transition-colors"
            />
            <select className="px-3 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-nexus-400 transition-colors">
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
              <option value="VIEWER">Viewer</option>
            </select>
            <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-nexus-500 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition-all shadow-sm shadow-nexus-500/25 whitespace-nowrap">
              Send Invite
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
