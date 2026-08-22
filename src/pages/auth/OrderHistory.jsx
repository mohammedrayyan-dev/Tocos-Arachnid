import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Container from '../../components/common/Container'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { ShoppingBag, Truck, Package, Clock, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react'

import beginnerTarantula from '../../assets/image/beginner-tarantula-care.webp'
import mexicanRedKnee from '../../assets/image/mexican-red-knee.webp'
import brazilianBlack from '../../assets/image/brazilian-black.webp'

import ShipmentTrackingModal from '../../components/orders/ShipmentTrackingModal'

const parsePriceNumber = (val) => {
  if (val === undefined || val === null) return 0
  if (typeof val === 'number') return isNaN(val) ? 0 : val
  const str = String(val).replace(/,/g, '').replace(/[^\d.]/g, '')
  const num = parseFloat(str)
  return isNaN(num) ? 0 : num
}

const getItemImgSrc = (item) => {
  let rawImg = item.thumbnail || item.image || item.products?.thumbnail || (Array.isArray(item.products?.images) && item.products?.images[0])
  if (!rawImg || String(rawImg).includes('placehold.co')) {
    const nameLower = String(item.name || item.products?.name || '').toLowerCase()
    if (nameLower.includes('mexican') || nameLower.includes('hamorii')) {
      return mexicanRedKnee
    } else if (nameLower.includes('brazilian') || nameLower.includes('pulchra')) {
      return brazilianBlack
    } else {
      return beginnerTarantula
    }
  }
  return rawImg
}

const OrderHistory = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [liveOrders, setLiveOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDetailsModal, setShowDetailsModal] = useState(null)
  const [showTrackingModal, setShowTrackingModal] = useState(null)

  useEffect(() => {
    fetchUserLiveOrders()

    // 1. Listen for Supabase Real-time updates (admin status changes)
    const channel = supabase
      .channel('user-orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchUserLiveOrders()
      })
      .subscribe()

    // 2. Listen for Local Storage events (cross-tab admin changes)
    const handleStorageChange = () => {
      fetchUserLiveOrders()
    }
    window.addEventListener('storage', handleStorageChange)

    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [user])

  const fetchUserLiveOrders = async () => {
    try {
      setLoading(true)
      let dbOrders = []

      // 1. Fetch from Supabase Database (Query by user_id OR email for 100% persistence)
      if (user?.id || user?.email) {
        try {
          let data = null
          if (user?.id && user?.email) {
            const { data: res } = await supabase
              .from('orders')
              .select('*')
              .or(`user_id.eq.${user.id},email.ilike.${user.email}`)
              .order('created_at', { ascending: false })
            data = res
          } else if (user?.id) {
            const { data: res } = await supabase
              .from('orders')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
            data = res
          } else if (user?.email) {
            const { data: res } = await supabase
              .from('orders')
              .select('*')
              .ilike('email', user.email)
              .order('created_at', { ascending: false })
            data = res
          }

          if (data && Array.isArray(data)) {
            dbOrders = data
          }
        } catch (e) {
          console.warn("DB orders fetch notice:", e)
        }
      }

      // 2. Fetch from Local Storage for user & admin cache
      let localOrders = []
      try {
        if (user?.id || user?.email) {
          const userKey = user.id ? `user_orders_${user.id}` : `user_orders_${user.email}`
          const saved = localStorage.getItem(userKey)
          if (saved) {
            const arr = JSON.parse(saved)
            if (Array.isArray(arr)) localOrders.push(...arr)
          }
        }

        const adminSaved = localStorage.getItem('tocos_admin_orders')
        if (adminSaved) {
          const arr = JSON.parse(adminSaved)
          if (Array.isArray(arr)) {
            const userAdminOrders = arr.filter(o => 
              (user?.email && o.email === user.email) || 
              (user?.id && o.user_id === user.id)
            )
            localOrders.push(...userAdminOrders)
          }
        }
      } catch (e) {}

      // Combine & Deduplicate by Order ID
      const combinedMap = new Map()

      // Local orders first
      localOrders.forEach(o => {
        if (o && o.id) {
          const cleanId = String(o.id).startsWith('#') ? String(o.id) : `#${o.id}`
          combinedMap.set(cleanId, o)
        }
      })

      // DB orders override
      dbOrders.forEach(o => {
        if (o && o.id) {
          const cleanId = String(o.id).startsWith('#') ? String(o.id) : `#${o.id}`
          combinedMap.set(cleanId, o)
        }
      })

      const combinedList = Array.from(combinedMap.values())

      const mapped = combinedList.map(o => {
        const rawAmt = o.total_amount || o.amount || o.rawTotalAmount || 0
        const numericPrice = parsePriceNumber(rawAmt)
        const displayPrice = numericPrice > 0 ? `₹${numericPrice.toLocaleString('en-IN')}` : (typeof rawAmt === 'string' ? rawAmt : '₹0')

        return {
          id: String(o.id).startsWith('#') ? String(o.id) : `#${o.id}`,
          state: o.shipping_city || o.shipping_address?.split(',').slice(-1)[0] || 'Tamil Nadu',
          date: new Date(o.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          rawCreatedAt: o.created_at || new Date().toISOString(),
          totalPrice: displayPrice,
          numericPrice: numericPrice,
          status: o.status || 'Pending',
          utrNumber: o.utr_number || o.utrNumber || o.utr || 'Verified',
          address: o.shipping_address || 'Address on file',
          items: Array.isArray(o.items) && o.items.length ? o.items : [
            {
              id: 1,
              name: o.shipping_name ? `${o.shipping_name}'s Specimen Order` : 'Toco Specimen Order',
              scientific_name: 'Conservatory Specimen',
              subDetails: 'Live Specimen',
              quantity: 1,
              thumbnail: beginnerTarantula
            }
          ]
        }
      })

      mapped.sort((a, b) => new Date(b.rawCreatedAt) - new Date(a.rawCreatedAt))

      setLiveOrders(mapped)
    } catch (e) {
      console.warn('Order history query error:', e)
      setLiveOrders([])
    } finally {
      setLoading(false)
    }
  }

  const totalInvested = liveOrders.reduce((sum, o) => sum + (o.numericPrice || 0), 0)

  const getStatusBadge = (statusStr) => {
    const s = String(statusStr || 'Pending').trim().toLowerCase()
    if (s === 'delivered') {
      return { label: 'Package Delivered', bg: 'bg-[#EAF5ED] text-[#163422] border-[#C6E6CE]' }
    } else if (s === 'shipped') {
      return { label: 'Dispatched / Shipped', bg: 'bg-[#EAF5ED] text-[#163422] border-[#C6E6CE]' }
    } else if (s === 'health check') {
      return { label: 'Specimen Health Check', bg: 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]' }
    } else if (s === 'confirmed' || s === 'processing') {
      return { label: 'Payment Verified', bg: 'bg-[#EAF5ED] text-[#163422] border-[#C6E6CE]' }
    } else if (s === 'cancelled') {
      return { label: 'Order Cancelled', bg: 'bg-[#FEF2F2] text-[#991B1B] border-[#FCA5A5]' }
    } else {
      return { label: 'Order Initiated', bg: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]' }
    }
  }

  return (
    <>
      <div className="min-h-screen bg-[#FCF9F8] py-10 mb-16 font-hanken">
        <Container>
          {/* Main Title */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="font-libre text-3xl md:text-4xl font-bold text-[#163422]">
                My Order History
              </h1>
              <p className="text-xs text-[#6E756F] mt-1 flex items-center gap-2">
                <span>Showing live synced orders for <strong className="text-[#1C1B1B]">{user?.email}</strong></span>
                <span className="w-2 h-2 rounded-full bg-[#163422] animate-pulse"></span>
              </p>
            </div>

            <button
              onClick={() => navigate('/shop-all')}
              className="px-4 py-2 bg-[#163422] hover:bg-[#0D2316] text-white rounded-md text-xs font-bold uppercase tracking-wider cursor-pointer w-fit shadow-xs"
            >
              Browse Specimen Shop
            </button>
          </div>

          {/* Summary Stat Cards */}
          <div className="bg-[#FAF8F5] border border-[#E5E2DC] rounded-md p-4 grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 divide-y md:divide-y-0 md:divide-x divide-[#E5E2DC] shadow-xs">
            {/* Stat 1: Lifetime Orders */}
            <div className="flex items-center gap-4 pr-4 py-1">
              <div className="w-12 h-12 rounded-md bg-[#163422] flex items-center justify-center text-white shrink-0 shadow-xs">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-hanken font-bold text-[10px] text-[#6E756F] uppercase tracking-[0.18em]">
                  YOUR LIFETIME ORDERS
                </p>
                <p className="font-libre text-3xl font-bold text-[#1C1B1B]">
                  {liveOrders.length}
                </p>
              </div>
            </div>

            {/* Stat 2: Total Invested */}
            <div className="flex items-center gap-4 md:pl-6 py-1">
              <div className="w-12 h-12 rounded-md bg-[#FCECD9] border border-[#F5D8B6] flex items-center justify-center text-[#785832] shrink-0 shadow-xs">
                <Truck className="w-5 h-5 text-[#785832]" />
              </div>
              <div>
                <p className="font-hanken font-bold text-[10px] text-[#6E756F] uppercase tracking-[0.18em]">
                  TOTAL INVESTED
                </p>
                <p className="font-libre text-3xl font-bold text-[#1C1B1B]">
                  ₹{totalInvested.toLocaleString('en-IN')}.00
                </p>
              </div>
            </div>
          </div>

          {/* Orders Stack or Empty State */}
          {loading ? (
            <div className="bg-white border border-[#E5E2DC] rounded-md p-12 text-center text-xs text-[#6E756F]">
              Syncing live order updates...
            </div>
          ) : liveOrders.length === 0 ? (
            <div className="bg-white border border-dashed border-[#E5E2DC] rounded-xl p-12 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
              <div className="w-14 h-14 rounded-full bg-[#EAF5ED] flex items-center justify-center text-[#163422]">
                <Package className="w-7 h-7" />
              </div>
              <h2 className="font-libre text-2xl font-bold text-[#163422]">
                No Orders Placed Yet
              </h2>
              <p className="font-hanken text-xs text-[#6E756F] max-w-md leading-relaxed">
                You haven't placed any orders with <strong>{user?.email}</strong> yet. Explore our conservatory specimen collection to make your first purchase!
              </p>
              <button
                onClick={() => navigate('/shop-all')}
                className="mt-2 px-6 py-3 bg-[#163422] hover:bg-[#0D2316] text-white font-bold text-xs uppercase tracking-wider rounded-md transition cursor-pointer shadow-xs"
              >
                Start Shopping Now
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {liveOrders.map((order) => {
                const badge = getStatusBadge(order.status)
                return (
                  <div 
                    key={order.id} 
                    className="bg-white border border-[#E5E2DC] rounded-md p-5 md:p-6 shadow-xs hover:shadow-md transition duration-200"
                  >
                    {/* Header Information Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b border-[#E5E2DC] mb-5 font-hanken">
                      <div>
                        <p className="text-[10px] font-bold text-[#6E756F] uppercase tracking-[0.14em]">Order Number</p>
                        <p className="text-sm font-bold text-[#163422] mt-0.5">{order.id}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#6E756F] uppercase tracking-[0.14em]">City / State</p>
                        <p className="text-sm font-semibold text-[#1C1B1B] mt-0.5">{order.state}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#6E756F] uppercase tracking-[0.14em]">Date</p>
                        <p className="text-sm font-medium text-[#525B54] mt-0.5">{order.date}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#6E756F] uppercase tracking-[0.14em]">Total Price</p>
                        <p className="text-sm font-bold text-[#163422] mt-0.5">{order.totalPrice}</p>
                      </div>
                    </div>

                    {/* Main Order Item Info & Action Row */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex flex-col gap-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4">
                            <img 
                              src={getItemImgSrc(item)} 
                              alt={item.name} 
                              className="w-16 h-16 object-cover rounded-md border border-[#E5E2DC] shrink-0 bg-[#FAF8F5]"
                              onError={(e) => {
                                e.currentTarget.src = beginnerTarantula
                              }}
                            />
                            <div>
                              <h3 className="font-libre text-lg font-bold text-[#163422] leading-snug">
                                {item.name || item.products?.name} {item.scientific_name && <span className="font-hanken font-normal text-xs text-[#525B54]">({item.scientific_name})</span>}
                              </h3>
                              <div className="font-hanken text-xs text-[#6E756F] mt-0.5 flex items-center gap-2">
                                <span>{item.subDetails || item.category || 'Live Specimen'}</span>
                                <span className="bg-[#FAF8F5] border border-[#E5E2DC] text-[#163422] font-bold text-[11px] px-2 py-0.5 rounded">
                                  Qty: {item.quantity || 1}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto mt-2 md:mt-0">
                        {/* Status Badge */}
                        <span className={`px-3.5 py-1.5 rounded-full font-hanken text-xs font-bold text-center uppercase tracking-wider border shrink-0 ${badge.bg}`}>
                          {badge.label}
                        </span>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                          <button
                            onClick={() => setShowTrackingModal(order)}
                            className="px-3.5 py-2 border border-[#163422] text-[#163422] hover:bg-[#163422] hover:text-white font-hanken font-bold text-xs uppercase tracking-wider rounded-md transition cursor-pointer text-center"
                          >
                            Track Shipment
                          </button>
                          <button
                            onClick={() => setShowDetailsModal(order)}
                            className="px-3.5 py-2 bg-[#163422] hover:bg-[#0D2316] text-white font-hanken font-bold text-xs uppercase tracking-wider rounded-md transition cursor-pointer text-center"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

        </Container>
      </div>

      {/* Shipment Tracking Modal */}
      {showTrackingModal && (
        <ShipmentTrackingModal
          isOpen={!!showTrackingModal}
          order={showTrackingModal}
          onClose={() => setShowTrackingModal(null)}
          onRefresh={fetchUserLiveOrders}
        />
      )}

      {/* Order Details Modal with 5-Step Timeline */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-hanken">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 border border-[#E5E2DC] shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-[#E5E2DC]">
              <div>
                <h3 className="font-libre text-xl font-bold text-[#163422]">
                  Order Details ({showDetailsModal.id})
                </h3>
                <p className="text-[11px] text-[#6E756F]">
                  UPI Transaction ID: <span className="font-mono font-bold text-[#163422]">{showDetailsModal.utrNumber}</span>
                </p>
              </div>
              <button 
                onClick={() => setShowDetailsModal(null)}
                className="text-[#6E756F] hover:text-black font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* 5-Step Fulfillment Progress Timeline inside User Modal */}
            <div className="py-5 border-b border-[#E5E2DC]">
              <h4 className="text-xs font-bold text-[#163422] uppercase tracking-wider mb-4">
                Fulfillment Status Timeline
              </h4>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5E2DC]">
                {/* Step 1 */}
                <div className="relative flex items-start gap-3">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-[#163422] text-white flex items-center justify-center text-[10px]">
                    ✓
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#163422]">1. Order Initiated</p>
                    <p className="text-[11px] text-[#525B54]">Order queued & UTR submitted</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative flex items-start gap-3">
                  <div className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    ['confirmed', 'health check', 'shipped', 'delivered'].includes(showDetailsModal.status.toLowerCase())
                      ? 'bg-[#163422] text-white'
                      : 'bg-white border-2 border-[#E5E2DC] text-transparent'
                  }`}>
                    ✓
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${['confirmed', 'health check', 'shipped', 'delivered'].includes(showDetailsModal.status.toLowerCase()) ? 'text-[#163422]' : 'text-[#9CA3AF]'}`}>
                      2. Payment Verified & Confirmed
                    </p>
                    <p className="text-[11px] text-[#525B54]">Concierge verified bank payment</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative flex items-start gap-3">
                  <div className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    ['health check', 'shipped', 'delivered'].includes(showDetailsModal.status.toLowerCase())
                      ? 'bg-[#163422] text-white'
                      : 'bg-white border-2 border-[#E5E2DC] text-transparent'
                  }`}>
                    ✓
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${['health check', 'shipped', 'delivered'].includes(showDetailsModal.status.toLowerCase()) ? 'text-[#163422]' : 'text-[#9CA3AF]'}`}>
                      3. Specimen Health Check
                    </p>
                    <p className="text-[11px] text-[#525B54]">Naturalist vitality assessment & packaging</p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="relative flex items-start gap-3">
                  <div className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    ['shipped', 'delivered'].includes(showDetailsModal.status.toLowerCase())
                      ? 'bg-[#163422] text-white'
                      : 'bg-white border-2 border-[#E5E2DC] text-transparent'
                  }`}>
                    ✓
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${['shipped', 'delivered'].includes(showDetailsModal.status.toLowerCase()) ? 'text-[#163422]' : 'text-[#9CA3AF]'}`}>
                      4. Dispatched & Shipped
                    </p>
                    <p className="text-[11px] text-[#525B54]">Handed over to express live courier</p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="relative flex items-start gap-3">
                  <div className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    showDetailsModal.status.toLowerCase() === 'delivered'
                      ? 'bg-[#163422] text-white'
                      : 'bg-white border-2 border-[#E5E2DC] text-transparent'
                  }`}>
                    ✓
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${showDetailsModal.status.toLowerCase() === 'delivered' ? 'text-[#163422]' : 'text-[#9CA3AF]'}`}>
                      5. Package Delivered
                    </p>
                    <p className="text-[11px] text-[#525B54]">Delivered with 100% Live Arrival Guarantee</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="py-4 space-y-2 font-hanken text-xs text-[#1C1B1B]">
              <p><strong className="text-[#163422]">Delivery Address:</strong> {showDetailsModal.address}</p>
              <p><strong className="text-[#163422]">Order Date:</strong> {showDetailsModal.date}</p>
              <p><strong className="text-[#163422]">Total Paid:</strong> {showDetailsModal.totalPrice}</p>
            </div>

            <div className="pt-4 border-t border-[#E5E2DC] flex justify-end">
              <button
                onClick={() => setShowDetailsModal(null)}
                className="px-5 py-2 bg-[#163422] text-white font-hanken font-bold text-xs rounded-md cursor-pointer uppercase tracking-wider"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default OrderHistory
