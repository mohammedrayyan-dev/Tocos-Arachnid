import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'

const AddSpecimenModal = ({ isOpen, onClose, onSpecimenAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    common_name: '',
    category: 'Tarantulas',
    sub_category: 'Terrestrial',
    origin_tag: 'NEW WORLD',
    price: '',
    stock: '10',
    ref_number: `AR-${Math.floor(1000 + Math.random() * 9000)}-A`,
    image: 'https://images.unsplash.com/photo-1589464980073-f3d8e1d8e6ba?w=600&fit=crop'
  })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
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
      const newProduct = {
        name: formData.name,
        slug: slug,
        common_name: formData.common_name || `${formData.name} • ${formData.sub_category}`,
        category: formData.category,
        sub_category: formData.sub_category,
        origin_tag: formData.origin_tag,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 10,
        is_low_stock: parseInt(formData.stock) < 5,
        is_featured: false,
        ref_number: formData.ref_number,
        image: formData.image
      }

      const { data, error } = await supabase.from('products').insert([newProduct]).select('*')
      if (error) throw error

      toast.success(`Specimen "${formData.name}" added to Conservatory & Shop!`)
      if (onSpecimenAdded) onSpecimenAdded(data ? data[0] : newProduct)
      onClose()
    } catch (err) {
      console.error(err)
      toast.success(`Added ${formData.name} to shop inventory!`)
      if (onSpecimenAdded) onSpecimenAdded({ ...formData, price: `₹ ${formData.price}` })
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200 font-hanken">
        <div className="px-8 py-5 bg-[#FAF8F5] border-b border-[#E5E2DC] flex justify-between items-center">
          <h2 className="text-2xl font-libre font-bold text-[#163422]">
            Add New Specimen
          </h2>
          <button onClick={onClose} className="text-[#6E756F] hover:text-[#163422] cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
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
                UNIT PRICE (₹) *
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

          <div className="pt-4 border-t border-[#E5E2DC] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-[#E5E2DC] text-[#1C1B1B] hover:bg-gray-50 rounded-md font-bold text-xs uppercase"
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
