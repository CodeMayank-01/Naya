import { createClient } from '@/lib/supabase/server'
import RealtimeBookings from '@/components/RealtimeBookings'
import SalonSetup from '@/components/SalonSetup'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <p className="p-6">Login karo pehle</p>
  }

  const { data: salon } = await supabase
    .from('salons')
    .select('*')
    .eq('owner_id', user.id)
    .maybeSingle()

  // Agar salon nahi hai, toh setup form dikhao
  if (!salon) {
    return (
      <main className="max-w-2xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Apna Salon Setup Karo</h1>
        <SalonSetup ownerId={user.id} />
      </main>
    )
  }

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('salon_id', salon.id)
    .order('created_at', { ascending: true })

  const { data: tables } = await supabase
    .from('salon_tables')
    .select('*')
    .eq('salon_id', salon.id)
    .order('created_at', { ascending: true })

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, services(name), salon_tables(stylist_name)')
    .eq('salon_id', salon.id)
    .order('created_at', { ascending: false })

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">{salon.name} Dashboard</h1>
      <p className="text-gray-500 mb-6">{salon.address}</p>

      <SalonSetup
        ownerId={user.id}
        salonId={salon.id}
        existingServices={services ?? []}
        existingTables={tables ?? []}
      />

      <h2 className="text-xl font-bold mt-8 mb-4">Bookings</h2>
      <RealtimeBookings salonId={salon.id} initial={bookings ?? []} />
    </main>
  )
}
