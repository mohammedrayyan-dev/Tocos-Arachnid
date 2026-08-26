import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import OrderStats from '../../components/orders/OrderStats'
import OrdersTable from '../../components/orders/OrdersTable'
import OrderDetails from '../../components/orders/OrderDetails'
import { supabase } from '../../lib/supabase'

const Orders = () => {
  const [ordersList, setOrdersList] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [statsSummary, setStatsSummary] = useState(null)

  useEffect(() => {
    fetchLiveOrders()

    // Real-time channel for instant order updates on Admin page
    const channel = supabase
      .channel('admin-orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchLiveOrders()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchLiveOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        const mapped = data.map(o => {
          const customerName = o.shipping_name || o.customer_name || o.recipient || (o.email ? o.email.split('@')[0] : 'Customer')
          const initials = customerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
          const rawId = o.id || o.order_id || o.orderId || `#AF-${Math.floor(100 + Math.random() * 900)}-XBB`
          const displayId = String(rawId).startsWith('#') ? String(rawId) : `#${rawId}`
          const numTotal = typeof o.total_amount === 'number' ? o.total_amount : parseFloat(String(o.total_amount || 0).replace(/[^\d.]/g, ''))
          const utrVal = o.utr_number || o.utrNumber || o.utr || ''

          return {
            id: displayId,
            rawId: rawId,
            customer: customerName,
            customerInitial: initials || 'C',
            amount: numTotal > 0 ? `₹ ${numTotal.toLocaleString('en-IN')}` : (o.total_amount || '₹ 0'),
            rawAmount: numTotal,
            status: o.status || 'Pending',
            email: o.email || 'Not provided',
            phone: o.phone_number || 'Not provided',
            address: o.shipping_address || 'Address on file',
            city: o.shipping_city || '',
            zip: o.shipping_zip || '',
            items: o.items || [],
            utr_number: utrVal,
            createdAt: o.created_at || new Date().toISOString()
          }
        })

        setOrdersList(mapped)
        if (mapped.length > 0) {
          setSelectedOrder(prev => prev ? (mapped.find(item => item.id === prev.id) || mapped[0]) : mapped[0])
        }

        const pendingCount = mapped.filter(o => o.status === 'Pending').length
        const confirmedCount = mapped.filter(o => o.status === 'Confirmed' || o.status === 'Processing').length
        const shippedCount = mapped.filter(o => o.status === 'Shipped').length
        const deliveredCount = mapped.filter(o => o.status === 'Delivered').length

        setStatsSummary({
          pending: pendingCount,
          confirmed: confirmedCount,
          shipped: shippedCount,
          delivered: deliveredCount
        })
      }
    } catch (e) {
      console.warn('Orders fetch error:', e)
    }
  }

  return (
    <div className="flex flex-row w-full min-h-screen bg-[#FCF9F8]">
      {/* Admin Sidebar */}
      <AdminSidebar currentPage="Orders" />

      {/* Main Content Area */}
      <div className="ml-0 lg:ml-64 flex-1 p-4 sm:p-6 lg:p-10 pt-24 sm:pt-28 lg:pt-10 bg-[#FCF9F8] w-full min-w-0 font-hanken">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 mb-8 pb-6 border-b border-[#E5E2DC]">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-libre font-bold text-[#163422] tracking-tight">
              Order Management
            </h1>
            <p className="font-hanken text-xs font-semibold text-[#525B54] mt-1.5">
              Live Customer Transactions & Shipment Tracking
            </p>
          </div>
        </div>

        {/* Top 4 Stat Cards */}
        <OrderStats liveCounts={statsSummary} orders={ordersList} />

        {/* Orders Content Area (Left Table + Right Details Side Panel) */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Column: Orders List Table */}
          <div className="flex-1 w-full">
            <OrdersTable 
              orders={ordersList}
              onSelectOrder={setSelectedOrder}
              selectedOrderId={selectedOrder?.id}
              onOrdersUpdated={fetchLiveOrders}
            />
          </div>

          {/* Right Column: Active Order Details Side Panel */}
          {selectedOrder && (
            <OrderDetails 
              order={selectedOrder}
              onClose={() => setSelectedOrder(null)}
              onStatusChange={async (orderId, newStatus) => {
                const rawId = orderId.replace(/^#/, '')
                setOrdersList(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
                setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null)

                try {
                  await supabase.from('orders').update({ status: newStatus }).eq('id', rawId)
                } catch (e) {
                  console.error("Error updating order status in Supabase DB:", e)
                }

                fetchLiveOrders()
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default Orders
