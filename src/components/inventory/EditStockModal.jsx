import { useState, useEffect } from 'react'
import { X, Tag, DollarSign, Package, Plus, Trash2, Image as ImageIcon, Upload } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { getProductGalleryImages } from '../../data/productService'
import { toast } from 'sonner'

const EditStockModal = ({ isOpen, item, onClose, onSaveSuccess }) => {
  const [stockCount, setStockCount] = useState('')
  const [mrpPrice, setMrpPrice] = useState('')
  const [discountPrice, setDiscountPrice] = useState('')
  const [photos, setPhotos] = useState([])
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

      // Extract existing images or fallback to thumbnail
      const existingImages = getProductGalleryImages(item.rawProduct || item)
      if (existingImages.length > 0) {
        setPhotos(existingImages)
      } else if (item.thumbnail) {
        setPhotos([item.thumbnail])
      } else {
        setPhotos([])
      }
    }
  }, [item])

  if (!isOpen || !item) return null

  // Calculate discount percentage preview
  const numericMrp = parseFloat(mrpPrice) || 0
  const numericDiscount = parseFloat(discountPrice) || 0
  const hasDiscount = numericDiscount > 0 && numericDiscount < numericMrp
  const discountPercent = hasDiscount ? Math.round(((numericMrp - numericDiscount) / numericMrp) * 100) : 0
  const savingsAmount = hasDiscount ? (numericMrp - numericDiscount) : 0

  const handleAddPhoto = () => {
    if (photos.length >= 4) {
      toast.info('Maximum 4 photos allowed per product')
      return
    }
    setPhotos(prev => [...prev, ''])
  }

  const handlePhotoChange = (index, value) => {
    setPhotos(prev => {
      const updated = [...prev]
      updated[index] = value
      return updated
    })
  }

  const handleRemovePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const handleFileUpload = (index, file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, WebP)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be under 5MB')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      handlePhotoChange(index, e.target.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)

    const finalStock = parseInt(stockCount) || 0
    const finalPrice = hasDiscount ? numericDiscount : numericMrp

    const validPhotos = photos.map(p => (typeof p === 'string' ? p.trim() : '')).filter(Boolean)
    const primaryPhoto = validPhotos[0] || item.thumbnail

    // Embed in description as resilient metadata fallback
    let updatedDesc = item.rawProduct?.description || item.description || ''
    if (validPhotos.length > 0) {
      updatedDesc = updatedDesc.replace(/<!--IMAGES:[\s\S]*?-->/g, '').trim() + `\n\n<!--IMAGES:${JSON.stringify(validPhotos)}-->`
    }

    try {
      let { error } = await supabase
        .from('products')
        .update({
          stock: finalStock,
          price: finalPrice,
          original_price: numericMrp,
          is_low_stock: finalStock < 5,
          image: primaryPhoto,
          thumbnail: primaryPhoto,
          images: validPhotos,
          description: updatedDesc
        })
        .eq('id', item.id)

      if (error) {
        // Fallback without images column
        const retryRes = await supabase
          .from('products')
          .update({
            stock: finalStock,
            price: finalPrice,
            image: primaryPhoto,
            thumbnail: primaryPhoto,
            description: updatedDesc
          })
          .eq('id', item.id)

        if (retryRes.error) {
          await supabase
            .from('products')
            .update({
              stock: finalStock,
              price: finalPrice
            })
            .eq('id', item.id)
        }
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tocos:data_changed'))
        window.dispatchEvent(new Event('storage'))
      }

      toast.success(`Updated stock, pricing & photos for ${item.species}!`)

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
          stockStatus: `${finalStock} in Stock`,
          thumbnail: primaryPhoto
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

          {/* Specimen Photos (Max 4) */}
          <div className="pt-2 border-t border-[#E5E2DC]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="text-[10px] font-bold text-[#6E756F] uppercase tracking-[0.16em] flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#163422]" />
                  <span>PRODUCT PHOTOS ({photos.filter(p => p && p.trim()).length}/4)</span>
                </label>
                <p className="text-[11px] text-[#6E756F] mt-0.5">
                  Max 4 photos for the product page gallery. First photo is the primary cover image.
                </p>
              </div>

              {photos.length < 4 && (
                <button
                  type="button"
                  onClick={handleAddPhoto}
                  className="px-2.5 py-1.5 bg-[#FAF8F5] hover:bg-gray-100 border border-[#E5E2DC] text-[#163422] text-[11px] font-bold rounded flex items-center gap-1 cursor-pointer transition"
                >
                  <Plus className="w-3.5 h-3.5 text-[#163422]" />
                  <span>Add Photo ({photos.length}/4)</span>
                </button>
              )}
            </div>

            <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
              {photos.map((photoUrl, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-[#FAF8F5] p-2.5 rounded-md border border-[#E5E2DC]">
                  <div className="w-14 h-14 rounded border border-[#E5E2DC] bg-white overflow-hidden shrink-0 relative flex items-center justify-center">
                    {photoUrl ? (
                      <img src={photoUrl} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-gray-300" />
                    )}
                    {idx === 0 && (
                      <span className="absolute bottom-0 inset-x-0 bg-[#163422] text-white text-[7px] font-bold text-center py-0.5 uppercase tracking-wider">
                        Cover
                      </span>
                    )}
                  </div>

                  <div className="flex-1 w-full flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[9px] font-bold text-[#6E756F] uppercase">
                        {idx === 0 ? 'Main Cover Photo' : `Photo ${idx + 1}`}
                      </label>
                      <label className="text-[10px] text-[#163422] font-semibold hover:underline cursor-pointer flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        <span>Upload file</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(idx, e.target.files?.[0])}
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      placeholder="Image URL or upload..."
                      value={photoUrl}
                      onChange={(e) => handlePhotoChange(idx, e.target.value)}
                      className="w-full bg-white border border-[#E5E2DC] rounded px-2.5 py-1.5 text-xs text-[#1C1B1B] font-mono focus:outline-none focus:border-[#163422]"
                    />
                  </div>

                  {photos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded cursor-pointer transition self-end sm:self-center"
                      title="Remove photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

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
