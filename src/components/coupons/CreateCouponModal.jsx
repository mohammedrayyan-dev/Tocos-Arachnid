import { useState } from 'react'
import { ChevronDown, Sparkles, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

const CreateCouponModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    couponCode: '',
    discountType: 'Percentage (%)',
    discountValue: '20',
    minimumOrderValue: '1000',
    startDate: '',
    endDate: '',
    usageLimitPerCustomer: '1',
    totalUsageLimit: '500',
    enableImmediately: true
  })

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // 1. Coupon Code Validation
    const cleanCode = formData.couponCode.trim().toUpperCase()
    if (!cleanCode) {
      newErrors.couponCode = 'Coupon Code is required (e.g. SPIDER20)'
    } else if (cleanCode.length < 3) {
      newErrors.couponCode = 'Coupon Code must be at least 3 characters long'
    } else if (!/^[A-Z0-9_-]+$/.test(cleanCode)) {
      newErrors.couponCode = 'Code can only contain letters, numbers, hyphens, or underscores'
    }

    // 2. Discount Value Validation
    const val = parseFloat(formData.discountValue)
    if (isNaN(val) || val <= 0) {
      newErrors.discountValue = 'Please enter a valid positive discount amount'
    } else if (formData.discountType === 'Percentage (%)' && val > 100) {
      newErrors.discountValue = 'Percentage discount cannot exceed 100%'
    }

    // 3. Minimum Order Value Validation
    const minVal = parseFloat(formData.minimumOrderValue)
    if (isNaN(minVal) || minVal < 0) {
      newErrors.minimumOrderValue = 'Minimum order value must be 0 or greater'
    }

    // 4. Usage Limits Validation
    const perUser = parseInt(formData.usageLimitPerCustomer)
    if (isNaN(perUser) || perUser < 1) {
      newErrors.usageLimitPerCustomer = 'Usage limit per customer must be at least 1'
    }

    const totalLimit = parseInt(formData.totalUsageLimit)
    if (isNaN(totalLimit) || totalLimit < 1) {
      newErrors.totalUsageLimit = 'Total usage limit must be at least 1'
    }

    // 5. Date Validations
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end < start) {
        newErrors.endDate = 'End Date cannot be before Start Date'
      }
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0]
      toast.error(firstError)
      return false
    }

    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    const cleanCode = formData.couponCode.trim().toUpperCase()
    const couponPayload = {
      ...formData,
      couponCode: cleanCode,
      discountValue: parseFloat(formData.discountValue),
      minimumOrderValue: parseFloat(formData.minimumOrderValue),
      totalUsageLimit: parseInt(formData.totalUsageLimit),
      usageLimitPerCustomer: parseInt(formData.usageLimitPerCustomer)
    }

    toast.success(`Coupon ${cleanCode} created successfully!`)
    if (onSave) onSave(couponPayload)

    // Reset Form
    setFormData({
      couponCode: '',
      discountType: 'Percentage (%)',
      discountValue: '20',
      minimumOrderValue: '1000',
      startDate: '',
      endDate: '',
      usageLimitPerCustomer: '1',
      totalUsageLimit: '500',
      enableImmediately: true
    })
    setErrors({})
  }

  if (!isOpen) return null

  const minOrder = parseFloat(formData.minimumOrderValue) || 0
  const maxLimit = parseInt(formData.totalUsageLimit) || 100

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="bg-white w-full max-w-170 rounded-2xl shadow-2xl overflow-hidden border border-[#E5E2DC] flex flex-col max-h-[90vh] overflow-y-auto p-8 font-hanken animate-in fade-in zoom-in-95 duration-200">
        
        {/* Title */}
        <h2 className="font-libre text-3xl md:text-4xl font-bold text-[#163422] mb-6">
          Create New Coupon
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Row 1: Coupon Code & Discount Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#6E756F] uppercase tracking-[0.16em] mb-1.5">
                COUPON CODE *
              </label>
              <input
                type="text"
                name="couponCode"
                placeholder="e.g. SPIDER20"
                value={formData.couponCode}
                onChange={handleChange}
                className={`w-full bg-white border rounded-md px-3.5 py-2.5 text-xs text-[#1C1B1B] uppercase font-bold focus:outline-none transition shadow-2xs ${
                  errors.couponCode ? 'border-red-500 bg-red-50/20' : 'border-[#E5E2DC] hover:border-[#163422] focus:border-[#163422]'
                }`}
              />
              {errors.couponCode && (
                <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.couponCode}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#6E756F] uppercase tracking-[0.16em] mb-1.5">
                DISCOUNT TYPE *
              </label>
              <div className="relative">
                <select
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleChange}
                  className="w-full bg-white border border-[#E5E2DC] hover:border-[#163422] focus:border-[#163422] rounded-md px-3.5 py-2.5 text-xs font-semibold text-[#1C1B1B] focus:outline-none transition appearance-none cursor-pointer shadow-2xs"
                >
                  <option value="Percentage (%)">Percentage (%)</option>
                  <option value="Fixed Amount (₹)">Fixed Amount (₹)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#6E756F] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Row 2: Discount Value & Minimum Order Value */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#6E756F] uppercase tracking-[0.16em] mb-1.5">
                DISCOUNT VALUE *
              </label>
              <input
                type="number"
                step="any"
                name="discountValue"
                placeholder="20"
                value={formData.discountValue}
                onChange={handleChange}
                className={`w-full bg-white border rounded-md px-3.5 py-2.5 text-xs text-[#1C1B1B] font-semibold focus:outline-none transition shadow-2xs ${
                  errors.discountValue ? 'border-red-500 bg-red-50/20' : 'border-[#E5E2DC] hover:border-[#163422] focus:border-[#163422]'
                }`}
              />
              {errors.discountValue && (
                <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.discountValue}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#6E756F] uppercase tracking-[0.16em] mb-1.5">
                MINIMUM ORDER VALUE (CONDITION) *
              </label>
              <input
                type="number"
                step="any"
                name="minimumOrderValue"
                placeholder="1000.00"
                value={formData.minimumOrderValue}
                onChange={handleChange}
                className={`w-full bg-white border rounded-md px-3.5 py-2.5 text-xs text-[#1C1B1B] font-semibold focus:outline-none transition shadow-2xs ${
                  errors.minimumOrderValue ? 'border-red-500 bg-red-50/20' : 'border-[#E5E2DC] hover:border-[#163422] focus:border-[#163422]'
                }`}
              />
              {errors.minimumOrderValue && (
                <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.minimumOrderValue}</span>
                </p>
              )}
            </div>
          </div>

          {/* Divider 1 */}
          <div className="border-t border-[#E5E2DC] my-4" />

          {/* Row 3: Start Date & End Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#6E756F] uppercase tracking-[0.16em] mb-1.5">
                START DATE
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full bg-white border border-[#E5E2DC] hover:border-[#163422] focus:border-[#163422] rounded-md px-3.5 py-2.5 text-xs text-[#1C1B1B] focus:outline-none transition shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#6E756F] uppercase tracking-[0.16em] mb-1.5">
                END DATE
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={`w-full bg-white border rounded-md px-3.5 py-2.5 text-xs text-[#1C1B1B] focus:outline-none transition shadow-2xs ${
                  errors.endDate ? 'border-red-500 bg-red-50/20' : 'border-[#E5E2DC] hover:border-[#163422] focus:border-[#163422]'
                }`}
              />
              {errors.endDate && (
                <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.endDate}</span>
                </p>
              )}
            </div>
          </div>

          {/* Row 4: Usage Limit Per Customer & Total Usage Limit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#6E756F] uppercase tracking-[0.16em] mb-1.5">
                USAGE LIMIT PER CUSTOMER *
              </label>
              <input
                type="number"
                name="usageLimitPerCustomer"
                value={formData.usageLimitPerCustomer}
                onChange={handleChange}
                className="w-full bg-white border border-[#E5E2DC] hover:border-[#163422] focus:border-[#163422] rounded-md px-3.5 py-2.5 text-xs text-[#1C1B1B] focus:outline-none transition shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#6E756F] uppercase tracking-[0.16em] mb-1.5">
                MAXIMUM USERS / CLAIMS ALLOWED *
              </label>
              <input
                type="number"
                name="totalUsageLimit"
                value={formData.totalUsageLimit}
                onChange={handleChange}
                className="w-full bg-white border border-[#E5E2DC] hover:border-[#163422] focus:border-[#163422] rounded-md px-3.5 py-2.5 text-xs text-[#1C1B1B] focus:outline-none transition shadow-2xs"
              />
            </div>
          </div>

          {/* Live Conditions Summary Box */}
          <div className="bg-[#EAF5ED] border border-[#C6E6CE] p-3 rounded-lg flex items-start gap-2.5 text-xs font-hanken">
            <Sparkles className="w-4 h-4 text-[#163422] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#163422]">
                Auto-Apply Rule & Conditions Trigger
              </p>
              <p className="text-[11px] text-[#525B54] mt-0.5">
                Automatically applies at checkout when order total is <strong>≥ ₹ {minOrder.toLocaleString('en-IN')}</strong>. Up to <strong>{maxLimit.toLocaleString()} total customers</strong> can claim ({formData.usageLimitPerCustomer || '1'} per user).
              </p>
            </div>
          </div>

          {/* Divider 2 */}
          <div className="border-t border-[#E5E2DC] pt-2 my-4" />

          {/* Footer Controls Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            {/* Toggle Switch */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, enableImmediately: !formData.enableImmediately })}
                className={`w-11 h-6 rounded-full p-0.5 transition duration-200 cursor-pointer ${
                  formData.enableImmediately ? 'bg-[#163422]' : 'bg-[#E5E2DC]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition transform duration-200 shadow-2xs ${
                    formData.enableImmediately ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="font-hanken font-bold text-xs text-[#1C1B1B]">
                Enable Coupon Immediately
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-white border border-[#C2C8C0] hover:bg-gray-50 text-[#1C1B1B] rounded-md font-hanken font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-2xs"
              >
                CLOSE
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#163422] hover:bg-[#0D2316] text-white rounded-md font-hanken font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-xs"
              >
                SAVE COUPON
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  )
}

export default CreateCouponModal
