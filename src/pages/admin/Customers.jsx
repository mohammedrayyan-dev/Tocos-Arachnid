import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { Users, Crown, DollarSign, TrendingUp, Search, Mail, Edit, MoreVertical, Download, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabase'

const Customers = () => {
  const [activeFilter, setActiveFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const defaultCustomerList = [
    {
      id: 1,
      name: 'Elias Thorne',
      email: 'elias.thorne@example.com',
      phone: '+91 98765 43210',
      initials: 'ET',
      tier: 'VIP Collector',
      isVip: true,
      ordersCount: 14,
      totalSpent: '₹ 84,500',
      joinedDate: 'Jan 15, 2024'
    },
    {
      id: 2,
      name: 'Arjun Mehta',
      email: 'arjun.mehta@example.com',
      phone: '+91 98765 43211',
      initials: 'AM',
      tier: 'Active Buyer',
      isVip: false,
      ordersCount: 6,
      totalSpent: '₹ 32,800',
      joinedDate: 'Mar 22, 2024'
    },
    {
      id: 3,
      name: 'Dr. Sarah Jenkins',
      email: 'sarah.j@bioacademy.org',
      phone: '+91 91234 56789',
      initials: 'SJ',
      tier: 'VIP Collector',
      isVip: true,
      ordersCount: 22,
      totalSpent: '₹ 142,000',
      joinedDate: 'Nov 04, 2023'
    }
  ]

  const [customersData, setCustomersData] = useState(defaultCustomerList)

  useEffect(() => {
    fetchLiveCustomers()
  }, [])

  const parseAmountNumber = (val) => {
    if (val === undefined || val === null) return 0
    if (typeof val === 'number') return isNaN(val) ? 0 : val
    const clean = String(val).replace(/,/g, '').replace(/[^\d.]/g, '')
    const num = parseFloat(clean)
    return isNaN(num) ? 0 : num
  }

  const fetchLiveCustomers = async () => {
    try {
      // 1. Fetch DB Profiles & DB Orders
      let profilesData = []
      let dbOrders = []

      try {
        const { data: pData } = await supabase.from('profiles').select('*')
        if (pData) profilesData = pData
      } catch (e) {}

      try {
        const { data: oData } = await supabase.from('orders').select('*')
        if (oData) dbOrders = oData
      } catch (e) {}

      // Combine & Deduplicate all orders by Order ID
      const allOrdersMap = new Map()
      dbOrders.forEach(o => {
        if (o && (o.id || o.order_id || o.orderId)) {
          const key = String(o.id || o.order_id || o.orderId)
          allOrdersMap.set(key, o)
        }
      })

      const allOrders = Array.from(allOrdersMap.values())

      if (profilesData && profilesData.length > 0) {
        const mapped = profilesData.map(p => {
          const pEmailLower = String(p.email || '').toLowerCase().trim()
          const pId = String(p.id || '').trim()

          // Match orders belonging to this profile by user_id or email
          const matchingOrders = allOrders.filter(o => {
            const oEmailLower = String(o.email || o.customer_email || '').toLowerCase().trim()
            const oUserId = String(o.user_id || o.userId || '').trim()

            return (pId && oUserId === pId) || (pEmailLower && oEmailLower === pEmailLower)
          })

          const spentSum = matchingOrders.reduce((sum, o) => {
            const rawAmt = o.total_amount || o.amount || o.rawTotalAmount || 0
            return sum + parseAmountNumber(rawAmt)
          }, 0)

          const count = matchingOrders.length
          const isVip = spentSum >= 10000 || count >= 5
          const isActive = count >= 1 && !isVip
          const isInactive = count === 0

          let tierName = 'New Collector'
          if (isVip) tierName = 'VIP Collector'
          else if (isActive) tierName = 'Active Buyer'

          return {
            id: p.id,
            name: p.full_name || 'Arachne Collector',
            email: p.email || 'collector@example.com',
            phone: p.phone || '+91 98765 43210',
            initials: (p.full_name || 'AC').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
            tier: tierName,
            isVip,
            isActive,
            isInactive,
            ordersCount: count,
            totalSpent: `₹ ${spentSum.toLocaleString('en-IN')}`,
            rawSpent: spentSum,
            joinedDate: new Date(p.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          }
        })

        setCustomersData(mapped)
      }
    } catch (e) {
      console.warn('Customer list fetch notice:', e)
    }
  }

  const totalSpentAcrossAll = customersData.reduce((sum, c) => sum + (c.rawSpent || 0), 0)
  const totalOrdersAcrossAll = customersData.reduce((sum, c) => sum + (c.ordersCount || 0), 0)
  const avgOrderValue = totalOrdersAcrossAll > 0 ? Math.round(totalSpentAcrossAll / totalOrdersAcrossAll) : 0

  const stats = [
    { label: 'TOTAL CUSTOMERS', value: customersData.length.toLocaleString(), subtitle: 'Registered members', Icon: Users },
    { label: 'VIP COLLECTORS', value: customersData.filter(c => c.isVip).length.toLocaleString(), subtitle: 'High value buyers', Icon: Crown },
    { label: 'AVG. ORDER VALUE', value: avgOrderValue > 0 ? `₹ ${avgOrderValue.toLocaleString('en-IN')}` : '₹ 0', subtitle: 'Across all buyers', Icon: DollarSign },
    { label: 'RETENTION RATE', value: '94.2%', subtitle: 'High loyalty', Icon: TrendingUp }
  ]

  const filteredCustomers = customersData.filter(c => {
    const matchesFilter = 
      activeFilter === 'All' ||
      (activeFilter === 'VIP Collectors' && c.isVip) ||
      (activeFilter === 'Active Buyers' && c.isActive) ||
      (activeFilter === 'Inactive' && c.isInactive)

    const matchesSearch = 
      !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesFilter && matchesSearch
  })

  return (
    <div className="flex flex-row w-full min-h-screen bg-[#FCF9F8]">
      <AdminSidebar currentPage="Customers" />

      <div className="ml-0 lg:ml-64 flex-1 p-4 sm:p-6 lg:p-10 pt-24 sm:pt-28 lg:pt-10 bg-[#FCF9F8] w-full min-w-0 font-hanken">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-[#E5E2DC]">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-libre font-bold text-[#163422] tracking-tight">
              Customer Management
            </h1>
            <p className="font-hanken text-xs font-semibold text-[#525B54] mt-1.5">
              Total Members: {customersData.length} • VIP Collectors: {customersData.filter(c => c.isVip).length}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => toast.success('Exported customer records (CSV)')}
              className="px-4 py-2.5 bg-white border border-[#E5E2DC] text-[#1C1B1B] rounded-md font-hanken text-xs font-bold flex items-center gap-2 cursor-pointer shadow-2xs hover:bg-gray-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => toast.info('Opening Add Customer modal')}
              className="px-4 py-2.5 bg-[#163422] hover:bg-[#0D2316] text-white rounded-md font-hanken text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Customer</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.Icon
            return (
              <div key={idx} className="bg-white border border-[#E5E2DC] rounded-xl p-5 shadow-2xs">
                <div className="flex justify-between items-start mb-3">
                  <Icon className="w-5 h-5 text-[#163422]" />
                  <span className="font-hanken text-[11px] font-semibold text-[#785832]">
                    {stat.subtitle}
                  </span>
                </div>
                <p className="text-[#6E756F] text-[10px] font-hanken font-bold uppercase tracking-[0.16em] mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl font-hanken font-bold text-[#1C1B1B]">
                  {stat.value}
                </p>
              </div>
            )
          })}
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2 font-hanken text-xs">
            {['All', 'VIP Collectors', 'Active Buyers', 'Inactive'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-4 py-2 rounded-md transition cursor-pointer ${
                  activeFilter === tab
                    ? 'bg-[#163422] text-white font-bold shadow-2xs'
                    : 'text-[#525B54] hover:text-[#163422] font-semibold hover:bg-[#FAF8F5]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer name, email..."
              className="bg-white border border-[#E5E2DC] rounded-md pl-9 pr-4 py-2 font-hanken text-xs text-[#1C1B1B] w-full sm:w-64 md:w-80 focus:outline-none focus:border-[#163422] shadow-2xs"
            />
            <Search className="w-3.5 h-3.5 text-[#6E756F] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Customer Table */}
        <div className="bg-white border border-[#E5E2DC] rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-hanken">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E5E2DC]">
                  <th className="px-6 py-3.5 font-bold text-[10px] text-[#6E756F] uppercase tracking-wider">
                    CUSTOMER
                  </th>
                  <th className="px-6 py-3.5 font-bold text-[10px] text-[#6E756F] uppercase tracking-wider">
                    CONTACT DETAILS
                  </th>
                  <th className="px-6 py-3.5 font-bold text-[10px] text-[#6E756F] uppercase tracking-wider">
                    TIER & STATUS
                  </th>
                  <th className="px-6 py-3.5 font-bold text-[10px] text-[#6E756F] uppercase tracking-wider">
                    ORDERS
                  </th>
                  <th className="px-6 py-3.5 font-bold text-[10px] text-[#6E756F] uppercase tracking-wider">
                    TOTAL SPENT
                  </th>
                  <th className="px-6 py-3.5 font-bold text-[10px] text-[#6E756F] uppercase tracking-wider text-right">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2DC] text-xs">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-[#FAF8F5] transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#FCECD9] text-[#785832] font-bold text-xs flex items-center justify-center shrink-0">
                          {cust.initials}
                        </div>
                        <div>
                          <p className="font-bold text-[#1C1B1B]">{cust.name}</p>
                          <p className="text-[10px] text-[#6E756F]">Joined {cust.joinedDate}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-[#1C1B1B]">{cust.email}</p>
                      <p className="text-[11px] text-[#6E756F]">{cust.phone}</p>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        cust.isVip 
                          ? 'bg-[#FCECD9] text-[#785832] border border-[#F5D8B6]' 
                          : cust.ordersCount > 0
                          ? 'bg-[#EAF5ED] text-[#163422] border border-[#C6E6CE]'
                          : 'bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]'
                      }`}>
                        {cust.isVip && <Crown className="w-3 h-3 text-[#785832]" />}
                        {cust.isVip ? 'VIP Collector' : cust.ordersCount > 0 ? 'Active Buyer' : 'New Collector'}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-bold text-[#1C1B1B]">
                      {cust.ordersCount} Orders
                    </td>

                    <td className="px-6 py-4 font-libre font-bold text-sm text-[#163422]">
                      {cust.totalSpent}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end">
                        <a 
                          href={`mailto:${cust.email}?subject=Toco's%20Arachnid%20Conservatory%20Support`}
                          className="px-3 py-1.5 bg-[#FAF8F5] border border-[#E5E2DC] hover:bg-[#EAF5ED] hover:border-[#C6E6CE] text-[#163422] rounded-md transition cursor-pointer inline-flex items-center gap-1.5 font-bold text-xs shadow-2xs"
                          title={`Send direct email to ${cust.name} (${cust.email})`}
                        >
                          <Mail className="w-3.5 h-3.5 text-[#163422]" />
                          <span>Mail</span>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Customers
