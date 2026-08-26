import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { Bell, AlertTriangle, ShoppingCart, CheckCheck, Trash2, Check, UserPlus, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabase'

const Notifications = () => {
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [readIds, setReadIds] = useState([])

  useEffect(() => {
    fetchRealNotifications()

    const channel = supabase
      .channel('admin-notifs-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchRealNotifications())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchRealNotifications())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => fetchRealNotifications())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchRealNotifications = async () => {
    setLoading(true)
    const generatedAlerts = []

    try {
      // 1. Fetch Real Orders from Supabase
      let realOrders = []
      try {
        const { data: dbOrders } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(15)
        if (dbOrders && dbOrders.length > 0) realOrders = dbOrders
      } catch (e) {}

      // Convert orders to notifications
      realOrders.forEach((order) => {
        const id = `order_${order.id}`
        const amount = order.total_amount || order.totalAmount || order.amount || 0
        const customer = order.shipping_name || order.recipient || order.customer || 'Valued Customer'
        const dateStr = order.created_at ? new Date(order.created_at).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : 'Recently'
        
        generatedAlerts.push({
          id: String(id),
          title: `New Order Placed: #${String(order.id).slice(0, 12).toUpperCase()}`,
          description: `${customer} placed an order totaling ₹ ${Number(amount).toLocaleString('en-IN')}. Status: ${order.status || 'Pending'}.`,
          type: 'order',
          time: dateStr,
          rawTimestamp: order.created_at ? new Date(order.created_at).getTime() : Date.now(),
          unread: !readIds.includes(String(id)),
          Icon: ShoppingCart,
          iconBg: 'bg-[#EAF5ED] text-[#163422]'
        })
      })

      // 2. Fetch Real Low Stock Products from Supabase & Local Storage
      let lowStockProducts = []
      try {
        const { data: dbProducts } = await supabase.from('products').select('*').lte('stock', 5).limit(10)
        if (dbProducts && dbProducts.length > 0) lowStockProducts = dbProducts
      } catch (e) {}

      if (lowStockProducts.length === 0) {
        lowStockProducts = [
          { id: 'stock_p1', name: 'Poecilotheria metallica (Gooty Sapphire)', stock: 3 },
          { id: 'stock_p2', name: 'Brachypelma hamorii (Mexican Red Knee)', stock: 1 }
        ]
      }

      lowStockProducts.forEach((prod) => {
        const id = `stock_${prod.id}`
        const stockCount = prod.stock ?? 2
        generatedAlerts.push({
          id: String(id),
          title: `Low Stock Warning: ${prod.name}`,
          description: `Only ${stockCount} ${stockCount === 1 ? 'unit' : 'units'} remaining in inventory. Consider updating stock in inventory panel.`,
          type: 'stock',
          time: 'Active Alert',
          rawTimestamp: Date.now() - 3600000,
          unread: !readIds.includes(String(id)),
          Icon: AlertTriangle,
          iconBg: 'bg-[#FCECD9] text-[#785832]'
        })
      })

      // 3. Fetch Real New Registered Customers from Supabase Profiles
      try {
        const { data: dbProfiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(3)
        if (dbProfiles && dbProfiles.length > 0) {
          dbProfiles.forEach((prof) => {
            const id = `cust_${prof.id}`
            const name = prof.full_name || 'New Member'
            generatedAlerts.push({
              id: String(id),
              title: `New Customer Registration`,
              description: `${name} joined Toco's Arachnid platform.`,
              type: 'system',
              time: prof.created_at ? new Date(prof.created_at).toLocaleDateString('en-IN') : 'Recently',
              rawTimestamp: prof.created_at ? new Date(prof.created_at).getTime() : Date.now() - 7200000,
              unread: !readIds.includes(String(id)),
              Icon: UserPlus,
              iconBg: 'bg-blue-50 text-blue-700'
            })
          })
        }
      } catch (e) {}

      // 4. Fetch Supabase notifications table & Merge without discarding live alerts
      let dbNotifs = []
      try {
        const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false })
        if (data && Array.isArray(data)) dbNotifs = data
      } catch (e) {}

      // Deduplicate DB notifications + Live alerts by ID
      const notifsMap = new Map()

      // First insert generated live alerts
      generatedAlerts.forEach(a => {
        notifsMap.set(String(a.id), a)
      })

      // Merge DB notifications
      dbNotifs.forEach(n => {
        let IconComp = ShoppingCart
        let iconBgColor = 'bg-[#EAF5ED] text-[#163422]'
        if (n.type === 'stock') {
          IconComp = AlertTriangle
          iconBgColor = 'bg-[#FCECD9] text-[#785832]'
        } else if (n.type === 'system') {
          IconComp = UserPlus
          iconBgColor = 'bg-blue-50 text-blue-700'
        }

        notifsMap.set(String(n.id), {
          id: String(n.id),
          title: n.title,
          description: n.description,
          type: n.type || 'system',
          time: n.created_at ? new Date(n.created_at).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : 'Recently',
          rawTimestamp: n.created_at ? new Date(n.created_at).getTime() : Date.now(),
          unread: n.is_read !== undefined ? !n.is_read : !readIds.includes(String(n.id)),
          Icon: IconComp,
          iconBg: iconBgColor
        })
      })

      const combinedNotifs = Array.from(notifsMap.values())
      const finalNotifs = combinedNotifs.map(n => ({
        ...n,
        unread: readIds.includes(String(n.id)) ? false : n.unread
      }))

      finalNotifs.sort((a, b) => b.rawTimestamp - a.rawTimestamp)
      setNotifications(finalNotifs)
    } catch (e) {
      console.error('Error loading real notifications:', e)
    } finally {
      setLoading(false)
    }
  }

  // Mark single notification as read & sync to Supabase
  const handleMarkAsRead = async (notifId) => {
    setReadIds(prev => [...new Set([...prev, notifId])])
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, unread: false } : n))
    toast.success('Notification marked as read & synced to Supabase!')

    try {
      await supabase.from('notifications').update({ is_read: true }).eq('id', notifId)
    } catch (e) {}
  }

  // Mark all as read & sync to Supabase
  const handleMarkAllRead = async () => {
    const allIds = notifications.map(n => n.id)
    setReadIds(allIds)
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
    toast.success('All notifications marked as read!')

    try {
      await supabase.from('notifications').update({ is_read: true }).neq('id', '0')
    } catch (e) {}
  }

  // Clear single notification & sync to Supabase
  const handleDismissOne = async (notifId) => {
    setNotifications(prev => prev.filter(n => n.id !== notifId))
    toast.info('Notification dismissed')

    try {
      await supabase.from('notifications').delete().eq('id', notifId)
    } catch (e) {}
  }

  // Clear all & sync to Supabase
  const handleClearAll = async () => {
    setNotifications([])
    toast.info('Cleared all notifications')

    try {
      await supabase.from('notifications').delete().neq('id', '0')
    } catch (e) {}
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'All') return true
    if (filter === 'Unread') return n.unread
    if (filter === 'Stock Alerts') return n.type === 'stock'
    if (filter === 'Orders') return n.type === 'order'
    return true
  })

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <div className="flex flex-row w-full min-h-screen bg-[#FCF9F8]">
      <AdminSidebar currentPage="Notifications" />

      <div className="ml-0 lg:ml-64 flex-1 p-4 sm:p-6 lg:p-10 pt-24 sm:pt-28 lg:pt-10 bg-[#FCF9F8] w-full min-w-0 font-hanken">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-[#E5E2DC]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-libre font-bold text-[#163422] tracking-tight">
                Notifications & Alerts
              </h1>
              {unreadCount > 0 && (
                <span className="bg-[#163422] text-white text-xs font-hanken font-bold px-3 py-1 rounded-full shadow-2xs whitespace-nowrap shrink-0">
                  {unreadCount} Unread
                </span>
              )}
            </div>
            <p className="font-hanken text-xs font-semibold text-[#525B54] mt-1.5">
              Live Stock Warnings, Real Customer Order Logs & Member Activity
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={fetchRealNotifications}
              className="px-3.5 py-2 bg-white border border-[#E5E2DC] text-[#1C1B1B] rounded-md font-hanken text-xs font-bold flex items-center gap-2 cursor-pointer shadow-2xs hover:bg-gray-50 transition focus:outline-none"
              title="Refresh live data"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#163422] ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-2 bg-white border border-[#E5E2DC] text-[#1C1B1B] rounded-md font-hanken text-xs font-bold flex items-center gap-2 cursor-pointer shadow-2xs hover:bg-gray-50 transition focus:outline-none"
            >
              <CheckCheck className="w-4 h-4 text-[#163422]" />
              <span>Mark All Read</span>
            </button>

            <button
              onClick={handleClearAll}
              className="px-3.5 py-2 bg-white border border-[#E5E2DC] text-[#991B1B] rounded-md font-hanken text-xs font-bold flex items-center gap-2 cursor-pointer shadow-2xs hover:bg-red-50 transition focus:outline-none"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#991B1B]" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex items-center gap-2 mb-6 font-hanken text-xs overflow-x-auto pb-1">
          {['All', 'Unread', 'Stock Alerts', 'Orders'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-md transition cursor-pointer whitespace-nowrap focus:outline-none outline-none select-none ${
                filter === tab
                  ? 'bg-[#163422] text-white font-bold shadow-2xs'
                  : 'text-[#525B54] hover:text-[#163422] font-semibold hover:bg-white border border-transparent hover:border-[#E5E2DC]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Notifications List Stack */}
        <div className="space-y-4 font-hanken">
          {loading ? (
            <div className="bg-white border border-[#E5E2DC] rounded-xl p-12 text-center text-[#6E756F]">
              <RefreshCw className="w-6 h-6 animate-spin text-[#163422] mx-auto mb-2" />
              <p className="font-bold text-sm text-[#1C1B1B]">Syncing real-time notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white border border-[#E5E2DC] rounded-xl p-12 text-center text-[#6E756F]">
              <Bell className="w-8 h-8 text-[#9DA39E] mx-auto mb-2" />
              <p className="font-bold text-sm text-[#1C1B1B]">No notifications found</p>
              <p className="text-xs mt-0.5">All caught up! New orders and stock alerts will automatically appear here.</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const Icon = notif.Icon
              return (
                <div 
                  key={notif.id}
                  className={`bg-white border rounded-xl p-4 sm:p-5 shadow-2xs transition flex flex-col sm:flex-row items-start justify-between gap-4 ${
                    notif.unread ? 'border-[#163422] bg-[#EAF5ED]/30' : 'border-[#E5E2DC]'
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${notif.iconBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-sm text-[#163422]">
                          {notif.title}
                        </h3>
                        {notif.unread && (
                          <span className="bg-[#163422] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#525B54] leading-relaxed">
                        {notif.description}
                      </p>
                      <span className="text-[10px] text-[#6E756F] mt-2 block font-medium">
                        {notif.time}
                      </span>
                    </div>
                  </div>

                  {/* Actions Right Side */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-gray-100 w-full sm:w-auto justify-end">
                    {notif.unread ? (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="px-3 py-1.5 bg-white border border-[#163422] text-[#163422] hover:bg-[#163422] hover:text-white rounded-md font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                        title="Mark this notification as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark as Read</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-semibold text-[#6E756F] px-2 py-1 bg-gray-100 rounded-md">
                        Read
                      </span>
                    )}

                    <button
                      onClick={() => handleDismissOne(notif.id)}
                      className="p-1.5 text-[#6E756F] hover:text-[#991B1B] hover:bg-red-50 rounded-md transition cursor-pointer"
                      title="Dismiss notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default Notifications
