import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import OrderStats from '../../components/orders/OrderStats'
import OrdersTable from '../../components/orders/OrdersTable'
import OrderDetails from '../../components/orders/OrderDetails'
import { supabase } from '../../lib/supabase'
import { filterActiveOrders, markOrderDeleted } from '../../lib/deletionSync'
import { toast } from 'sonner'

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

    const handleSync = () => fetchLiveOrders()
    window.addEventListener('tocos:data_changed', handleSync)
    window.addEventListener('storage', handleSync)

    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener('tocos:data_changed', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [])

  const normalizeStatus = (rawStatus) => {
    if (!rawStatus) return 'Pending'
    const s = String(rawStatus).trim().toLowerCase()
    if (s === 'placed' || s === 'pending') return 'Pending'
    if (s === 'confirmed' || s === 'processing') return 'Confirmed'
    if (s === 'health check' || s === 'health_check') return 'Health Check'
    if (s === 'shipped' || s === 'dispatched') return 'Shipped'
    if (s === 'delivered') return 'Delivered'
    if (s === 'cancelled' || s === 'canceled') return 'Cancelled'
    return rawStatus
  }

  const fetchLiveOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        const activeData = filterActiveOrders(data)

        // Load persistent local overrides (handles DB lag & custom UTR mappings)
        const statusOverrides = JSON.parse(localStorage.getItem('tocos_order_status_overrides') || '{}')
        const utrMap = JSON.parse(localStorage.getItem('tocos_order_utrs') || '{}')

        const extractUtr = (str) => {
          if (!str) return ''
          const match = String(str).match(/\b\d{12}\b/)
          return match ? match[0] : ''
        }

        const mapped = activeData.map(o => {
          const customerName = o.shipping_name || o.customer_name || o.recipient || (o.email ? o.email.split('@')[0] : 'Customer')
          const initials = customerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
          const rawId = o.id || o.order_id || o.orderId || 'ORD'
          const displayId = o.order_number 
            ? `#TOC-${String(o.order_number).padStart(4, '0')}`
            : `#TOC-${String(rawId).replace(/^#/, '').slice(0, 6).toUpperCase()}`
          const numTotal = typeof o.total_amount === 'number' ? o.total_amount : parseFloat(String(o.total_amount || 0).replace(/[^\d.]/g, ''))

          // Extract UTR from multiple reliable sources
          const utrFromStore = utrMap[rawId] || utrMap[displayId] || (o.order_number ? utrMap[String(o.order_number)] : '')
          const utrVal = utrFromStore || o.utr_number || o.utrNumber || o.utr || extractUtr(o.payment_method) || extractUtr(o.shipping_landmark) || ''

          // Determine effective status (checking overrides first so status change never reverts)
          const overrideStatus = statusOverrides[rawId] || statusOverrides[displayId] || (o.order_number ? statusOverrides[String(o.order_number)] : null)
          const effectiveStatus = overrideStatus || normalizeStatus(o.status)

          return {
            id: displayId,
            rawId: rawId,
            orderNumber: o.order_number,
            customer: customerName,
            customerInitial: initials || 'C',
            amount: numTotal > 0 ? `₹ ${numTotal.toLocaleString('en-IN')}` : (o.total_amount || '₹ 0'),
            rawAmount: numTotal,
            status: effectiveStatus,
            email: o.customer_email || o.email || 'Not provided',
            phone: o.customer_phone || o.phone_number || 'Not provided',
            address: o.shipping_address || 'Address on file',
            city: o.shipping_city || '',
            zip: o.shipping_zip || '',
            items: o.items || [],
            utr_number: utrVal,
            payment_method: o.payment_method || 'UPI',
            createdAt: o.created_at || new Date().toISOString()
          }
        })

        setOrdersList(mapped)
        if (mapped.length > 0) {
          setSelectedOrder(prev => prev ? (mapped.find(item => item.id === prev.id || item.rawId === prev.rawId) || mapped[0]) : mapped[0])
        } else {
          setSelectedOrder(null)
        }

        const pendingCount = mapped.filter(o => o.status === 'Pending').length
        const confirmedCount = mapped.filter(o => o.status === 'Confirmed' || o.status === 'Processing' || o.status === 'Health Check').length
        const shippedCount = mapped.filter(o => o.status === 'Shipped').length
        const deliveredCount = mapped.filter(o => o.status === 'Delivered').length

        setStatsSummary({
          pending: pendingCount,
          confirmed: confirmedCount,
          shipped: shippedCount,
          delivered: deliveredCount
        })
      } else {
        setOrdersList([])
        setSelectedOrder(null)
        setStatsSummary({ pending: 0, confirmed: 0, shipped: 0, delivered: 0 })
      }
    } catch (e) {
      console.warn('Orders fetch error:', e)
      setOrdersList([])
      setSelectedOrder(null)
      setStatsSummary({ pending: 0, confirmed: 0, shipped: 0, delivered: 0 })
    }
  }

  const handleDeleteOrder = async (targetOrderOrId) => {
    const target = typeof targetOrderOrId === 'object'
      ? targetOrderOrId
      : ordersList.find(o => o.id === targetOrderOrId || o.rawId === targetOrderOrId)

    if (!target) return
    const displayId = target.id || target.rawId
    if (!window.confirm(`Are you sure you want to permanently delete order ${displayId}?`)) return

    try {
      await markOrderDeleted(target)
      setOrdersList(prev => prev.filter(o => o.id !== target.id && o.rawId !== target.rawId))
      setSelectedOrder(prev => (prev && (prev.id === target.id || prev.rawId === target.rawId)) ? null : prev)
      toast.success(`Order ${displayId} permanently deleted.`)
    } catch (e) {
      console.error('Delete order error:', e)
      toast.error('Failed to delete order: ' + e.message)
    }
  }

  const handleOrderStatusUpdate = async (targetOrderOrId, newStatus) => {
    const target = typeof targetOrderOrId === 'object'
      ? targetOrderOrId
      : ordersList.find(o => o.id === targetOrderOrId || o.rawId === targetOrderOrId)

    const displayId = target?.id || targetOrderOrId
    const rawUuid = target?.rawId
    const orderNum = target?.orderNumber

    // 1. Instant optimistic state update
    setOrdersList(prev => prev.map(o => (o.id === displayId || o.rawId === rawUuid) ? { ...o, status: newStatus } : o))
    setSelectedOrder(prev => (prev && (prev.id === displayId || prev.rawId === rawUuid)) ? { ...prev, status: newStatus } : prev)

    // 2. Persist to status overrides in localStorage so it never snaps back
    try {
      const overrides = JSON.parse(localStorage.getItem('tocos_order_status_overrides') || '{}')
      if (rawUuid) overrides[rawUuid] = newStatus
      if (displayId) overrides[displayId] = newStatus
      if (orderNum) overrides[String(orderNum)] = newStatus
      localStorage.setItem('tocos_order_status_overrides', JSON.stringify(overrides))
      window.dispatchEvent(new Event('storage'))
    } catch (e) {}

    // 3. Persist update directly into Supabase via real UUID or order_number
    try {
      if (rawUuid && rawUuid.includes('-') && rawUuid.length > 20) {
        const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', rawUuid)
        if (error && orderNum) {
          await supabase.from('orders').update({ status: newStatus }).eq('order_number', orderNum)
        }
      } else if (orderNum) {
        await supabase.from('orders').update({ status: newStatus }).eq('order_number', orderNum)
      }
    } catch (e) {
      console.error("Error updating order status in Supabase DB:", e)
    }

    fetchLiveOrders()
  }

  const handleUtrUpdate = async (targetOrderOrId, newUtr) => {
    const target = typeof targetOrderOrId === 'object'
      ? targetOrderOrId
      : ordersList.find(o => o.id === targetOrderOrId || o.rawId === targetOrderOrId)

    const displayId = target?.id || targetOrderOrId
    const rawUuid = target?.rawId
    const orderNum = target?.orderNumber
    const cleanUtr = String(newUtr).trim()

    // 1. Optimistic state update
    setOrdersList(prev => prev.map(o => (o.id === displayId || o.rawId === rawUuid) ? { ...o, utr_number: cleanUtr } : o))
    setSelectedOrder(prev => (prev && (prev.id === displayId || prev.rawId === rawUuid)) ? { ...prev, utr_number: cleanUtr } : prev)

    // 2. Save to local storage UTR map
    try {
      const utrMap = JSON.parse(localStorage.getItem('tocos_order_utrs') || '{}')
      if (rawUuid) utrMap[rawUuid] = cleanUtr
      if (displayId) utrMap[displayId] = cleanUtr
      if (orderNum) utrMap[String(orderNum)] = cleanUtr
      localStorage.setItem('tocos_order_utrs', JSON.stringify(utrMap))
      window.dispatchEvent(new Event('storage'))
    } catch (e) {}

    // 3. Persist into Supabase payment_method and shipping_landmark
    try {
      const paymentText = `UPI / UTR: ${cleanUtr}`
      if (rawUuid && rawUuid.includes('-') && rawUuid.length > 20) {
        await supabase.from('orders').update({ payment_method: paymentText }).eq('id', rawUuid)
      } else if (orderNum) {
        await supabase.from('orders').update({ payment_method: paymentText }).eq('order_number', orderNum)
      }
    } catch (e) {
      console.error("Error updating UTR in Supabase:", e)
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
              onStatusChange={handleOrderStatusUpdate}
              onDeleteOrder={handleDeleteOrder}
            />
          </div>

          {/* Right Column: Active Order Details Side Panel */}
          {selectedOrder && (
            <OrderDetails 
              order={selectedOrder}
              onClose={() => setSelectedOrder(null)}
              onStatusChange={handleOrderStatusUpdate}
              onUtrUpdate={handleUtrUpdate}
              onDeleteOrder={handleDeleteOrder}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default Orders
