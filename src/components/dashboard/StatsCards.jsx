import { useState, useEffect } from 'react'
import { ShoppingCart, Banknote, Users, Package } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { filterActiveOrders, filterActiveProducts } from '../../lib/deletionSync'

const StatsCards = () => {
  const [stats, setStats] = useState({
    totalOrders: '0',
    rawOrdersCount: 0,
    totalRevenue: '₹ 0',
    totalCustomers: '0',
    availableStock: '0 Units'
  })

  useEffect(() => {
    fetchLiveStats()

    const channel = supabase
      .channel('dashboard-stats-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchLiveStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchLiveStats())
      .subscribe()

    const handleSync = () => fetchLiveStats()
    window.addEventListener('tocos:data_changed', handleSync)
    window.addEventListener('storage', handleSync)

    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener('tocos:data_changed', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [])

  const parseAmountNumber = (val) => {
    if (val === undefined || val === null) return 0
    if (typeof val === 'number') return isNaN(val) ? 0 : val
    const clean = String(val).replace(/,/g, '').replace(/[^\d.]/g, '')
    const num = parseFloat(clean)
    return isNaN(num) ? 0 : num
  }

  const fetchLiveStats = async () => {
    try {
      // 1. Fetch Orders from Supabase DB only
      let activeOrders = []
      try {
        const { data } = await supabase.from('orders').select('*')
        if (data && Array.isArray(data)) {
          activeOrders = filterActiveOrders(data)
        }
      } catch (e) {}

      const totalRev = activeOrders.reduce((sum, o) => sum + parseAmountNumber(o.total_amount || o.amount || o.rawTotalAmount), 0)

      // 2. Fetch Customers Count from DB
      let customerCount = 0
      try {
        const { data: profiles } = await supabase.from('profiles').select('id')
        if (profiles) customerCount = profiles.length
      } catch (e) {}

      // 3. Fetch Stock Sum from DB
      let stockSum = 0
      try {
        const { data: products } = await supabase.from('products').select('*')
        if (products && Array.isArray(products)) {
          const activeProducts = filterActiveProducts(products)
          stockSum = activeProducts.reduce((acc, p) => acc + (p.stock || 0), 0)
        }
      } catch (e) {
        stockSum = 0
      }

      setStats({
        totalOrders: activeOrders.length.toLocaleString(),
        rawOrdersCount: activeOrders.length,
        totalRevenue: `₹ ${totalRev.toLocaleString('en-IN')}`,
        totalCustomers: customerCount ? customerCount.toLocaleString() : '0',
        availableStock: `${stockSum.toLocaleString()} Units`
      })
    } catch (e) {
      console.warn('Stats fetch notice:', e)
    }
  }

  const cards = [
    {
      label: 'TOTAL ORDERS',
      value: stats.totalOrders,
      change: stats.rawOrdersCount > 0 ? `${stats.rawOrdersCount} Live` : 'Live 0',
      isPositive: true,
      Icon: ShoppingCart,
      iconColor: 'text-[#163422]'
    },
    {
      label: 'TOTAL REVENUE',
      value: stats.totalRevenue,
      change: 'Real-time',
      isPositive: true,
      Icon: Banknote,
      iconColor: 'text-[#785832]'
    },
    {
      label: 'TOTAL CUSTOMERS',
      value: stats.totalCustomers,
      change: 'Registered',
      isPositive: true,
      Icon: Users,
      iconColor: 'text-[#163422]'
    },
    {
      label: 'AVAILABLE STOCK',
      value: stats.availableStock,
      change: 'In Catalog',
      isPositive: true,
      Icon: Package,
      iconColor: 'text-[#525B54]'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 font-hanken">
      {cards.map((card, idx) => {
        const CardIcon = card.Icon
        return (
          <div 
            key={idx} 
            className="bg-white border border-[#E5E2DC] rounded-xl p-5 shadow-2xs hover:shadow-xs transition duration-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#FAF8F5] border border-[#E5E2DC] flex items-center justify-center shrink-0">
                <CardIcon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                card.isPositive 
                  ? 'bg-[#EAF5ED] text-[#163422] border border-[#C6E6CE]' 
                  : 'bg-[#FAF8F5] text-[#525B54] border border-[#E5E2DC]'
              }`}>
                {card.change}
              </span>
            </div>

            <p className="text-[#6E756F] text-[10px] font-bold uppercase tracking-[0.16em] mb-1">
              {card.label}
            </p>
            <p className="text-xl md:text-2xl font-bold text-[#1C1B1B]">
              {card.value}
            </p>
          </div>
        )
      })}
    </div>
  )
}

export default StatsCards
