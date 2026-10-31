'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Service = {
  id: string
  name: string
  duration_min: number
  price: number
}
type Table = {
  id: string
  stylist_name: string
  table_label: string | null
}

export default function SalonSetup({
  ownerId,
  salonId,
  existingServices = [],
  existingTables = [],
}: {
  ownerId: string
  salonId?: string
  existingServices?: Service[]
  existingTables?: Table[]
}) {
  const supabase = createClient()
  const router = useRouter()

  // Salon create form
  const [salonName, setSalonName] = useState('')
  const [salonAddress, setSalonAddress] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [creatingSalon, setCreatingSalon] = useState(false)

  // Service form
  const [serviceName, setServiceName] = useState('')
  const [serviceDuration, setServiceDuration] = useState('30')
  const [servicePrice, setServicePrice] = useState('')
  const [addingService, setAddingService] = useState(false)

  // Table form
  const [stylistName, setStylistName] = useState('')
  const [tableLabel, setTableLabel] = useState('')
  const [addingTable, setAddingTable] = useState(false)

  async function createSalon() {
    if (!salonName || !salonAddress || !lat || !lng) {
      return alert('Sab fields bharo')
    }
    setCreatingSalon(true)

    const { error } = await supabase.from('salons').insert({
      owner_id: ownerId,
      name: salonName,
      address: salonAddress,
      location: `POINT(${lng} ${lat})`,
      is_open: true,
      commission_pct: 10,
    })

    setCreatingSalon(false)
    if (error) return alert(error.message)
    router.refresh()
  }

  async function addService() {
    if (!serviceName || !servicePrice) return alert('Sab fields bharo')
    setAddingService(true)

    const { error } = await supabase.from('services').insert({
      salon_id: salonId,
      name: serviceName,
      duration_min: parseInt(serviceDuration),
      price: parseFloat(servicePrice),
      is_active: true,
    })

    setAddingService(false)
    if (error) return alert(error.message)
    setServiceName('')
    setServicePrice('')
    setServiceDuration('30')
    router.refresh()
  }

  async function addTable() {
    if (!stylistName) return alert('Stylist ka naam daalo')
    setAddingTable(true)

    const { error } = await supabase.from('salon_tables').insert({
      salon_id: salonId,
      stylist_name: stylistName,
      table_label: tableLabel || `Chair ${existingTables.length + 1}`,
      is_active: true,
    })

    setAddingTable(false)
    if (error) return alert(error.message)
    setStylistName('')
    setTableLabel('')
    router.refresh()
  }

  async function deleteService(id: string) {
    if (!confirm('Service delete karein?')) return
    await supabase.from('services').delete().eq('id', id)
    router.refresh()
  }

  async function deleteTable(id: string) {
    if (!confirm('Table delete karein?')) return
    await supabase.from('salon_tables').delete().eq('id', id)
    router.refresh()
  }

  // MODE 1: Salon create
  if (!salonId) {
    return (
      <div className="border rounded p-4 space-y-3">
        <input
          placeholder="Salon ka naam"
          value={salonName}
          onChange={(e) => setSalonName(e.target.value)}
          className="border p-3 w-full rounded"
        />
        <input
          placeholder="Address"
          value={salonAddress}
          onChange={(e) => setSalonAddress(e.target.value)}
          className="border p-3 w-full rounded"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            placeholder="Latitude (e.g. 28.6139)"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            className="border p-3 w-full rounded"
          />
          <input
            placeholder="Longitude (e.g. 77.2090)"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            className="border p-3 w-full rounded"
          />
        </div>
        <p className="text-xs text-gray-500">
          Location kaise nikalein: Google Maps par apni dukan pe right-click
          karein, lat/lng copy ho jayenge.
        </p>
        <button
          onClick={createSalon}
          disabled={creatingSalon}
          className="bg-black text-white w-full py-3 rounded disabled:opacity-50"
        >
          {creatingSalon ? 'Bana raha...' : 'Salon Banao'}
        </button>
      </div>
    )
  }

  // MODE 2: Services + Tables management
  return (
    <div className="space-y-6">
      {/* Services */}
      <section>
        <h2 className="text-xl font-bold mb-3">Services</h2>
        <div className="border rounded p-4 space-y-3 mb-3">
          <input
            placeholder="Service ka naam (e.g. Haircut)"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            className="border p-3 w-full rounded"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Duration (min)"
              value={serviceDuration}
              onChange={(e) => setServiceDuration(e.target.value)}
              className="border p-3 w-full rounded"
            />
            <input
              type="number"
              placeholder="Price ₹"
              value={servicePrice}
              onChange={(e) => setServicePrice(e.target.value)}
              className="border p-3 w-full rounded"
            />
          </div>
          <button
            onClick={addService}
            disabled={addingService}
            className="bg-black text-white w-full py-2 rounded disabled:opacity-50"
          >
            {addingService ? 'Add ho raha...' : 'Service Add Karo'}
          </button>
        </div>

        <div className="space-y-2">
          {existingServices.map((s) => (
            <div
              key={s.id}
              className="border rounded p-3 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{s.name}</p>
                <p className="text-sm text-gray-500">
                  {s.duration_min} min · ₹{s.price}
                </p>
              </div>
              <button
                onClick={() => deleteService(s.id)}
                className="text-red-500 text-sm"
              >
                Delete
              </button>
            </div>
          ))}
          {existingServices.length === 0 && (
            <p className="text-gray-500 text-sm">Abhi koi service nahi hai</p>
          )}
        </div>
      </section>

      {/* Tables / Chairs */}
      <section>
        <h2 className="text-xl font-bold mb-3">Tables / Stylist Chairs</h2>
        <div className="border rounded p-4 space-y-3 mb-3">
          <input
            placeholder="Stylist ka naam (e.g. Ramesh)"
            value={stylistName}
            onChange={(e) => setStylistName(e.target.value)}
            className="border p-3 w-full rounded"
          />
          <input
            placeholder="Chair label (optional, e.g. Chair 1)"
            value={tableLabel}
            onChange={(e) => setTableLabel(e.target.value)}
            className="border p-3 w-full rounded"
          />
          <button
            onClick={addTable}
            disabled={addingTable}
            className="bg-black text-white w-full py-2 rounded disabled:opacity-50"
          >
            {addingTable ? 'Add ho raha...' : 'Table Add Karo'}
          </button>
        </div>

        <div className="space-y-2">
          {existingTables.map((t) => (
            <div
              key={t.id}
              className="border rounded p-3 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{t.table_label ?? 'Chair'}</p>
                <p className="text-sm text-gray-500">{t.stylist_name}</p>
              </div>
              <button
                onClick={() => deleteTable(t.id)}
                className="text-red-500 text-sm"
              >
                Delete
              </button>
            </div>
          ))}
          {existingTables.length === 0 && (
            <p className="text-gray-500 text-sm">Abhi koi table nahi hai</p>
          )}
        </div>
      </section>
    </div>
  )
}
