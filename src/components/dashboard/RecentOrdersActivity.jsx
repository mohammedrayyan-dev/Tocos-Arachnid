import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const RecentOrdersActivity = () => {
  const defaultOrders = [
    {
      orderId: '#TA-89241',
      customer: 'Elias Thorne',
      species: 'Poecilotheria metallica',
      price: '₹ 28,000',
      status: 'Shipped'
    },
    {
      orderId: '#TA-79142',
      customer: 'Arjun Mehta',
      species: 'Brachypelma hamorii',
      price: '₹ 14,800',
      status: 'Confirmed'
    },
    {
      orderId: '#TA-65103',
      customer: 'Dr. Sarah Jenkins',
      species: 'Acanthoscurria geniculata',
      price: '₹ 12,000',
      status: 'Pending'
    }
  ]

  const [recentOrders, setRecentOrders] = useState(defaultOrders)

  useEffect(() => {
    fetchRecentOrders()
  }, [])

  const fetchRecentOrders = async () => {
    let localOrders = []
    let dbOrders = []

    try {
      const saved = localStorage.getItem('tocos_admin_orders')
      if (saved) {
        const arr = JSON.parse(saved)
        if (Array.isArray(arr)) localOrders.push(...arr)
      }
    } catch (e) {}

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('user_orders_')) {
          const arr = JSON.parse(localStorage.getItem(key) || '[]')
          if (Array.isArray(arr)) localOrders.push(...arr)
        }
      }
    } catch (e) {}

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6)

      if (!error && data) dbOrders = data
    } catch (e) {}

    const combinedMap = new Map()
    localOrders.forEach(o => {
      if (o && (o.id || o.order_id || o.orderId)) {
        combinedMap.set(String(o.id || o.order_id || o.orderId), o)
      }
    })
    dbOrders.forEach(o => {
      if (o && (o.id || o.order_id || o.orderId)) {
        combinedMap.set(String(o.id || o.order_id || o.orderId), o)
      }
    })

    const combinedList = Array.from(combinedMap.values())
    if (combinedList.length > 0) {
      combinedList.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      const mapped = combinedList.slice(0, 6).map(o => {
        const rawId = o.id || o.order_id || o.orderId || '#TA-89241'
        const numTotal = typeof o.total_amount === 'number' ? o.total_amount : parseFloat(String(o.total_amount || o.rawTotalAmount || o.amount || 0).replace(/[^\d.]/g, ''))
        const firstItem = Array.isArray(o.items) && o.items[0] ? o.items[0].name : 'Live Specimen Purchase'

        return {
          orderId: String(rawId).startsWith('#') ? String(rawId) : `#${rawId}`,
          customer: o.shipping_name || o.customer_name || o.recipient || 'Anonymous Customer',
          species: firstItem,
          price: numTotal > 0 ? `₹ ${numTotal.toLocaleString('en-IN')}` : (o.total_amount || '₹ 0'),
          status: o.status || 'Pending'
        }
      })
      setRecentOrders(mapped)
    }
  }

  return (
    <div className="bg-white border border-[#E5E2DC] rounded-xl p-6 shadow-xs font-hanken">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-libre font-bold text-[#163422]">
          Recent Orders Activity
        </h2>
        <Link 
          to="/admin/orders" 
          className="text-xs font-bold text-[#163422] hover:underline uppercase tracking-wider"
        >
          View All
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#E5E2DC] bg-[#FAF8F5]">
              <th className="py-3 px-4 font-bold text-[10px] text-[#6E756F] uppercase tracking-wider">
                ORDER ID
              </th>
              <th className="py-3 px-4 font-bold text-[10px] text-[#6E756F] uppercase tracking-wider">
                CUSTOMER
              </th>
              <th className="py-3 px-4 font-bold text-[10px] text-[#6E756F] uppercase tracking-wider">
                DETAILS
              </th>
              <th className="py-3 px-4 font-bold text-[10px] text-[#6E756F] uppercase tracking-wider">
                PRICE
              </th>
              <th className="py-3 px-4 font-bold text-[10px] text-[#6E756F] uppercase tracking-wider">
                STATUS
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E2DC]">
            {recentOrders.map((order, idx) => (
              <tr key={idx} className="hover:bg-gray-50/80 transition">
                <td className="py-3.5 px-4 font-bold text-xs text-[#163422]">
                  {order.orderId}
                </td>
                <td className="py-3.5 px-4 font-semibold text-xs text-[#1C1B1B]">
                  {order.customer}
                </td>
                <td className="py-3.5 px-4 text-xs text-[#525B54] italic">
                  {order.species}
                </td>
                <td className="py-3.5 px-4 font-libre font-bold text-xs text-[#163422]">
                  {order.price}
                </td>
                <td className="py-3.5 px-4">
                  <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-bold ${
                    order.status === 'Confirmed'
                      ? 'bg-[#FCECD9] text-[#785832] border border-[#F5D8B6]'
                      : order.status === 'Shipped'
                      ? 'bg-[#EAF5ED] text-[#163422] border border-[#C6E6CE]'
                      : order.status === 'Delivered'
                      ? 'bg-[#C8EBD0] text-[#163422]'
                      : 'bg-gray-100 text-[#6E756F] border border-gray-200'
                  }`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RecentOrdersActivity
