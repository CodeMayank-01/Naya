'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function sendOtp() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })
    setLoading(false)
    if (error) return alert(error.message)
    setStep('otp')
  }

  async function verifyOtp() {
    setLoading(true)
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    })
    setLoading(false)
    if (error) return alert(error.message)
    router.push('/')
  }

  return (
    <main className="max-w-sm mx-auto p-6 mt-20">
      <h1 className="text-2xl font-bold mb-6">SalonAdda Login</h1>

      {step === 'email' ? (
        <>
          <input
            type="email"
            placeholder="aapka@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-3 w-full rounded mb-4"
          />
          <button
            onClick={sendOtp}
            disabled={loading || !email.includes('@')}
            className="bg-black text-white w-full py-3 rounded disabled:opacity-50"
          >
            {loading ? 'Bhej raha...' : 'OTP Bhejo'}
          </button>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-2">
            {email} par OTP bheja gaya hai
          </p>
          <input
            type="text"
            placeholder="6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="border p-3 w-full rounded mb-4"
            maxLength={6}
          />
          <button
            onClick={verifyOtp}
            disabled={loading || otp.length !== 6}
            className="bg-black text-white w-full py-3 rounded disabled:opacity-50"
          >
            {loading ? 'Verify...' : 'Verify & Login'}
          </button>
        </>
      )}
    </main>
  )
}
