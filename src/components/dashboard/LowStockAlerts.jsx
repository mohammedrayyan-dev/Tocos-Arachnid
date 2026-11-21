import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"
import { filterActiveProducts } from "../../lib/deletionSync"
import { toast } from "sonner"
import beginnerTarantula from "../../assets/image/beginner-tarantula-care.webp"

const LowStockAlerts = () => {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLowStockItems()

    const channel = supabase
      .channel('low-stock-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchLowStockItems())
      .subscribe()

    const handleSync = () => fetchLowStockItems()
    window.addEventListener('tocos:data_changed', handleSync)
    window.addEventListener('storage', handleSync)

    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener('tocos:data_changed', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [])

  const fetchLowStockItems = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .lt('stock', 5)
        .order('stock', { ascending: true })

      const liveItems = (data && Array.isArray(data)) ? filterActiveProducts(data) : []
      if (liveItems.length > 0) {
        const mapped = liveItems.map(p => ({
          id: p.id,
          species: p.name,
          commonName: p.common_name || p.name,
          stock: p.stock || 0,
          image: p.thumbnail || p.image || (Array.isArray(p.images) && p.images[0]) || beginnerTarantula
        }))
        setAlerts(mapped)
      } else {
        setAlerts([])
      }
    } catch (e) {
      console.warn('Low stock alerts notice:', e)
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-[#E5E2DC] rounded-xl p-5 shadow-xs font-hanken">
      <h3 className="text-[10px] font-bold text-[#6E756F] uppercase tracking-[0.18em] mb-4">
        LOW STOCK ALERTS ({alerts.length})
      </h3>

      {alerts.length === 0 ? (
        <div className="p-4 rounded-lg bg-[#FAF8F5] border border-[#E5E2DC] text-center">
          <p className="font-semibold text-xs text-[#163422]">Inventory Well Stocked</p>
          <p className="text-[11px] text-[#6E756F] mt-0.5">No specimens currently under 5 units.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between gap-3 p-2.5 bg-[#FAF8F5] border border-[#E5E2DC] rounded-lg">
              <div className="flex items-center gap-3">
                <img
                  src={alert.image}
                  alt={alert.species}
                  className="w-10 h-10 rounded-md object-cover border border-[#E5E2DC] shrink-0"
                />
                <div>
                  <p className="font-bold text-xs text-[#163422] italic leading-tight">
                    {alert.species}
                  </p>
                  <p className="text-[11px] text-[#525B54]">
                    {alert.commonName}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="font-bold text-xs text-[#991B1B]">
                  {alert.stock} left
                </p>
                <button 
                  onClick={() => toast.success(`Initiated stock refill request for ${alert.species}`)}
                  className="text-[10px] font-semibold text-[#6E756F] hover:text-[#163422] hover:underline cursor-pointer"
                >
                  Refill
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LowStockAlerts
