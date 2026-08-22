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
    let dbOrders = []
    let localAdminOrders = []

    // 1. Gather all local orders stored on device
    try {
      const saved = localStorage.getItem('tocos_admin_orders')
      if (saved) {
        const arr = JSON.parse(saved)
        if (Array.isArray(arr)) localAdminOrders.push(...arr)
      }
    } catch (e) {}

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.startsWith('user_orders_') || key.includes('order'))) {
          const val = localStorage.getItem(key)
          if (val && val.startsWith('[')) {
            const parsed = JSON.parse(val)
            if (Array.isArray(parsed)) localAdminOrders.push(...parsed)
          }
        }
      }
    } catch (e) {}

    // 2. Fetch from Supabase DB
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        dbOrders = data
      }
    } catch (e) {
      console.warn('Orders DB fetch notice:', e)
    }

    // 3. Auto-sync missing local orders to Supabase DB
    const dbOrderIds = new Set(dbOrders.map(o => String(o.id || o.order_id || o.orderId)))
    const unsyncedLocal = localAdminOrders.filter(o => o && o.id && !dbOrderIds.has(String(o.id)))

    if (unsyncedLocal.length > 0) {
      try {
        const payloadToSync = unsyncedLocal.map(o => ({
          id: o.id,
          user_id: o.user_id || null,
          email: o.email || 'customer@tocos.com',
          customer_name: o.customer_name || o.shipping_name || o.recipient || 'Customer',
          shipping_name: o.shipping_name || o.customer_name || o.recipient || 'Customer',
          phone_number: o.phone_number || o.customer_phone || '9876543210',
          shipping_address: o.shipping_address || o.address || 'Address on file',
          shipping_city: o.shipping_city || o.city || 'Bengaluru',
          shipping_state: o.shipping_state || o.state || 'Karnataka',
          shipping_zip: o.shipping_zip || o.zip || '560001',
          shipping_landmark: o.shipping_landmark || 'Near Center',
          total_amount: o.total_amount || o.rawTotalAmount || 0,
          items: o.items || [],
          utr_number: o.utr_number || o.utrNumber || o.utr || '',
          status: o.status || 'Pending',
          created_at: o.created_at || new Date().toISOString()
        }))

        const { error: syncErr } = await supabase.from('orders').insert(payloadToSync)
        if (syncErr) {
          // Fallback insert if DB table schema has fewer columns
          const fallbackPayload = payloadToSync.map(p => ({
            user_id: p.user_id,
            shipping_name: p.shipping_name,
            phone_number: p.phone_number,
            shipping_address: p.shipping_address,
            shipping_city: p.shipping_city,
            shipping_state: p.shipping_state,
            shipping_zip: p.shipping_zip,
            shipping_landmark: p.shipping_landmark,
            total_amount: p.total_amount,
            status: p.status
          }))
          await supabase.from('orders').insert(fallbackPayload)
        } else {
          console.log('Successfully synced local orders to Supabase DB!')
        }
      } catch (e) {
        console.warn('Auto sync local to DB exception:', e)
      }
    }

    // 4. Deduplicate DB + Local orders
    const combinedMap = new Map()

    localAdminOrders.forEach(o => {
      if (o && (o.id || o.order_id || o.orderId)) {
        const key = String(o.id || o.order_id || o.orderId)
        combinedMap.set(key, o)
      }
    })

    dbOrders.forEach(o => {
      if (o && (o.id || o.order_id || o.orderId)) {
        const key = String(o.id || o.order_id || o.orderId)
        combinedMap.set(key, o)
      }
    })

    const combinedList = Array.from(combinedMap.values())

    const mapped = combinedList.map(o => {
      const customerName = o.shipping_name || o.customer_name || o.recipient || (o.email ? o.email.split('@')[0] : 'Customer')
      const initials = customerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
      const rawId = o.id || o.order_id || o.orderId || `#AF-${Math.floor(100 + Math.random() * 900)}-XBB`
      const displayId = String(rawId).startsWith('#') ? String(rawId) : `#${rawId}`
      const numTotal = typeof o.total_amount === 'number' ? o.total_amount : (typeof o.rawTotalAmount === 'number' ? o.rawTotalAmount : parseFloat(String(o.total_amount || o.amount || 0).replace(/[^\d.]/g, '')))

      return {
        id: displayId,
        rawId: rawId,
        customer: customerName,
        customerInitial: initials || 'C',
        amount: numTotal > 0 ? `₹ ${numTotal.toLocaleString('en-IN')}` : (o.total_amount || o.amount || '₹ 0'),
        rawAmount: numTotal,
        status: o.status || 'Pending',
        email: o.email || o.customer_email || 'Not provided',
        phone: o.phone_number || o.customer_phone || 'Not provided',
        address: o.shipping_address || 'Address on file',
        city: o.shipping_city || o.city_state || '',
        zip: o.shipping_zip || o.postal_code || '',
        items: o.items || [],
        createdAt: o.created_at || new Date().toISOString()
      }
    })

    // Sort newest first
    mapped.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    setOrdersList(mapped)
    if (mapped.length > 0) {
      setSelectedOrder(prev => prev ? (mapped.find(item => item.id === prev.id) || mapped[0]) : mapped[0])
    }

    // Calculate live stats summary
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
                  const localOrders = JSON.parse(localStorage.getItem('tocos_admin_orders') || '[]')
                  const updatedLocal = localOrders.map(o => (o.id === orderId || o.id === rawId) ? { ...o, status: newStatus } : o)
                  localStorage.setItem('tocos_admin_orders', JSON.stringify(updatedLocal))

                  await supabase.from('orders').update({ status: newStatus }).eq('id', rawId)
                } catch (e) {}

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
