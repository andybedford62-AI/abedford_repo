"use client";

import { useSession } from "next-auth/react";
import { Shield, X } from "lucide-react";

export function ImpersonationBanner() {
  const { data: session, update } = useSession();
  const impersonating = (session?.user as { impersonating?: boolean })?.impersonating;

  if (!impersonating) return null;

  const stop = async () => {
    await update({ stopImpersonation: true });
    window.location.href = "/admin";
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white px-4 py-2 flex items-center justify-between text-sm font-medium shadow-lg">
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4" />
        <span>You are viewing as <strong>{session?.user?.email}</strong> — Admin impersonation mode</span>
      </div>
      <button
        onClick={stop}
        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-xs font-semibold"
      >
        <X className="w-3.5 h-3.5" />
        Return to Admin
      </button>
    </div>
  );
}
