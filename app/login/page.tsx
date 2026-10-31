'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('admin@salonadda.com')
  const [password, setPassword] = useState('SalonAdda@123')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function login() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    setLoading(false)
    if (error) return alert(error.message)
    router.push('/')
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <main className="max-w-sm mx-auto p-6 mt-20">
      <h1 className="text-2xl font-bold mb-6">SalonAdda Login</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-3 w-full rounded mb-4"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-3 w-full rounded mb-4"
      />
      <button
        onClick={login}
        disabled={loading || !email || !password}
        className="bg-black text-white w-full py-3 rounded disabled:opacity-50 mb-3"
      >
        {loading ? 'Login ho raha...' : 'Login'}
      </button>
      <button
        onClick={logout}
        className="text-sm text-gray-500 underline w-full"
      >
        Logout
      </button>
    </main>
  )
}
