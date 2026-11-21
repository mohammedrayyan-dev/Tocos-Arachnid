import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"
import { filterActiveOrders } from "../../lib/deletionSync"
import brazilianBlack from "../../assets/image/brazilian-black.webp"
import beginnerTarantula from "../../assets/image/beginner-tarantula-care.webp"
import mexicanRedKnee from "../../assets/image/mexican-red-knee.webp"
import { toast } from "sonner"
import { ExternalLink } from "lucide-react"

const getImageSrc = (name, rawImg) => {
  if (rawImg && !String(rawImg).includes('placehold.co')) return rawImg
  const nameLower = String(name || '').toLowerCase()
  if (nameLower.includes('mexican') || nameLower.includes('hamorii')) return mexicanRedKnee
  if (nameLower.includes('brazilian') || nameLower.includes('pulchra')) return brazilianBlack
  return beginnerTarantula
}

const SpecimenOfMonth = () => {
  const [specimen, setSpecimen] = useState(null)

  useEffect(() => {
    fetchTopOrderedSpecimen()

    const channel = supabase
      .channel('specimen-month-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchTopOrderedSpecimen())
      .subscribe()

    const handleSync = () => fetchTopOrderedSpecimen()
    window.addEventListener('tocos:data_changed', handleSync)
    window.addEventListener('storage', handleSync)

    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener('tocos:data_changed', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [])

  const fetchTopOrderedSpecimen = async () => {
    try {
      let activeOrders = []
      try {
        const { data } = await supabase.from('orders').select('*')
        if (data && Array.isArray(data)) {
          activeOrders = filterActiveOrders(data)
        }
      } catch (e) {}

      if (activeOrders.length === 0) {
        setSpecimen(null)
        return
      }

      // Rank items by total quantity sold
      const itemCountsMap = new Map()

      activeOrders.forEach(o => {
        const items = Array.isArray(o.items) && o.items.length > 0 ? o.items : [
          {
            name: o.species || o.name || 'Conservatory Specimen',
            quantity: o.quantity || 1,
            category: o.category || 'Live Specimen'
          }
        ]

        items.forEach(it => {
          const name = it.name || it.products?.name || 'Specimen Item'
          const qty = it.quantity || 1
          const img = it.thumbnail || it.image || it.products?.thumbnail

          if (!itemCountsMap.has(name)) {
            itemCountsMap.set(name, {
              name,
              qty: 0,
              category: it.scientific_name || it.category || 'Specimen Item',
              img
            })
          }

          const current = itemCountsMap.get(name)
          current.qty += qty
          if (img && !current.img) current.img = img
        })
      })

      const sorted = Array.from(itemCountsMap.values()).sort((a, b) => b.qty - a.qty)

      if (sorted.length > 0 && sorted[0].qty > 0) {
        const topItem = sorted[0]
        setSpecimen({
          name: topItem.name,
          commonName: `Top Ordered • ${topItem.qty} Unit${topItem.qty !== 1 ? 's' : ''} Sold`,
          image: getImageSrc(topItem.name, topItem.img)
        })
      } else {
        setSpecimen(null)
      }
    } catch (e) {
      console.warn('Top specimen fetch notice:', e)
      setSpecimen(null)
    }
  }

  if (!specimen) {
    return (
      <div className="relative w-full h-57.5 overflow-hidden rounded-xl shadow-xs border border-[#E5E2DC] font-hanken bg-linear-to-br from-[#163422] to-[#244C33] p-6 flex flex-col justify-between text-white">
        <span className="self-start bg-white/20 border border-white/30 backdrop-blur-xs text-[9px] font-hanken font-bold uppercase tracking-widest px-2.5 py-1 rounded">
          SPECIMEN OF THE MONTH
        </span>
        <div>
          <h3 className="font-libre text-xl font-bold text-white mb-1">
            Conservatory Collection
          </h3>
          <p className="font-hanken text-xs text-white/80">
            Top ordered specimens from live customer sales will automatically be highlighted here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-57.5 overflow-hidden rounded-xl shadow-xs group border border-[#E5E2DC] font-hanken">
      <img 
        src={specimen.image} 
        alt={specimen.name} 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute inset-0 p-5 flex flex-col justify-between text-white">
        <div className="flex justify-between items-start">
          <span className="bg-[#163422]/90 border border-[#C6E6CE]/40 backdrop-blur-xs text-[9px] font-hanken font-bold uppercase tracking-widest px-2.5 py-1 rounded">
            SPECIMEN OF THE MONTH (#1 TOP ORDERED)
          </span>
          
          <button 
            onClick={() => toast.info(`#1 Top Ordered: ${specimen.name} (${specimen.commonName})`)}
            className="w-8 h-8 rounded-md bg-white/20 hover:bg-white/30 backdrop-blur-xs flex items-center justify-center text-white transition cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h3 className="font-libre text-2xl font-bold text-white mb-0.5 leading-tight italic">
            {specimen.name}
          </h3>
          <p className="font-hanken text-xs font-semibold text-white/90">
            {specimen.commonName}
          </p>
        </div>
      </div>
    </div>
  )
}

export default SpecimenOfMonth
