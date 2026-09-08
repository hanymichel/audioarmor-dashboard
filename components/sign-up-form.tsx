"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function SignUpForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    setLoading(true);

    try {
      const { data, error } =
        await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              first_name: form.firstName,
              last_name: form.lastName,
            },
            emailRedirectTo:
              `${window.location.origin}/auth/login`,
          },
        });

      if (error) throw error;

      if (data.user) {
        setMessage(
          "Account created successfully. Please verify your email."
        );

        setForm({
          email: "",
          password: "",
          confirmPassword: "",
          firstName: "",
          lastName: "",
        });

        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      }
    } catch (err: any) {
      setError(
        err.message || "Failed to create account."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <h1 className="mb-6 text-3xl font-bold text-white">
        Create Account
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div>
          <label className="mb-2 block text-sm text-zinc-300">
            First Name
          </label>

          <input
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            className="w-full rounded-md border border-zinc-700 bg-black px-3 py-2 text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-zinc-300">
            Last Name
          </label>

          <input
            type="text"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            className="w-full rounded-md border border-zinc-700 bg-black px-3 py-2 text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-zinc-300">
            Email
          </label>

          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-md border border-zinc-700 bg-black px-3 py-2 text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-zinc-300">
            Password
          </label>

          <input
            type="password"
            name="password"
            required
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-md border border-zinc-700 bg-black px-3 py-2 text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-zinc-300">
            Confirm Password
          </label>

          <input
            type="password"
            name="confirmPassword"
            required
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full rounded-md border border-zinc-700 bg-black px-3 py-2 text-white"
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
            ? "Creating Account..."
            : "Sign Up"}
        </button>
      </form>
    </div>
  );
}