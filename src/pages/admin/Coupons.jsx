import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import CouponFilters from '../../components/coupons/CouponFilters'
import CouponTable from '../../components/coupons/CouponTable'
import CreateCouponModal from '../../components/coupons/CreateCouponModal'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'

const Coupons = () => {
  const [filter, setFilter] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [couponsList, setCouponsList] = useState([])

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    let dbCoupons = []
    let localCoupons = []

    // 1. Fetch from Local Storage
    try {
      const saved = localStorage.getItem('tocos_coupons')
      if (saved) localCoupons = JSON.parse(saved)
    } catch (e) {}

    // 2. Fetch from Supabase DB
    try {
      const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })
      if (!error && data && data.length > 0) {
        dbCoupons = data.map(c => ({
          id: c.id,
          code: c.code,
          discount: c.discount_type === 'Percentage (%)' ? `${c.discount_value}% OFF` : `₹ ${c.discount_value} Fixed`,
          discount_type: c.discount_type || 'Percentage (%)',
          discount_value: c.discount_value,
          minimum_order: c.minimum_order || 0,
          status: c.status || 'ACTIVE',
          usage: `${c.usage_count || 0} / ${c.max_usage || '∞'}`,
          max_usage: c.max_usage || 500,
          usage_count: c.usage_count || 0,
          expiryDate: c.expiry_date || 'Dec 31, 2026'
        }))
      }
    } catch (e) {
      console.warn('Database coupons notice:', e)
    }

    // Merge and deduplicate by code
    const combinedMap = new Map()
    localCoupons.forEach(c => combinedMap.set(c.code.toUpperCase(), c))
    dbCoupons.forEach(c => combinedMap.set(c.code.toUpperCase(), c))

    const finalCoupons = Array.from(combinedMap.values())
    setCouponsList(finalCoupons)
  }

  const handleSaveCoupon = async (formData) => {
    setIsModalOpen(false)

    const code = formData.couponCode.trim().toUpperCase()
    const discountStr = formData.discountType === 'Percentage (%)' 
      ? `${formData.discountValue}% OFF` 
      : `₹ ${formData.discountValue} Fixed`

    const newCouponFormatted = {
      id: Date.now(),
      code: code,
      discount: discountStr,
      discount_type: formData.discountType,
      discount_value: formData.discountValue,
      minimum_order: formData.minimumOrderValue,
      status: formData.enableImmediately ? 'ACTIVE' : 'SCHEDULED',
      usage: `0 / ${formData.totalUsageLimit || 500}`,
      max_usage: formData.totalUsageLimit || 500,
      usage_count: 0,
      expiryDate: formData.endDate || 'Dec 31, 2026'
    }

    // 1. Immediately update UI state
    setCouponsList(prev => [newCouponFormatted, ...prev.filter(c => c.code !== code)])

    // 2. Immediately save to Local Storage
    try {
      const existing = JSON.parse(localStorage.getItem('tocos_coupons') || '[]')
      const updated = [newCouponFormatted, ...existing.filter(c => c.code !== code)]
      localStorage.setItem('tocos_coupons', JSON.stringify(updated))
    } catch (e) {}

    // 3. Save to Supabase DB
    try {
      const dbPayload = {
        code: code,
        discount_type: formData.discountType,
        discount_value: formData.discountValue,
        minimum_order: formData.minimumOrderValue,
        status: formData.enableImmediately ? 'ACTIVE' : 'SCHEDULED',
        max_usage: formData.totalUsageLimit,
        expiry_date: formData.endDate || '2026-12-31'
      }

      await supabase.from('coupons').upsert([dbPayload], { onConflict: 'code' })
    } catch (e) {
      console.warn("Supabase coupon save notice:", e)
    }

    toast.success(`Coupon ${code} created and live!`)
  }

  return (
    <div className="flex flex-row w-full min-h-screen bg-[#FCF9F8]">

      {/* Admin Sidebar */}
      <AdminSidebar currentPage="Coupons" />

      {/* Main Content Area */}
      <div className="ml-0 lg:ml-64 flex-1 p-4 sm:p-6 lg:p-10 pt-24 sm:pt-28 lg:pt-10 bg-[#FCF9F8] w-full min-w-0 font-hanken">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-[#E5E2DC]">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-libre font-bold text-[#163422] tracking-tight">
              Coupon Management
            </h1>
            <p className="font-hanken text-xs font-semibold text-[#525B54] mt-1.5 flex items-center gap-3">
              <span><strong className="text-[#163422]">{couponsList.filter(c => c.status === 'ACTIVE').length}</strong> Active</span>
              <span>•</span>
              <span><strong className="text-[#525B54]">{couponsList.filter(c => c.status === 'EXPIRED').length}</strong> Expired</span>
              <span>•</span>
              <span><strong className="text-[#785832]">{couponsList.filter(c => c.status === 'SCHEDULED').length}</strong> Scheduled</span>
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 bg-[#163422] hover:bg-[#0D2316] text-white rounded-md font-hanken font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-xs"
          >
            CREATE NEW COUPON
          </button>
        </div>
        
        {/* Filters & Search Control Bar */}
        <CouponFilters 
          onFilterChange={setFilter}
          onSearch={setSearchTerm}
        />

        {/* Coupons List Table */}
        <CouponTable 
          coupons={couponsList}
          activeFilter={filter}
          searchQuery={searchTerm}
        />

        {/* Create Coupon Modal */}
        <CreateCouponModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCoupon}
        />
      </div>

    </div>
  )
}

export default Coupons
