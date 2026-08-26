import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  LayoutDashboard,
  Boxes,
  ShoppingBag,
  ShoppingCart,
  Ticket,
  Users,
  BarChart3,
  Bell,
  Settings,
  Plus,
  LogOut,
  Menu,
  X
} from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { supabase } from "../../lib/supabase"
import TocoLogo from "/src/assets/image/tocos-logo.png"

const DEFAULT_ADMIN_AVATAR = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80"

const AdminSidebar = ({ currentPage }) => {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const adminName = user?.user_metadata?.full_name || 'Yaashar SU'
  const adminAvatar = user?.user_metadata?.avatar_url || DEFAULT_ADMIN_AVATAR

  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const calcUnread = async () => {
      try {
        let readIds = []
        let count = 0

        // Check Low Stock Products count
        try {
          const { data: prods } = await supabase.from('products').select('id, stock').lte('stock', 5)
          if (prods && Array.isArray(prods)) {
            prods.forEach(p => {
              if (!readIds.includes(`stock_${p.id}`)) count++
            })
          }
        } catch (e) {}

        // Check Recent Orders count
        try {
          const { data: ords } = await supabase.from('orders').select('id').order('created_at', { ascending: false }).limit(10)
          if (ords && Array.isArray(ords)) {
            ords.forEach(o => {
              if (!readIds.includes(`order_${o.id}`)) count++
            })
          }
        } catch (e) {}

        setUnreadCount(count)
      } catch (e) {}
    }

    calcUnread()

    const channel = supabase
      .channel('sidebar-notifs-badge')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => calcUnread())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => calcUnread())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const nav = [
    { icon: LayoutDashboard, nav: "Dashboard", path: "/admin" },
    { icon: Boxes, nav: "Inventory", path: "/admin/inventory" },
    { icon: ShoppingBag, nav: "Products", path: "/admin/products" },
    { icon: ShoppingCart, nav: "Orders", path: "/admin/orders" },
    { icon: Ticket, nav: "Coupons", path: "/admin/coupons" },
    { icon: Users, nav: "Customers", path: "/admin/customers" },
    { icon: BarChart3, nav: "Analytics", path: "/admin/analytics" },
    { icon: Bell, nav: "Notifications", path: "/admin/notifications" },
    { icon: Settings, nav: "Settings", path: "/admin/settings" }
  ]

  const handleAddSpecimen = () => {
    navigate('/admin/products')
    toast.info('Opening Product Management to add new specimen...')
    setIsOpen(false)
  }

  const handleLogout = async () => {
    try {
      if (signOut) {
        await signOut()
      }
      toast.success("Successfully logged out")
      navigate("/")
    } catch (err) {
      console.error(err)
      toast.success("Logged out")
      navigate("/")
    }
  }

  return (
    <>
      {/* Mobile Top Header Bar (< lg) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#FAF8F5] border-b border-[#E5E2DC] px-4 flex items-center justify-between z-30 shadow-2xs">
        {/* Left: Hamburger Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-[#163422] hover:bg-gray-100/80 rounded-md transition cursor-pointer shrink-0 z-10"
          aria-label="Toggle Admin Navigation Menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Center: Logo & Brand Title */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none">
          <img src={TocoLogo} alt="Toco Logo" className="w-6 h-6 object-contain" />
          <span className="font-libre font-bold text-lg text-[#163422] whitespace-nowrap">
            Arachne Elite
          </span>
        </div>

        {/* Right: Balance Spacer */}
        <div className="w-10" />
      </div>

      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-xs"
        />
      )}

      {/* Main Sidebar (Desktop fixed & Mobile drawer) */}
      <div className={`w-[256px] bg-[#FAF8F5] border-r border-[#E5E2DC] flex flex-col justify-between p-6 fixed top-0 bottom-0 left-0 h-screen overflow-y-auto z-40 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col gap-6">
          {/* Top Logo */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E5E2DC]">
            <div className="flex items-center gap-2.5">
              <img src={TocoLogo} alt="Toco Logo" className="w-6 h-6 object-contain" />
              <h1 className="font-libre text-xl font-bold text-[#163422]">
                Toco's Arachnid
              </h1>
            </div>
            <button onClick={() => setIsOpen(false)} className="lg:hidden text-[#6E756F]">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub-header */}
          <div>
            <h2 className="font-libre text-2xl font-bold text-[#163422] leading-tight">
              Arachne Elite
            </h2>
            <p className="font-hanken font-bold text-[10px] text-[#91724B] tracking-[0.2em] uppercase mt-0.5">
              PREMIUM ADMIN
            </p>
          </div>

          {/* Navigation Items */}
          <div className="flex flex-col gap-1.5 mt-2 font-hanken">
            {nav.map((n, idx) => {
              const Icon = n.icon
              const isActive = currentPage === n.nav
              return (
                <Link
                  key={idx}
                  to={n.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md transition text-xs ${
                    isActive
                      ? 'bg-[#E5E2DC]/70 font-bold text-[#163422]'
                      : 'text-[#525B54] hover:bg-gray-100/80 hover:text-[#163422] font-medium'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#163422]' : 'text-[#6E756F]'}`} />
                  <span className="flex-1">{n.nav}</span>
                  {n.nav === "Notifications" && unreadCount > 0 && (
                    <span className="bg-[#163422] text-white font-bold text-[10px] px-2 py-0.5 rounded-full shrink-0">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Bottom Footer Section */}
        <div className="pt-4 border-t border-[#E5E2DC] mt-4 space-y-3">
          {/* Admin Profile Card */}
          <div className="bg-white border border-[#E5E2DC] p-2.5 rounded-xl flex items-center justify-between shadow-2xs hover:border-[#163422] transition">
            <div className="flex items-center gap-2.5 truncate">
              <img
                src={adminAvatar}
                alt="Admin Profile"
                className="w-9 h-9 rounded-lg object-cover border border-[#E5E2DC] shrink-0"
              />
              <div className="flex flex-col truncate">
                <span className="font-hanken font-bold text-xs text-[#1C1B1B]">
                  Toco Admin
                </span>
                <span className="font-hanken text-[11px] text-[#6E756F] truncate">
                  {adminName}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 text-[#6E756F] hover:text-[#991B1B] hover:bg-red-50 rounded-lg transition cursor-pointer shrink-0"
              title="Logout from Admin Panel"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Add Specimen Action Button */}
          <button
            onClick={handleAddSpecimen}
            className="w-full py-3 bg-[#163422] hover:bg-[#0D2316] text-white font-hanken font-bold text-xs rounded-md transition cursor-pointer shadow-xs flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Specimen</span>
          </button>
        </div>
      </div>
    </>
  )
}

export default AdminSidebar
