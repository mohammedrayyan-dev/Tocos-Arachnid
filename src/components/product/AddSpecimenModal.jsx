import { useState } from 'react'
import { X, Plus, Trash2, Tag, Layers } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { unmarkProductDeleted } from '../../lib/deletionSync'
import { toast } from 'sonner'

const DEFAULT_SIZES_BY_CATEGORY = {
  Tarantulas: [
    { id: 1, size: '0 - 1 cm (Sling)', price: '' },
    { id: 2, size: '1 - 2 cm (Juvenile)', price: '' },
    { id: 3, size: '2 - 4 cm (Sub-Adult)', price: '' },
    { id: 4, size: '4 - 6 cm (Adult)', price: '' }
  ],
  Enclosures: [
    { id: 1, size: 'Small (20x20x30 cm)', price: '' },
    { id: 2, size: 'Medium (30x30x45 cm)', price: '' },
    { id: 3, size: 'Large (45x45x60 cm)', price: '' },
    { id: 4, size: 'XL (60x45x90 cm)', price: '' }
  ],
  Bioactive: [
    { id: 1, size: '1 Litre', price: '' },
    { id: 2, size: '2 Litres', price: '' },
    { id: 3, size: '5 Litres', price: '' }
  ],
  Feeders: [
    { id: 1, size: 'Small Pack (25 pcs)', price: '' },
    { id: 2, size: 'Medium Pack (50 pcs)', price: '' },
    { id: 3, size: 'Bulk Pack (100 pcs)', price: '' }
  ]
}

const AddSpecimenModal = ({ isOpen, onClose, onSpecimenAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    common_name: '',
    category: 'Tarantulas',
    sub_category: 'Terrestrial',
    origin_tag: 'NEW WORLD',
    price: '',
    stock: '10',
    description: '',
    ref_number: `AR-${Math.floor(1000 + Math.random() * 9000)}-A`,
    image: 'https://images.unsplash.com/photo-1589464980073-f3d8e1d8e6ba?w=600&fit=crop'
  })

  const [sizeVariants, setSizeVariants] = useState(DEFAULT_SIZES_BY_CATEGORY['Tarantulas'])
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // If category changed, update default sizes if user hasn't customized heavily
    if (name === 'category' && DEFAULT_SIZES_BY_CATEGORY[value]) {
      setSizeVariants(DEFAULT_SIZES_BY_CATEGORY[value])
    }
  }

  // Handle custom size input changes
  const handleSizeChange = (id, field, value) => {
    setSizeVariants(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  const handleAddSizeRow = () => {
    setSizeVariants(prev => [
      ...prev,
      { id: Date.now(), size: '', price: '' }
    ])
  }

  const handleRemoveSizeRow = (id) => {
    setSizeVariants(prev => prev.filter(s => s.id !== id))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.price) {
      toast.error('Scientific Name and Price are required')
      return
    }

    setSubmitting(true)
    try {
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4)
      const basePriceNum = parseFloat(formData.price) || 0

      // Filter and format size variants with their specific pricing
      const validSizes = sizeVariants
        .filter(s => s.size && s.size.trim() !== '')
        .map((s, idx) => ({
          id: `sz-${idx}`,
          value: s.size.trim(),
          price: parseFloat(s.price) || basePriceNum
        }))

      const variantsPayload = validSizes.length > 0 ? {
        type: 'size',
        options: validSizes
      } : null

      const descWithMeta = variantsPayload
        ? `${formData.description?.trim() || ''}\n\n<!--SIZES:${JSON.stringify(variantsPayload)}-->`
        : (formData.description?.trim() || '')

      const newProduct = {
        name: formData.name.trim(),
        slug: slug,
        common_name: (formData.common_name || `${formData.name} • ${formData.sub_category}`).trim(),
        category: formData.category,
        sub_category: formData.sub_category,
        origin_tag: formData.origin_tag,
        price: basePriceNum,
        stock: parseInt(formData.stock) || 10,
        is_low_stock: (parseInt(formData.stock) || 10) < 5,
        is_featured: false,
        ref_number: formData.ref_number,
        image: formData.image,
        thumbnail: formData.image,
        description: descWithMeta
      }

      // Try inserting full payload with variants column
      let insertPayload = { ...newProduct }
      if (variantsPayload) {
        insertPayload.variants = variantsPayload
      }

      let res = await supabase.from('products').insert([insertPayload]).select('*')

      // Fallback 1: If variants column doesn't exist, insert without variants column (metadata is already in description)
      if (res.error) {
        res = await supabase.from('products').insert([newProduct]).select('*')
      }

      // Fallback 2: If custom fields don't exist in schema, retry with standard core columns
      if (res.error) {
        const corePayload = {
          name: newProduct.name,
          slug: newProduct.slug,
          category: newProduct.category,
          price: newProduct.price,
          stock: newProduct.stock,
          image: newProduct.image,
          thumbnail: newProduct.thumbnail,
          description: newProduct.description
        }
        res = await supabase.from('products').insert([corePayload]).select('*')
      }

      // Fallback 3: Bare essential columns
      if (res.error) {
        const barePayload = {
          name: newProduct.name,
          category: newProduct.category,
          price: newProduct.price,
          stock: newProduct.stock,
          image: newProduct.image,
          thumbnail: newProduct.thumbnail
        }
        res = await supabase.from('products').insert([barePayload]).select('*')
      }

      if (res.error) {
        console.error('Supabase product insert error:', res.error)
        throw new Error(res.error.message || 'Failed to save specimen to database')
      }

      const createdItem = (res.data && res.data[0]) ? res.data[0] : newProduct
      if (createdItem.id) {
        unmarkProductDeleted(createdItem.id)
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tocos:data_changed'))
        window.dispatchEvent(new Event('storage'))
      }

      toast.success(`Specimen "${formData.name}" added to Conservatory & Shop!`)
      if (onSpecimenAdded) onSpecimenAdded(createdItem)

      // Reset form
      setFormData({
        name: '',
        common_name: '',
        category: 'Tarantulas',
        sub_category: 'Terrestrial',
        origin_tag: 'NEW WORLD',
        price: '',
        stock: '10',
        description: '',
        ref_number: `AR-${Math.floor(1000 + Math.random() * 9000)}-A`,
        image: 'https://images.unsplash.com/photo-1589464980073-f3d8e1d8e6ba?w=600&fit=crop'
      })
      setSizeVariants(DEFAULT_SIZES_BY_CATEGORY['Tarantulas'])

      onClose()
    } catch (err) {
      console.error('Add specimen error:', err)
      toast.error(`Database Error: ${err.message || 'Could not insert specimen into Supabase'}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200 font-hanken">
        <div className="px-8 py-5 bg-[#FAF8F5] border-b border-[#E5E2DC] flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-libre font-bold text-[#163422]">
              Add New Specimen
            </h2>
            <p className="text-xs text-[#6E756F] mt-0.5">
              Create a new live specimen with custom description and size-based pricing.
            </p>
          </div>
          <button onClick={onClose} className="text-[#6E756F] hover:text-[#163422] cursor-pointer p-1 rounded-md hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* Scientific Name & Base Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#6E756F] uppercase tracking-wider mb-1.5">
                SCIENTIFIC NAME *
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Poecilotheria metallica"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-white border border-[#E5E2DC] rounded-md px-3.5 py-2.5 text-xs font-bold text-[#1C1B1B] focus:outline-none focus:border-[#163422]"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#6E756F] uppercase tracking-wider mb-1.5">
                BASE PRICE (₹) *
              </label>
              <input
                type="number"
                name="price"
                placeholder="28000"
                value={formData.price}
                onChange={handleChange}
                className="w-full bg-white border border-[#E5E2DC] rounded-md px-3.5 py-2.5 text-xs text-[#1C1B1B] focus:outline-none focus:border-[#163422]"
                required
              />
            </div>
          </div>

          {/* Common Name & Details */}
          <div>
            <label className="block text-[10px] font-bold text-[#6E756F] uppercase tracking-wider mb-1.5">
              COMMON NAME & DETAILS
            </label>
            <input
              type="text"
              name="common_name"
              placeholder="e.g. Gooty Sapphire Ornamental • Juvenile Female"
              value={formData.common_name}
              onChange={handleChange}
              className="w-full bg-white border border-[#E5E2DC] rounded-md px-3.5 py-2.5 text-xs text-[#1C1B1B] focus:outline-none focus:border-[#163422]"
            />
          </div>

          {/* Manual Specimen Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[10px] font-bold text-[#6E756F] uppercase tracking-wider">
                SPECIMEN DESCRIPTION (SHOWS IN PRODUCT DETAILS)
              </label>
              <span className="text-[10px] text-[#6E756F] italic">Shows on Product Page</span>
            </div>
            <textarea
              name="description"
              rows={3}
              placeholder="e.g. Stunning arboreal tarantula endemic to deciduous forest in Andhra Pradesh, India. Renowned for its radiant sapphire-blue iridescent hues and lightning speed. Recommended for experienced collectors."
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-white border border-[#E5E2DC] rounded-md px-3.5 py-2.5 text-xs text-[#1C1B1B] focus:outline-none focus:border-[#163422] resize-y leading-relaxed"
            />
          </div>

          {/* Category, Origin & Initial Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#6E756F] uppercase tracking-wider mb-1.5">
                CATEGORY
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-white border border-[#E5E2DC] rounded-md px-3 py-2 text-xs font-semibold text-[#1C1B1B]"
              >
                <option value="Tarantulas">Tarantulas</option>
                <option value="Enclosures">Enclosures</option>
                <option value="Bioactive">Bioactive</option>
                <option value="Feeders">Feeders</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#6E756F] uppercase tracking-wider mb-1.5">
                ORIGIN / TYPE
              </label>
              <select
                name="origin_tag"
                value={formData.origin_tag}
                onChange={handleChange}
                className="w-full bg-white border border-[#E5E2DC] rounded-md px-3 py-2 text-xs font-semibold text-[#1C1B1B]"
              >
                <option value="NEW WORLD">NEW WORLD</option>
                <option value="OLD WORLD">OLD WORLD</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#6E756F] uppercase tracking-wider mb-1.5">
                INITIAL STOCK
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full bg-white border border-[#E5E2DC] rounded-md px-3.5 py-2 text-xs text-[#1C1B1B]"
              />
            </div>
          </div>

          {/* Custom Sizes & Pricing Section */}
          <div className="pt-2 border-t border-[#E5E2DC]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#163422]" />
                  <h4 className="text-xs font-bold text-[#163422] uppercase tracking-wider">
                    Sizes & Custom Pricing
                  </h4>
                </div>
                <p className="text-[11px] text-[#6E756F] mt-0.5">
                  Define custom size options. The customer will see these options and the price will change according to the size selected.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddSizeRow}
                className="px-2.5 py-1.5 bg-[#FAF8F5] hover:bg-gray-100 border border-[#E5E2DC] text-[#163422] text-[11px] font-bold rounded flex items-center gap-1 cursor-pointer transition"
              >
                <Plus className="w-3.5 h-3.5 text-[#163422]" />
                <span>Add Size</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
              {sizeVariants.map((variant, index) => (
                <div key={variant.id} className="flex items-center gap-2 bg-[#FAF8F5] p-2.5 rounded-md border border-[#E5E2DC]">
                  <div className="flex-1">
                    <label className="block text-[9px] font-bold text-[#6E756F] uppercase mb-1">
                      Option / Size {index + 1}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 0 - 1 cm (Sling)"
                      value={variant.size}
                      onChange={(e) => handleSizeChange(variant.id, 'size', e.target.value)}
                      className="w-full bg-white border border-[#E5E2DC] rounded px-2.5 py-1.5 text-xs text-[#1C1B1B] font-medium focus:outline-none focus:border-[#163422]"
                    />
                  </div>

                  <div className="w-36">
                    <label className="block text-[9px] font-bold text-[#6E756F] uppercase mb-1">
                      Price for Size (₹)
                    </label>
                    <input
                      type="number"
                      placeholder={formData.price ? String(formData.price) : 'Price in ₹'}
                      value={variant.price}
                      onChange={(e) => handleSizeChange(variant.id, 'price', e.target.value)}
                      className="w-full bg-white border border-[#E5E2DC] rounded px-2.5 py-1.5 text-xs text-[#1C1B1B] font-bold focus:outline-none focus:border-[#163422]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveSizeRow(variant.id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded cursor-pointer transition mt-4"
                    title="Remove this size option"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {sizeVariants.length === 0 && (
                <div className="p-4 text-center border border-dashed border-[#E5E2DC] rounded-md text-xs text-[#6E756F]">
                  No custom sizes added. Click &quot;Add Size&quot; above to create size options with custom pricing.
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
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
              disabled={submitting}
              className="px-6 py-2.5 bg-[#163422] hover:bg-[#0D2316] text-white rounded-md font-bold text-xs uppercase shadow-xs cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'SAVING...' : 'SAVE SPECIMEN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddSpecimenModal
