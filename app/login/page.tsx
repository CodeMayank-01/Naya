'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function sendOtp() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      phone: `+91${phone}`,
    })
    setLoading(false)
    if (error) return alert(error.message)
    setStep('otp')
  }

  async function verifyOtp() {
    setLoading(true)
    const { error } = await supabase.auth.verifyOtp({
      phone: `+91${phone}`,
      token: otp,
      type: 'sms',
    })
    setLoading(false)
    if (error) return alert(error.message)
    router.push('/')
  }

  return (
    <main className="max-w-sm mx-auto p-6 mt-20">
      <h1 className="text-2xl font-bold mb-6">SalonAdda Login</h1>

      {step === 'phone' ? (
        <>
          <input
            type="tel"
            placeholder="10-digit mobile"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border p-3 w-full rounded mb-4"
            maxLength={10}
          />
          <button
            onClick={sendOtp}
            disabled={loading || phone.length !== 10}
            className="bg-black text-white w-full py-3 rounded disabled:opacity-50"
          >
            {loading ? 'Bhej raha...' : 'OTP Bhejo'}
          </button>
        </>
      ) : (
        <>
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
