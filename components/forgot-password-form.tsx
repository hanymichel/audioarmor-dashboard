"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo:
            `${window.location.origin}/auth/update-password`,
        }
      );

      if (error) throw error;

      setMessage(
        "Password reset link has been sent to your email."
      );
      setEmail("");
    } catch (err: any) {
      setError(err.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="mb-2 text-2xl font-bold text-white">
        Forgot Password
      </h2>

      <p className="mb-6 text-sm text-zinc-400">
        Enter your email address and we'll send you a password reset link.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm text-zinc-300">
            Email Address
          </label>

          <input
            type="email"
            required
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full rounded-md border border-zinc-700 bg-black px-3 py-2 text-white"
            placeholder="you@example.com"
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-400">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-500 disabled:opacity-50"
        >
          {loading
            ? "Sending..."
            : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}