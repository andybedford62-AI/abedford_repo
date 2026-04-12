"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, ArrowLeft, Check, Shield } from "lucide-react";
import Link from "next/link";

export default function SecurityPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const changePassword = async () => {
    setError("");
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/settings/security", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    setSaving(false);

    if (res.ok) {
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(false), 4000);
    } else {
      setError(data.error || "Failed to update password");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/settings" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Security</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your password and account security</p>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-[#0d0d21] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-4">
        <div className="flex items-center gap-2 mb-5">
          <Lock className="w-4 h-4 text-gray-500" />
          <h2 className="font-bold text-gray-900 dark:text-white text-sm">Change Password</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2.5 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-nexus-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2.5 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-nexus-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">Minimum 8 characters</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-nexus-400 transition-colors"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
        {success && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 mt-3">
            <Check className="w-4 h-4" /> Password updated successfully
          </div>
        )}

        <div className="flex justify-end mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={changePassword}
            disabled={saving || !currentPassword || !newPassword || !confirmPassword}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-nexus-500 to-violet-600 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all shadow-md shadow-nexus-500/20"
          >
            {saving ? "Updating..." : "Update password"}
          </button>
        </div>
      </div>

      {/* Session info */}
      <div className="bg-white dark:bg-[#0d0d21] rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-gray-500" />
          <h2 className="font-bold text-gray-900 dark:text-white text-sm">Active Session</h2>
        </div>
        <div className="flex items-center justify-between py-3 border border-gray-100 dark:border-gray-800 rounded-xl px-4">
          <div>
            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Current browser session</div>
            <div className="text-xs text-gray-400 mt-0.5">Signed in now</div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400">
            Active
          </span>
        </div>
      </div>
    </div>
  );
}
