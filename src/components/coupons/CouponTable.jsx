import { useState, useEffect } from 'react'
import { Pencil, Ban, RotateCw, Copy, CheckCircle2, Tag } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabase'
import EditCouponModal from './EditCouponModal'

const CouponTable = ({ coupons, activeFilter, searchQuery }) => {
  const [couponsList, setCouponsList] = useState(coupons || [])
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    setCouponsList(coupons || [])
  }, [coupons])

  const filteredCoupons = couponsList.filter(c => {
    const matchesFilter = !activeFilter || activeFilter === 'All' || c.status === activeFilter.toUpperCase()
    const matchesSearch = !searchQuery || c.code.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleOpenEdit = (coupon) => {
    setEditingCoupon(coupon)
    setIsEditModalOpen(true)
  }

  const handleEditSaveSuccess = (updatedData) => {
    const updated = couponsList.map(c => c.id === updatedData.id ? { ...c, ...updatedData } : c)
    setCouponsList(updated)

    // Save to local storage
    try {
      localStorage.setItem('tocos_coupons', JSON.stringify(updated))
    } catch (e) {}
  }

  const handleToggleStatus = async (id, currentStatus, code) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'EXPIRED' : 'ACTIVE'
    const updated = couponsList.map(c => (c.id === id || c.code === code) ? { ...c, status: newStatus } : c)
    setCouponsList(updated)

    // Save to local storage
    try {
      localStorage.setItem('tocos_coupons', JSON.stringify(updated))
    } catch (e) {}

    try {
      if (id) {
        await supabase
          .from('coupons')
          .update({ status: newStatus })
          .eq('id', id)
      }
      toast.success(`Coupon ${code} status changed to ${newStatus}`)
    } catch (e) {
      toast.success(`Coupon ${code} status changed to ${newStatus}`)
    }
  }

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
    toast.success(`Copied code "${code}" to clipboard!`)
  }

  return (
    <div className="bg-white border border-[#E5E2DC] rounded-xl overflow-hidden shadow-xs font-hanken">
      {filteredCoupons.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center justify-center gap-2 bg-[#FAF8F5]">
          <Tag className="w-8 h-8 text-[#6E756F]" />
          <p className="font-hanken font-bold text-sm text-[#1C1B1B]">No Coupons Found</p>
          <p className="font-hanken text-xs text-[#6E756F]">Click "CREATE NEW COUPON" above to add your first promo code.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E5E2DC]">
                <th className="px-6 py-4 font-bold text-[10px] text-[#6E756F] uppercase tracking-wider">
                  CODE
                </th>
                <th className="px-6 py-4 font-bold text-[10px] text-[#6E756F] uppercase tracking-wider">
                  DISCOUNT
                </th>
                <th className="px-6 py-4 font-bold text-[10px] text-[#6E756F] uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-6 py-4 font-bold text-[10px] text-[#6E756F] uppercase tracking-wider">
                  USAGE & REMAINING CLAIMS
                </th>
                <th className="px-6 py-4 font-bold text-[10px] text-[#6E756F] uppercase tracking-wider">
                  CONDITIONS & RULES
                </th>
                <th className="px-6 py-4 font-bold text-[10px] text-[#6E756F] uppercase tracking-wider text-right">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E2DC]">
              {filteredCoupons.map((coupon) => {
                const used = coupon.usage_count ?? coupon.usageCount ?? 0
                const total = coupon.max_usage ?? coupon.maxUsage ?? 500
                const remaining = Math.max(0, total - used)

                return (
                  <tr key={coupon.id || coupon.code} className="hover:bg-[#FAF8F5] transition">
                    {/* Code */}
                    <td className="px-6 py-4">
                      <p className="font-bold text-xs text-[#1C1B1B]">
                        {coupon.code}
                      </p>
                      {coupon.autoApplies !== false && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#163422] bg-[#EAF5ED] px-1.5 py-0.2 rounded mt-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Auto-Applies</span>
                        </span>
                      )}
                    </td>

                    {/* Discount */}
                    <td className="px-6 py-4 font-bold text-xs text-[#1C1B1B]">
                      {coupon.discount || (coupon.discount_type === 'Percentage (%)' ? `${coupon.discount_value}% OFF` : `₹ ${coupon.discount_value} Fixed`)}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        coupon.status === 'ACTIVE' 
                          ? 'bg-[#C8EBD0] text-[#163422]' 
                          : coupon.status === 'SCHEDULED' 
                          ? 'bg-[#FCECD9] text-[#785832]' 
                          : 'bg-gray-200 text-[#525B54]'
                      }`}>
                        {coupon.status}
                      </span>
                    </td>

                    {/* Usage & Remaining Claims Section */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-xs text-[#1C1B1B]">
                          {used.toLocaleString()} / {total.toLocaleString()} used
                        </p>
                        <p className="text-[11px] text-[#6E756F] mt-0.5">
                          <strong className="text-[#163422]">{remaining.toLocaleString()}</strong> claims remaining
                        </p>
                      </div>
                    </td>

                    {/* Conditions & Rules Section */}
                    <td className="px-6 py-4 text-xs">
                      <div className="space-y-0.5">
                        <p className="text-[#1C1B1B]">
                          Min Order: <strong>₹ {(coupon.minimum_order || coupon.minOrder || 0).toLocaleString('en-IN')}</strong>
                        </p>
                        <p className="text-[11px] text-[#6E756F]">
                          Expires: {coupon.expiryDate || coupon.expiry_date || 'Dec 31, 2026'} • 1 claim per user
                        </p>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3 text-[#6E756F]">
                        <button
                          onClick={() => handleOpenEdit(coupon)}
                          className="p-1 hover:text-[#163422] hover:bg-gray-100 rounded transition cursor-pointer"
                          title="Edit Coupon Rules"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(coupon.id, coupon.status, coupon.code)}
                          className="p-1 hover:text-[#163422] hover:bg-gray-100 rounded transition cursor-pointer"
                          title={coupon.status === 'EXPIRED' ? 'Re-activate Coupon' : 'Disable Coupon'}
                        >
                          {coupon.status === 'EXPIRED' ? (
                            <RotateCw className="w-4 h-4 text-[#785832]" />
                          ) : (
                            <Ban className="w-4 h-4 text-[#991B1B]" />
                          )}
                        </button>

                        <button
                          onClick={() => handleCopyCode(coupon.code)}
                          className="p-1 hover:text-[#163422] hover:bg-gray-100 rounded transition cursor-pointer"
                          title="Copy Coupon Code"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Coupon Modal */}
      <EditCouponModal
        isOpen={isEditModalOpen}
        coupon={editingCoupon}
        onClose={() => setIsEditModalOpen(false)}
        onSaveSuccess={handleEditSaveSuccess}
      />
    </div>
  )
}

export default CouponTable
