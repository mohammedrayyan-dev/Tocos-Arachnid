import { useState, useEffect } from 'react'
import { TrendingUp, AlertTriangle, Sparkles, DollarSign } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { filterActiveProducts, filterActiveOrders } from '../../lib/deletionSync'

const parseAmountNumber = (val) => {
  if (val === undefined || val === null) return 0
  if (typeof val === 'number') return isNaN(val) ? 0 : val
  const str = String(val).replace(/,/g, '').replace(/[^\d.]/g, '')
  const num = parseFloat(str)
  return isNaN(num) ? 0 : num
}

const InventoryStats = () => {
  const [statsData, setStatsData] = useState({
    totalSpecimens: '0 Units',
    lowStockAlerts: '0 Items',
    activeSpecies: '0 Species',
    monthlyRevenue: '₹ 0'
  })

  useEffect(() => {
    fetchInventoryMetrics()

    const channel = supabase
      .channel('inventory-stats-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchInventoryMetrics())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchInventoryMetrics())
      .subscribe()

    const handleSync = () => fetchInventoryMetrics()
    window.addEventListener('tocos:data_changed', handleSync)
    window.addEventListener('storage', handleSync)

    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener('tocos:data_changed', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [])

  const fetchInventoryMetrics = async () => {
    try {
      // 1. Fetch Products
      let products = []
      try {
        const { data } = await supabase.from('products').select('*')
        if (data && Array.isArray(data)) products = filterActiveProducts(data)
      } catch (e) {}

      // 2. Fetch Orders
      let activeOrders = []
      try {
        const { data } = await supabase.from('orders').select('*')
        if (data && Array.isArray(data)) activeOrders = filterActiveOrders(data)
      } catch (e) {}

      const totalRev = activeOrders.reduce((sum, o) => sum + parseAmountNumber(o.total_amount || o.amount || o.rawTotalAmount), 0)
      const stockSum = products.length ? products.reduce((sum, p) => sum + (p.stock || 0), 0) : 0
      const lowStockCount = products.length ? products.filter(p => (p.stock || 0) < 5).length : 0
      const activeCount = products.length

      setStatsData({
        totalSpecimens: `${stockSum.toLocaleString()} Units`,
        lowStockAlerts: `${lowStockCount} Item${lowStockCount !== 1 ? 's' : ''}`,
        activeSpecies: `${activeCount} Species`,
        monthlyRevenue: `₹ ${totalRev.toLocaleString('en-IN')}`
      })
    } catch (e) {
      console.warn('Inventory stats fetch notice:', e)
    }
  }

  const stats = [
    {
      label: 'TOTAL SPECIMENS IN STOCK',
      value: statsData.totalSpecimens,
      subtitle: 'Across active inventory',
      isWarning: false,
      Icon: TrendingUp
    },
    {
      label: 'LOW STOCK ALERTS',
      value: statsData.lowStockAlerts,
      subtitle: 'Stock level under 5 units',
      isWarning: true,
      Icon: AlertTriangle
    },
    {
      label: 'ACTIVE SPECIES',
      value: statsData.activeSpecies,
      subtitle: 'Catalog diversity',
      isWarning: false,
      Icon: Sparkles
    },
    {
      label: 'ESTIMATED SALES REVENUE',
      value: statsData.monthlyRevenue,
      subtitle: 'Live order transactions',
      isWarning: false,
      Icon: DollarSign
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 font-hanken">
      {stats.map((stat, idx) => {
        const Icon = stat.Icon
        return (
          <div 
            key={idx} 
            className="bg-white border border-[#E5E2DC] rounded-xl p-5 shadow-2xs hover:shadow-xs transition duration-200"
          >
            <div className="flex justify-between items-start mb-3">
              <Icon className={`w-5 h-5 ${stat.isWarning ? 'text-[#991B1B]' : 'text-[#163422]'}`} />
              <span className="font-hanken text-[11px] font-semibold text-[#6E756F]">
                {stat.subtitle}
              </span>
            </div>

            <p className="text-[#6E756F] text-[10px] font-bold uppercase tracking-[0.16em] mb-1">
              {stat.label}
            </p>
            <p className="text-2xl font-bold text-[#1C1B1B]">
              {stat.value}
            </p>
          </div>
        )
      })}
    </div>
  )
}

export default InventoryStats
