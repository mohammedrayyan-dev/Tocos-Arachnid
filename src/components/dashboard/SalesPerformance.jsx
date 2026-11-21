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

const SalesPerformance = () => {
  const [currentRevenue, setCurrentRevenue] = useState(0)
  const targetRevenue = 50000 // Target 50K

  useEffect(() => {
    fetchLiveRevenue()

    const channel = supabase
      .channel('sales-perf-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchLiveRevenue())
      .subscribe()

    const handleSync = () => fetchLiveRevenue()
    window.addEventListener('tocos:data_changed', handleSync)
    window.addEventListener('storage', handleSync)

    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener('tocos:data_changed', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [])

  const fetchLiveRevenue = async () => {
    try {
      let activeOrders = []
      try {
        const { data } = await supabase.from('orders').select('*')
        if (data && Array.isArray(data)) {
          activeOrders = filterActiveOrders(data)
        }
      } catch (e) {}

      const totalRev = activeOrders.reduce((sum, o) => sum + parseAmountNumber(o.total_amount || o.amount || o.rawTotalAmount), 0)
      setCurrentRevenue(totalRev)
    } catch (e) {
      console.warn('Sales performance fetch notice:', e)
    }
  }

  const percentage = Math.min(100, Math.round((currentRevenue / targetRevenue) * 100))
  const circumference = 2 * Math.PI * 42
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="bg-white border border-[#E5E2DC] rounded-xl p-5 shadow-xs font-hanken">
      <h3 className="font-hanken text-[10px] font-bold text-[#6E756F] uppercase tracking-[0.18em] mb-4">
        SALES PERFORMANCE
      </h3>

      <div className="flex flex-col items-center">
        {/* Progress Ring */}
        <div className="relative w-36 h-36 mb-6">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#E5E2DC"
              strokeWidth="7"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#163422"
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center Info */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-libre text-3xl font-bold text-[#163422]">
              {percentage}%
            </span>
            <span className="font-hanken text-[10px] font-semibold text-[#6E756F]">
              of Target
            </span>
          </div>
        </div>

        {/* Target Details */}
        <div className="w-full space-y-2.5 pt-4 border-t border-[#E5E2DC]">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-[#525B54]">Current Sales</span>
            <span className="font-bold text-[#163422]">₹ {currentRevenue.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-[#525B54]">Target Goal</span>
            <span className="font-bold text-[#785832]">₹ {targetRevenue.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SalesPerformance
