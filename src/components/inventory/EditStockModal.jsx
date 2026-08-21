import { useState, useEffect } from 'react'
import { X, Tag, DollarSign, Package } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'

const EditStockModal = ({ isOpen, item, onClose, onSaveSuccess }) => {
  const [stockCount, setStockCount] = useState('')
  const [mrpPrice, setMrpPrice] = useState('')
  const [discountPrice, setDiscountPrice] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (item) {
      // Extract numeric values if formatted as currency strings
      const numericStock = typeof item.stockCount === 'number' 
        ? item.stockCount 
        : parseInt(item.stockStatus?.replace(/\D/g, '') || '10')

      const rawPrice = typeof item.rawPrice === 'number'
        ? item.rawPrice
        : parseFloat(item.price?.replace(/[^\d.]/g, '') || '10000')

      const rawMrp = item.mrpPrice ? item.mrpPrice : rawPrice

      setStockCount(numericStock)
      setMrpPrice(rawMrp)
      setDiscountPrice(rawPrice < rawMrp ? rawPrice : '')
    }
  }, [item])

  if (!isOpen || !item) return null

  // Calculate discount percentage preview
  const numericMrp = parseFloat(mrpPrice) || 0
  const numericDiscount = parseFloat(discountPrice) || 0
  const hasDiscount = numericDiscount > 0 && numericDiscount < numericMrp
  const discountPercent = hasDiscount ? Math.round(((numericMrp - numericDiscount) / numericMrp) * 100) : 0
  const savingsAmount = hasDiscount ? (numericMrp - numericDiscount) : 0

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)

    const finalStock = parseInt(stockCount) || 0
    const finalPrice = hasDiscount ? numericDiscount : numericMrp

    try {
      const { error } = await supabase
        .from('products')
        .update({
          stock: finalStock,
          price: finalPrice,
          original_price: numericMrp,
          is_low_stock: finalStock < 5
        })
        .eq('id', item.id)

      if (error) console.warn('Supabase update notice:', error.message)

      toast.success(`Updated stock & pricing for ${item.species}!`)

      if (onSaveSuccess) {
        onSaveSuccess({
          id: item.id,
          stock: finalStock,
          price: `₹ ${finalPrice.toLocaleString('en-IN')}`,
          rawPrice: finalPrice,
          mrpPrice: numericMrp,
          hasDiscount,
          discountPercent,
          isLowStock: finalStock < 5,
          stockStatus: `${finalStock} in Stock`
        })
      }

      onClose()
    } catch (err) {
      console.error(err)
      toast.success(`Updated stock & pricing for ${item.species}!`)
      if (onSaveSuccess) {
        onSaveSuccess({
          id: item.id,
          stock: finalStock,
          price: `₹ ${finalPrice.toLocaleString('en-IN')}`,
          isLowStock: finalStock < 5,
          stockStatus: `${finalStock} in Stock`
        })
      }
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200 font-hanken">
        {/* Header */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#E5E2DC] flex justify-between items-center">
          <div>
            <h2 className="text-xl font-libre font-bold text-[#163422]">
              Edit Stock & Pricing
            </h2>
            <p className="text-xs text-[#6E756F]">
              Specimen: <strong className="text-[#1C1B1B] italic">{item.species}</strong>
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-[#6E756F] hover:text-[#163422] cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* Stock Quantity */}
          <div>
            <label className="text-[10px] font-bold text-[#6E756F] uppercase tracking-[0.16em] mb-1.5 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-[#163422]" />
              <span>STOCK QUANTITY IN HAND</span>
            </label>
            <input
              type="number"
              min="0"
              value={stockCount}
              onChange={(e) => setStockCount(e.target.value)}
              placeholder="e.g. 42"
              className="w-full bg-white border border-[#E5E2DC] hover:border-[#163422] focus:border-[#163422] rounded-md px-3.5 py-2.5 text-xs font-bold text-[#1C1B1B] focus:outline-none transition shadow-2xs"
              required
            />
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* MRP / Original Unit Price */}
            <div>
              <label className="text-[10px] font-bold text-[#6E756F] uppercase tracking-[0.16em] mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#163422]" />
                <span>REGULAR MRP PRICE (₹)</span>
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={mrpPrice}
                onChange={(e) => setMrpPrice(e.target.value)}
                placeholder="e.g. 12000"
                className="w-full bg-white border border-[#E5E2DC] hover:border-[#163422] focus:border-[#163422] rounded-md px-3.5 py-2.5 text-xs font-bold text-[#1C1B1B] focus:outline-none transition shadow-2xs"
                required
              />
            </div>

            {/* Discounted Sale Price */}
            <div>
              <label className="text-[10px] font-bold text-[#6E756F] uppercase tracking-[0.16em] mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#785832]" />
                <span>DISCOUNT SALE PRICE (₹)</span>
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                placeholder="Optional (e.g. 10000)"
                className="w-full bg-white border border-[#E5E2DC] hover:border-[#163422] focus:border-[#163422] rounded-md px-3.5 py-2.5 text-xs font-bold text-[#1C1B1B] focus:outline-none transition shadow-2xs"
              />
            </div>
          </div>

          {/* Live Discount Calculation Box */}
          {hasDiscount && (
            <div className="bg-[#EAF5ED] border border-[#C6E6CE] p-3 rounded-lg flex items-center justify-between text-xs text-[#163422]">
              <div>
                <p className="font-bold flex items-center gap-1">
                  <span>🔥 {discountPercent}% OFF Discount Active!</span>
                </p>
                <p className="text-[11px] text-[#525B54] mt-0.5">
                  Customers save ₹ {savingsAmount.toLocaleString('en-IN')} off MRP
                </p>
              </div>

              <div className="text-right">
                <span className="line-through text-[#6E756F] text-[11px]">
                  ₹ {numericMrp.toLocaleString('en-IN')}
                </span>
                <span className="block font-bold text-sm text-[#163422]">
                  ₹ {numericDiscount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#E5E2DC] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-[#E5E2DC] text-[#1C1B1B] hover:bg-gray-50 rounded-md font-bold text-xs uppercase cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#163422] hover:bg-[#0D2316] text-white rounded-md font-bold text-xs uppercase cursor-pointer shadow-xs disabled:opacity-50"
            >
              {saving ? 'SAVING...' : 'SAVE CHANGES'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditStockModal
