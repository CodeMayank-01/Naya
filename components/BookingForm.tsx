'use client'

import { useState, useMemo, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type Service = { id: string; name: string; duration_min: number; price: number }
type Table = { id: string; stylist_name: string; table_label: string | null }

export default function BookingForm({
  salonId,
  services,
  tables,
  commissionPct,
}: {
  salonId: string
  services: Service[]
  tables: Table[]
  commissionPct: number
}) {
  const supabase = createClient()
  const [serviceId, setServiceId] = useState('')
  const [tableId, setTableId] = useState('')
  const [slot, setSlot] = useState('')
  const [loading, setLoading] = useState(false)

  // Razorpay script load
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
  }, [])

  const selectedService = services.find((s) => s.id === serviceId)

  const slots = useMemo(() => {
    if (!selectedService) return []
    const arr = []
    const now = new Date()
    now.setMinutes(Math.ceil(now.getMinutes() / 30) * 30, 0, 0)
    for (let i = 0; i < 16; i++) {
      const start = new Date(now.getTime() + i * 30 * 60000)
      const end = new Date(start.getTime() + selectedService.duration_min * 60000)
      arr.push({ start, end })
    }
    return arr
  }, [selectedService])

  async function book() {
    if (!selectedService || !tableId || !slot) return alert('Sab select karo')

    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return alert('Pehle login karo')
    }

    const start = new Date(slot)
    const end = new Date(start.getTime() + selectedService.duration_min * 60000)
    const commission = (selectedService.price * commissionPct) / 100

    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        salon_id: salonId,
        table_id: tableId,
        service_id: selectedService.id,
        customer_id: user.id,
        slot_start: start.toISOString(),
        slot_end: end.toISOString(),
        amount: selectedService.price,
        commission_amount: commission,
        status: 'pending',
        payment_status: 'unpaid',
      })
      .select()
      .single()

    if (error) {
      setLoading(false)
      return alert(error.message)
    }

    const res = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: booking.id, amount: selectedService.price }),
    })
    const order = await res.json()

    if (!res.ok) {
      setLoading(false)
      return alert(order.error ?? 'Order fail')
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: 'INR',
      name: 'SalonAdda',
      order_id: order.id,
      handler: async function () {
        alert('Payment ho gaya!')
        window.location.href = '/'
      },
    }
    // @ts-ignore
    const rzp = new window.Razorpay(options)
    rzp.open()
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-medium mb-1">Service</label>
        <select
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          className="border p-3 w-full rounded"
        >
          <option value="">Select service</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} · ₹{s.price} · {s.duration_min} min
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-medium mb-1">Stylist / Chair</label>
        <select
          value={tableId}
          onChange={(e) => setTableId(e.target.value)}
          className="border p-3 w-full rounded"
        >
          <option value="">Select chair</option>
          {tables.map((t) => (
            <option key={t.id} value={t.id}>
              {t.table_label ?? t.stylist_name} ({t.stylist_name})
            </option>
          ))}
        </select>
      </div>

      {selectedService && (
        <div>
          <label className="block font-medium mb-1">Slot</label>
          <select
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
            className="border p-3 w-full rounded"
          >
            <option value="">Select slot</option>
            {slots.map((s) => (
              <option key={s.start.toISOString()} value={s.start.toISOString()}>
                {s.start.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        onClick={book}
        disabled={loading}
        className="bg-black text-white w-full py-3 rounded disabled:opacity-50"
      >
        {loading ? 'Process...' : 'Book & Pay'}
      </button>
    </div>
  )
}
