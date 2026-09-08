'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function LoginForm() {
  const router = useRouter()
  const supabase = createClient()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)

    if (!username.trim() || !password.trim()) {
      setMessage('Please enter both username and password.')
      return
    }

    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: username.trim(),
      password,
    })

    setLoading(false)

    if (error) {
      setMessage(error.message)
      return
    }

    if (!data.session) {
      setMessage('Login succeeded, but no session was created.')
      return
    }

    router.replace('/dashboard')
    router.refresh()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-8 shadow-xl shadow-black/20"
    >
      <h1 className="mb-6 text-2xl font-semibold">Sign in</h1>

      {message ? (
        <div className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {message}
        </div>
      ) : null}

      <label className="mb-3 block text-sm font-medium text-zinc-300">
        Username
        <input
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Enter your username or email"
          className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-teal-500"
        />
      </label>

      <label className="mb-6 block text-sm font-medium text-zinc-300">
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-teal-500"
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-2xl bg-teal-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </button>

      <div className="mt-4 text-center text-sm text-zinc-400">
        <Link
          href="/auth/forgot-password"
          className="font-medium text-teal-400 hover:text-teal-300"
        >
          Forgot password?
        </Link>
      </div>
    </form>
  )
}