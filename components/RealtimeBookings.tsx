'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Booking = any

export default function RealtimeBookings({
  salonId,
  initial,
}: {
  salonId: string
  initial: Booking[]
}) {
  const [bookings, setBookings] = useState<Booking[]>(initial)
  const [newIds, setNewIds] = useState<Set<string>>(new Set())
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel(`salon-bookings-${salonId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings',
          filter: `salon_id=eq.${salonId}`,
        },
        (payload) => {
          const newBooking = payload.new as Booking
          setBookings((prev) => [newBooking, ...prev])
          setNewIds((prev) => new Set(prev).add(newBooking.id))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [salonId, supabase])

  return (
    <div className="space-y-3">
      {bookings.map((b) => (
        <div
          key={b.id}
          className={`border rounded p-4 ${
            newIds.has(b.id) ? 'border-red-500 bg-red-50' : ''
          }`}
        >
          <div className="flex justify-between">
            <div>
              <p className="font-semibold">
                {b.services?.name ?? 'Service'} · ₹{b.amount}
              </p>
              <p className="text-sm text-gray-600">
                {b.salon_tables?.stylist_name ?? 'Chair'} ·{' '}
                {new Date(b.slot_start).toLocaleString('en-IN')}
              </p>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded ${
                b.payment_status === 'paid'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {b.payment_status}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
