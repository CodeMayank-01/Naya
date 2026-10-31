import { createClient } from '@/lib/supabase/server'
import RealtimeBookings from '@/components/RealtimeBookings'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <p className="p-6">Login karo (salon owner account se)</p>
  }

  const { data: salon } = await supabase
    .from('salons')
    .select('id, name')
    .eq('owner_id', user.id)
    .single()

  if (!salon) {
    return (
      <p className="p-6">
        Pehle salon create karo (Supabase Table Editor mein insert karo)
      </p>
    )
  }

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, services(name), salon_tables(stylist_name)')
    .eq('salon_id', salon.id)
    .order('created_at', { ascending: false })

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{salon.name} Dashboard</h1>
      <RealtimeBookings salonId={salon.id} initial={bookings ?? []} />
    </main>
  )
}
