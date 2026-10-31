'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type Salon = {
  id: string
  name: string
  address: string | null
  is_open: boolean
  distance_m: number
}

export default function HomePage() {
  const [salons, setSalons] = useState<Salon[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!navigator.geolocation) {
      alert('Browser location support nahi karta')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        const { data, error } = await supabase.rpc('nearby_salons', {
          user_lat: latitude,
          user_lng: longitude,
          radius_m: 5000,
        })
        if (!error && data) setSalons(data as Salon[])
        setLoading(false)
      },
      () => {
        alert('Location chahiye nearest salon dhoondhne ke liye')
        setLoading(false)
      }
    )
  }, [supabase])

  return (
    <main className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">SalonAdda</h1>
        <Link href="/login" className="text-sm underline">
          Login
        </Link>
      </div>
      <p className="text-gray-500 mb-4">Aapke paas ke open salons</p>

      {loading && <p>Location se salons dhoondh rahe hain...</p>}

      {!loading && salons.length === 0 && (
        <p>5km ke andar koi salon nahi mila.</p>
      )}

      <div className="space-y-3">
        {salons.map((s) => (
          <Link
            key={s.id}
            href={`/salon/${s.id}`}
            className="block border rounded p-4 hover:bg-gray-50"
          >
            <h2 className="font-semibold text-lg">{s.name}</h2>
            <p className="text-sm text-gray-600">{s.address}</p>
            <p className="text-xs text-gray-400">
              {(s.distance_m / 1000).toFixed(1)} km door ·{' '}
              {s.is_open ? '🟢 Open' : '🔴 Band'}
            </p>
          </Link>
        ))}
      </div>
    </main>
  )
}
