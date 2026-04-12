"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function AcceptInvitePage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "valid" | "error">("loading");
  const [invite, setInvite] = useState<{ workspaceName: string; email: string; role: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/team/accept-invite/${params.token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); setStatus("error"); }
        else { setInvite(data); setStatus("valid"); }
      });
  }, [params.token]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#060612]">
        <Loader2 className="w-8 h-8 animate-spin text-nexus-500" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#060612] px-4">
        <div className="max-w-md w-full bg-white dark:bg-[#0d0d21] rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Invalid Invite</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{error}</p>
          <Link href="/login" className="text-sm text-nexus-600 dark:text-nexus-400 hover:underline">Go to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#060612] px-4">
      <div className="max-w-md w-full bg-white dark:bg-[#0d0d21] rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-nexus-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-nexus-500/30">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">
          Join {invite?.workspaceName}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          You've been invited as a <strong className="text-gray-700 dark:text-gray-300">{invite?.role.toLowerCase()}</strong>.
          Create an account or sign in to accept.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href={`/register?invite=${params.token}`}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-nexus-500 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition-all shadow-md shadow-nexus-500/20"
          >
            Create account & join
          </Link>
          <Link
            href={`/login?invite=${params.token}`}
            className="w-full py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Sign in to existing account
          </Link>
        </div>
      </div>
    </div>
  );
}
