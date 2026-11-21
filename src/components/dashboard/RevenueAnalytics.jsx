import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { filterActiveOrders } from '../../lib/deletionSync'

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
    { month: 'Aug', revenue: 0 },
    { month: 'Sep', revenue: 0 },
    { month: 'Oct', revenue: 0 },
    { month: 'Nov', revenue: 0 },
    { month: 'Dec', revenue: 0 }
  ])

  const [totalGrossRev, setTotalGrossRev] = useState(0)

  useEffect(() => {
    fetchMonthlyRevenue()

    const channel = supabase
      .channel('revenue-analytics-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchMonthlyRevenue())
      .subscribe()

    const handleSync = () => fetchMonthlyRevenue()
    window.addEventListener('tocos:data_changed', handleSync)
    window.addEventListener('storage', handleSync)

    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener('tocos:data_changed', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [])

  const fetchMonthlyRevenue = async () => {
    try {
      let activeOrders = []
      try {
        const { data } = await supabase.from('orders').select('*')
        if (data && Array.isArray(data)) {
          activeOrders = filterActiveOrders(data)
        }
      } catch (e) {}

      const monthBuckets = Array(12).fill(0)
      let total = 0

      activeOrders.forEach(o => {
        const amt = parseAmountNumber(o.total_amount || o.amount || o.rawTotalAmount)
        total += amt
        const dateObj = new Date(o.created_at || o.createdAt || Date.now())
        const monthIndex = isNaN(dateObj.getMonth()) ? new Date().getMonth() : dateObj.getMonth()
        monthBuckets[monthIndex] += amt
      })

      setTotalGrossRev(total)

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

      {/* SVG Bar Chart with Responsive Aspect Ratio */}
      <div className="w-full h-48 sm:h-56 relative pt-2">
        {/* 50K Target Reference Line */}
        <div 
          className="absolute left-0 right-0 border-b border-dashed border-[#785832]/60 z-0 pointer-events-none"
          style={{ 
            bottom: `${Math.min(95, Math.max(5, (targetMaxScale / maxRev) * 80))}%` 
          }}
        >
          <span className="absolute -top-4 right-0 font-hanken text-[9px] font-bold text-[#785832] tracking-wider uppercase bg-white/80 px-1 rounded">
            Target 50K
          </span>
        </div>

        <div className="h-full flex items-end justify-between gap-1 sm:gap-3 px-1 sm:px-2 relative z-10">
          {monthlyData.map((item, index) => {
            const heightPercent = maxRev > 0 ? (item.revenue / maxRev) * 100 : 0
            const isZero = item.revenue === 0

            return (
              <div 
                key={index} 
                className="flex-1 flex flex-col items-center gap-2 group h-full justify-end cursor-pointer"
              >
                {/* Value on Hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-4 bg-[#1C1B1B] text-white text-[10px] font-semibold py-0.5 px-2 rounded whitespace-nowrap z-20 pointer-events-none shadow-md">
                  {item.month}: ₹ {item.revenue.toLocaleString('en-IN')}
                </div>

                {/* Bar */}
                <div className="w-full flex justify-center items-end h-[80%]">
                  <div
                    className={`w-full max-w-[28px] rounded-t-sm transition-all duration-500 ease-out ${
                      isZero
                        ? 'bg-[#E5E2DC]/50 h-1' 
                        : 'bg-[#163422] group-hover:bg-[#785832]'
                    }`}
                    style={{
                      height: isZero ? '4px' : `${Math.max(6, heightPercent)}%`
                    }}
                  />
                </div>

                {/* Month Label */}
                <span className="font-hanken text-[10px] sm:text-xs font-semibold text-[#6E756F] group-hover:text-[#163422] transition-colors">
                  {item.month}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default RevenueAnalytics
