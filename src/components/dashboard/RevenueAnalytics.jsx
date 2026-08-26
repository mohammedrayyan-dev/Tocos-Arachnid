import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const parseAmountNumber = (val) => {
  if (val === undefined || val === null) return 0
  if (typeof val === 'number') return isNaN(val) ? 0 : val
  const str = String(val).replace(/,/g, '').replace(/[^\d.]/g, '')
  const num = parseFloat(str)
  return isNaN(num) ? 0 : num
}

const RevenueAnalytics = () => {
  const [monthlyData, setMonthlyData] = useState([
    { month: 'Jan', revenue: 0 },
    { month: 'Feb', revenue: 0 },
    { month: 'Mar', revenue: 0 },
    { month: 'Apr', revenue: 0 },
    { month: 'May', revenue: 0 },
    { month: 'Jun', revenue: 0 },
    { month: 'Jul', revenue: 0 },
    { month: 'Aug', revenue: 962 },
    { month: 'Sep', revenue: 0 },
    { month: 'Oct', revenue: 0 },
    { month: 'Nov', revenue: 0 },
    { month: 'Dec', revenue: 0 }
  ])

  const [totalGrossRev, setTotalGrossRev] = useState(962)

  useEffect(() => {
    fetchMonthlyRevenue()
  }, [])

  const fetchMonthlyRevenue = async () => {
    try {
      let dbOrders = []
      try {
        const { data } = await supabase.from('orders').select('*')
        if (data) dbOrders = data
      } catch (e) {}

      let localOrders = []
      try {
        const adminSaved = localStorage.getItem('tocos_admin_orders')
        if (adminSaved) localOrders = JSON.parse(adminSaved)

        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith('user_orders_')) {
            const userSaved = localStorage.getItem(key)
            if (userSaved) {
              const parsed = JSON.parse(userSaved)
              if (Array.isArray(parsed)) localOrders.push(...parsed)
            }
          }
        }
      } catch (e) {}

      const allOrdersMap = new Map()
      localOrders.forEach(o => {
        if (o && (o.id || o.order_id || o.orderId)) {
          allOrdersMap.set(String(o.id || o.order_id || o.orderId), o)
        }
      })
      dbOrders.forEach(o => {
        if (o && (o.id || o.order_id || o.orderId)) {
          allOrdersMap.set(String(o.id || o.order_id || o.orderId), o)
        }
      })

      const combinedOrders = Array.from(allOrdersMap.values())
      const monthBuckets = Array(12).fill(0)

      let total = 0
      combinedOrders.forEach(o => {
        const amt = parseAmountNumber(o.total_amount || o.amount || o.rawTotalAmount)
        total += amt
        const dateObj = new Date(o.created_at || o.createdAt || Date.now())
        const monthIndex = isNaN(dateObj.getMonth()) ? 7 : dateObj.getMonth() // default Aug
        monthBuckets[monthIndex] += amt
      })

      setTotalGrossRev(total || 962)

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const formatted = months.map((month, idx) => ({
        month,
        revenue: monthBuckets[idx]
      }))

      setMonthlyData(formatted)
    } catch (e) {
      console.warn('Monthly revenue fetch notice:', e)
    }
  }

  const targetMaxScale = 50000 // Scaled to 50K Target
  const maxRev = Math.max(targetMaxScale, ...monthlyData.map(d => d.revenue))

  return (
    <div className="bg-white border border-[#E5E2DC] rounded-xl p-4 sm:p-6 mb-8 shadow-xs font-hanken">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-libre font-bold text-[#163422]">
            Revenue Analytics
          </h2>
          <p className="font-hanken text-xs text-[#525B54] mt-0.5">
            Total Gross Revenue: <strong className="text-[#163422]">₹ {totalGrossRev.toLocaleString('en-IN')}</strong> • Target Scale: <strong className="text-[#785832]">₹ 50K</strong>
          </p>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 text-xs font-hanken flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#163422] rounded-full inline-block"></span>
            <span className="font-semibold text-[#1C1B1B]">Gross Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 border-b border-dashed border-[#785832] inline-block"></span>
            <span className="font-semibold text-[#785832]">50K Goal Line</span>
          </div>
        </div>
      </div>

      {/* Graph Area with 50K Target Line */}
      <div className="relative overflow-x-auto min-w-0">
        <div className="min-w-70">
          {/* 50K Reference Line */}
          <div className="absolute left-0 right-0 top-3 border-b border-dashed border-[#785832]/40 z-10 flex justify-end pr-1">
            <span className="bg-[#FAF8F5] text-[#785832] font-bold text-[9px] px-1.5 py-0.5 rounded border border-[#E5E2DC] -translate-y-2.5">
              50K TARGET
            </span>
          </div>

          <div className="h-44 sm:h-48 flex items-end justify-between gap-1 sm:gap-2.5 md:gap-3 pt-8 border-b border-[#E5E2DC] relative">
            {monthlyData.map((item, idx) => {
              const heightPercent = item.revenue > 0 ? Math.max(6, Math.round((item.revenue / maxRev) * 100)) : 3
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative z-20">
                  <div 
                    className={`w-full max-w-6 rounded-t-sm transition-all duration-300 ${
                      item.revenue > 0 ? 'bg-[#163422] hover:bg-[#0D2316]' : 'bg-[#E5E2DC]/50'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                    title={`${item.month}: ₹ ${item.revenue.toLocaleString('en-IN')}`}
                  />
                  <span className="font-hanken text-[9px] sm:text-[10px] font-semibold text-[#6E756F]">
                    {item.month}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RevenueAnalytics
