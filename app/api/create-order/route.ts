import { NextRequest, NextResponse } from 'next/server'
import { getRazorpay } from '@/lib/razorpay'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { bookingId, amount } = await req.json()
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: booking } = await supabase
      .from('bookings')
      .select('id, amount')
      .eq('id', bookingId)
      .eq('customer_id', user.id)
      .single()

    if (!booking) {
      return NextResponse.json({ error: 'Booking nahi mili' }, { status: 404 })
    }

    const razorpay = getRazorpay()
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: bookingId,
      notes: { booking_id: bookingId },
    })

    await supabase
      .from('bookings')
      .update({ razorpay_order_id: order.id })
      .eq('id', bookingId)

    return NextResponse.json(order)
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? 'Server error' },
      { status: 500 }
    )
  }
}
