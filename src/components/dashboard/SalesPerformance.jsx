import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const parseAmountNumber = (val) => {
  if (val === undefined || val === null) return 0
  if (typeof val === 'number') return isNaN(val) ? 0 : val
  const str = String(val).replace(/,/g, '').replace(/[^\d.]/g, '')
  const num = parseFloat(str)
  return isNaN(num) ? 0 : num
}

const SalesPerformance = () => {
  const [currentRevenue, setCurrentRevenue] = useState(962)
  const targetRevenue = 50000 // Target 50K

  useEffect(() => {
    fetchLiveRevenue()
  }, [])

  const fetchLiveRevenue = async () => {
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
      const totalRev = combinedOrders.reduce((sum, o) => sum + parseAmountNumber(o.total_amount || o.amount || o.rawTotalAmount), 0)

      if (totalRev > 0) setCurrentRevenue(totalRev)
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
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="font-libre text-3xl font-bold text-[#163422]">
              {percentage}%
            </p>
            <p className="font-hanken text-[10px] font-bold text-[#6E756F] uppercase tracking-wider">
              GOAL
            </p>
          </div>
        </div>

        {/* Current vs Target Grid */}
        <div className="w-full grid grid-cols-2 gap-3 font-hanken">
          <div className="bg-[#FAF8F5] border border-[#E5E2DC] p-3 rounded-lg text-center">
            <p className="font-hanken text-[10px] font-bold text-[#6E756F] uppercase tracking-wider mb-0.5">
              Current
            </p>
            <p className="font-libre font-bold text-sm text-[#163422]">
              ₹ {currentRevenue.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="bg-[#FAF8F5] border border-[#E5E2DC] p-3 rounded-lg text-center">
            <p className="font-hanken text-[10px] font-bold text-[#6E756F] uppercase tracking-wider mb-0.5">
              Target
            </p>
            <p className="font-libre font-bold text-sm text-[#163422]">
              ₹ 50K
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SalesPerformance
