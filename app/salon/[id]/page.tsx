import { createClient } from '@/lib/supabase/server'
import BookingForm from '@/components/BookingForm'
import { notFound } from 'next/navigation'

export default async function SalonPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: salon } = await supabase
    .from('salons')
    .select('*')
    .eq('id', id)
    .single()

  if (!salon) notFound()

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('salon_id', id)
    .eq('is_active', true)

  const { data: tables } = await supabase
    .from('salon_tables')
    .select('*')
    .eq('salon_id', id)
    .eq('is_active', true)

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold">{salon.name}</h1>
      <p className="text-gray-500 mb-6">{salon.address}</p>

      <BookingForm
        salonId={salon.id}
        services={services ?? []}
        tables={tables ?? []}
        commissionPct={salon.commission_pct ?? 10}
      />
    </main>
  )
}
