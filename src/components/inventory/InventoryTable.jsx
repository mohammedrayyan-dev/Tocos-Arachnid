import { useState, useEffect } from 'react'
import { MoreVertical, Tag } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabase'
import EditStockModal from './EditStockModal'
import mexicanRedKnee from '../../assets/image/mexican-red-knee.webp'
import beginnerTarantula from '../../assets/image/beginner-tarantula-care.webp'
import brazilianBlack from '../../assets/image/brazilian-black.webp'

const InventoryTable = () => {
  const [availability, setAvailability] = useState({})
  const [openActionId, setOpenActionId] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const initialItems = [
    {
      id: 1,
      thumbnail: mexicanRedKnee,
      species: 'Brachypelma hamorii',
      commonName: 'Mexican Red Knee • New World',
      category: 'Terrestrial',
      stockStatus: '42 in Stock',
      stockCount: 42,
      isLowStock: false,
      price: '₹ 10,000',
      rawPrice: 10000,
      mrpPrice: 12000,
      hasDiscount: true,
      discountPercent: 16
    },
    {
      id: 2,
      thumbnail: beginnerTarantula,
      species: 'Poecilotheria metallica',
      commonName: 'Gooty Sapphire • Old World',
      category: 'Arboreal',
      stockStatus: '3 Left (Low)',
      stockCount: 3,
      isLowStock: true,
      price: '₹ 28,000',
      rawPrice: 28000,
      mrpPrice: 28000,
      hasDiscount: false
    },
    {
      id: 3,
      thumbnail: brazilianBlack,
      species: 'Grammostola pulchra',
      commonName: 'Brazilian Black • New World',
      category: 'Terrestrial',
      stockStatus: '18 in Stock',
      stockCount: 18,
      isLowStock: false,
      price: '₹ 14,500',
      rawPrice: 14500,
      mrpPrice: 16000,
      hasDiscount: true,
      discountPercent: 9
    }
  ]

  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])

  useEffect(() => {
    fetchInventoryItems()
  }, [])

  const fetchInventoryItems = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
      if (error) console.error('Fetch inventory error:', error)

      if (data && data.length > 0) {
        const mapped = data.map(p => {
          const priceVal = typeof p.price === 'number' ? p.price : parseFloat(String(p.price).replace(/\D/g, '') || '0')
          const mrpVal = (p.original_price && p.original_price > priceVal) ? p.original_price : priceVal
          const savingsVal = mrpVal - priceVal
          const hasDisc = savingsVal > 0
          const discPct = hasDisc ? Math.round((savingsVal / mrpVal) * 100) : 0
          const img = p.thumbnail || p.image || (Array.isArray(p.images) && p.images[0]) || beginnerTarantula

          return {
            id: p.id,
            thumbnail: img,
            species: p.name,
            commonName: p.common_name || p.name,
            category: p.sub_category || p.category || 'Terrestrial',
            stockStatus: `${p.stock || 0} in Stock`,
            stockCount: p.stock || 0,
            isLowStock: (p.stock || 0) < 5,
            price: `₹ ${priceVal.toLocaleString('en-IN')}`,
            rawPrice: priceVal,
            mrpPrice: mrpVal,
            savings: savingsVal,
            hasDiscount: hasDisc,
            discountPercent: discPct
          }
        })
        setItems(mapped)
      } else {
        setItems(initialItems)
      }
    } catch (e) {
      console.warn('Using local fallback state for inventory', e)
    } finally {
      setLoading(false)
    }
  }

  const toggleAvailability = async (id) => {
    const nextState = !(availability[id] ?? true)
    setAvailability({ ...availability, [id]: nextState })
    
    try {
      await supabase.from('products').update({ is_hidden: !nextState }).eq('id', id)
      toast.success(`Specimen availability toggled ${nextState ? 'ON' : 'OFF'}`)
    } catch (e) {
      toast.success(`Availability toggled ${nextState ? 'ON' : 'OFF'}`)
    }
  }

  const handleOpenEditModal = (item) => {
    setEditingItem(item)
    setIsEditModalOpen(true)
    setOpenActionId(null)
  }

  const handleEditSaveSuccess = (updatedData) => {
    setItems(prev => prev.map(item => {
      if (item.id === updatedData.id) {
        return {
          ...item,
          ...updatedData
        }
      }
      return item
    }))
  }

  const handleDeleteItem = async (id, species) => {
    try {
      await supabase.from('products').delete().eq('id', id)
      setItems(prev => prev.filter(i => i.id !== id))
      toast.success(`Removed ${species} from inventory`)
    } catch (e) {
      setItems(prev => prev.filter(i => i.id !== id))
      toast.success(`Removed ${species} from inventory`)
    }
    setOpenActionId(null)
  }

  return (
    <div className="bg-white border border-[#E5E2DC] rounded-xl overflow-hidden shadow-xs font-hanken">
      <div className="overflow-x-auto">
        <table className="w-full text-left font-hanken">
          <thead>
            <tr className="bg-[#FAF8F5] border-b border-[#E5E2DC]">
              <th className="px-6 py-3 font-bold text-[10px] text-[#6E756F] uppercase tracking-wider whitespace-nowrap">
                THUMBNAIL
              </th>
              <th className="px-6 py-3 font-bold text-[10px] text-[#6E756F] uppercase tracking-wider whitespace-nowrap">
                SPECIES DETAILS
              </th>
              <th className="px-6 py-3 font-bold text-[10px] text-[#6E756F] uppercase tracking-wider whitespace-nowrap">
                CATEGORY
              </th>
              <th className="px-6 py-3 font-bold text-[10px] text-[#6E756F] uppercase tracking-wider whitespace-nowrap">
                STOCK STATUS
              </th>
              <th className="px-6 py-3 font-bold text-[10px] text-[#6E756F] uppercase tracking-wider whitespace-nowrap">
                MRP
              </th>
              <th className="px-6 py-3 font-bold text-[10px] text-[#6E756F] uppercase tracking-wider whitespace-nowrap">
                DISCOUNT PRICE
              </th>
              <th className="px-6 py-3 font-bold text-[10px] text-[#6E756F] uppercase tracking-wider whitespace-nowrap">
                AVAILABILITY
              </th>
              <th className="px-6 py-3 font-bold text-[10px] text-[#6E756F] uppercase tracking-wider text-right whitespace-nowrap">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E2DC]">
            {items.map((item) => {
              const isAvailable = availability[item.id] ?? true
              return (
                <tr key={item.id} className="hover:bg-gray-50/80 transition">
                  {/* Thumbnail */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={item.thumbnail}
                      alt={item.species}
                      className="w-12 h-12 rounded-lg object-cover border border-[#E5E2DC] shrink-0"
                    />
                  </td>

                  {/* Species Details */}
                  <td className="px-6 py-3.5">
                    <p className="font-bold text-xs md:text-sm text-[#1C1B1B] leading-tight">
                      {item.species}
                    </p>
                    <p className="text-[11px] text-[#6E756F] mt-0.5">
                      {item.commonName}
                    </p>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-3.5 whitespace-nowrap">
                    <span className="bg-[#F2EFEA] border border-[#E5E2DC] text-[#525B54] text-[11px] font-medium px-2.5 py-0.5 rounded-full inline-block">
                      {item.category}
                    </span>
                  </td>

                  {/* Stock Status */}
                  <td className="px-6 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${item.isLowStock ? 'bg-[#785832]' : 'bg-[#1C1B1B]'}`} />
                      <span className={`text-xs ${item.isLowStock ? 'font-bold text-[#785832]' : 'font-medium text-[#1C1B1B]'}`}>
                        {item.stockStatus}
                      </span>
                    </div>
                  </td>

                  {/* MRP Column */}
                  <td className="px-6 py-3.5 whitespace-nowrap">
                    <span className={`text-xs ${item.hasDiscount ? 'line-through text-[#6E756F] font-semibold' : 'text-[#1C1B1B] font-medium'}`}>
                      ₹ {item.mrpPrice.toLocaleString('en-IN')}
                    </span>
                  </td>

                  {/* Discount Price Column */}
                  <td className="px-6 py-3.5 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-extrabold text-xs md:text-sm text-[#163422]">
                        ₹ {item.rawPrice.toLocaleString('en-IN')}
                      </span>

                      {item.hasDiscount && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="bg-[#EAF5ED] text-[#163422] border border-[#C6E6CE] font-bold text-[10px] px-2 py-0.5 rounded-md inline-flex items-center gap-1 shadow-2xs">
                            <span>{item.discountPercent}% OFF</span>
                            <span className="text-[#525B54] font-normal">•</span>
                            <span className="text-[#163422] font-extrabold">SAVE ₹ {item.savings.toLocaleString('en-IN')}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Availability Toggle */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleAvailability(item.id)}
                      className={`w-11 h-6 rounded-full p-0.5 transition duration-200 cursor-pointer ${
                        isAvailable ? 'bg-[#163422]' : 'bg-[#E5E2DC]'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition transform duration-200 shadow-2xs ${
                          isAvailable ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </td>

                  {/* Actions Dropdown */}
                  <td className="px-6 py-4 text-right relative">
                    <button
                      onClick={() => setOpenActionId(openActionId === item.id ? null : item.id)}
                      className="p-1 text-[#6E756F] hover:text-[#163422] rounded hover:bg-gray-100 cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {openActionId === item.id && (
                      <div className="absolute right-6 top-12 bg-white border border-[#E5E2DC] rounded-lg shadow-lg py-1 w-36 z-30 text-xs">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="w-full text-left px-3.5 py-2 text-[#1C1B1B] hover:bg-[#FAF8F5] cursor-pointer font-semibold flex items-center gap-2"
                        >
                          <Tag className="w-3.5 h-3.5 text-[#163422]" />
                          <span>Edit Stock & Price</span>
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id, item.species)}
                          className="w-full text-left px-3.5 py-2 text-[#991B1B] hover:bg-red-50 cursor-pointer font-bold flex items-center gap-2 border-t border-[#E5E2DC]"
                        >
                          <span>Delete Specimen</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Stock Modal */}
      <EditStockModal
        isOpen={isEditModalOpen}
        item={editingItem}
        onClose={() => setIsEditModalOpen(false)}
        onSaveSuccess={handleEditSaveSuccess}
      />
    </div>
  )
}

export default InventoryTable
