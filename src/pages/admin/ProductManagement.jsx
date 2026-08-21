import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import ProductFilterBar from '../../components/product/ProductFilterBar'
import AdminProductCard from '../../components/product/AdminProductCard'
import AddSpecimenCard from '../../components/product/AddSpecimenCard'
import AddSpecimenModal from '../../components/product/AddSpecimenModal'
import { supabase } from '../../lib/supabase'

import beginnerTarantula from '../../assets/image/beginner-tarantula-care.webp'
import mexicanRedKnee from '../../assets/image/mexican-red-knee.webp'
import brazilianBlack from '../../assets/image/brazilian-black.webp'

const ProductManagement = () => {
  const [filter, setFilter] = useState('All')
  const [sortBy, setSortBy] = useState('Price')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const initialProducts = [
    {
      id: 1,
      image: beginnerTarantula,
      isFeatured: true,
      isHidden: false,
      originTag: 'NEW WORLD',
      name: 'Poecilotheria metallica',
      price: '₹ 28,000',
      rawPrice: 28000,
      commonName: 'Gooty Sapphire Ornamental • Juvenile Female',
      stockCount: 3,
      isArchived: false,
      refNumber: 'AR-2034-B'
    },
    {
      id: 2,
      image: mexicanRedKnee,
      isFeatured: false,
      isHidden: true,
      originTag: 'OLD WORLD',
      name: 'Brachypelma hamorii',
      price: '₹ 14,800',
      rawPrice: 14800,
      commonName: 'Mexican Red Knee • Sub-Adult Male',
      stockCount: 0,
      isArchived: true,
      refNumber: 'AR-5512-C'
    },
    {
      id: 3,
      image: brazilianBlack,
      isFeatured: false,
      isHidden: false,
      originTag: 'NEW WORLD',
      name: 'Acanthoscurria geniculata',
      price: '₹ 12,000',
      rawPrice: 12000,
      commonName: 'Brazilian Whiteknee • Sling (0.5")',
      stockCount: 12,
      isArchived: false,
      refNumber: 'AR-8891-A'
    }
  ]

  const [loading, setLoading] = useState(true)
  const [productsList, setProductsList] = useState([])

  useEffect(() => {
    fetchLiveProducts()
  }, [])

  const fetchLiveProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
      if (error) console.error('Fetch products error:', error)
      
      if (data && data.length > 0) {
        const mapped = data.map(p => {
          const img = p.thumbnail || p.image || (Array.isArray(p.images) && p.images[0]) || beginnerTarantula
          const priceNum = typeof p.price === 'number' ? p.price : parseFloat(String(p.price).replace(/\D/g, '') || '0')
          return {
            id: p.id,
            image: img,
            isFeatured: !!p.is_featured,
            isHidden: !!p.is_hidden,
            originTag: p.origin_tag || (p.sub_category?.toUpperCase().includes('OLD') ? 'OLD WORLD' : 'NEW WORLD'),
            name: p.name,
            sub_category: p.sub_category || '',
            category: p.category || '',
            rawPrice: priceNum,
            price: `₹ ${priceNum.toLocaleString('en-IN')}`,
            commonName: p.common_name || p.name,
            stockCount: p.stock ?? 10,
            isArchived: !!p.is_archived,
            refNumber: p.ref_number || `AR-${String(p.id).slice(0, 4)}-A`
          }
        })
        setProductsList(mapped)
      } else {
        setProductsList(initialProducts)
      }
    } catch (e) {
      console.warn('Using local fallback state for product management', e)
    } finally {
      setLoading(false)
    }
  }

  // Filter products by tab selection
  const filteredProducts = productsList.filter(p => {
    if (!filter || filter === 'All') return true
    const norm = filter.toLowerCase().trim()
    const tag = (p.originTag || '').toLowerCase()
    const subCat = (p.sub_category || '').toLowerCase()
    const common = (p.commonName || '').toLowerCase()
    const name = (p.name || '').toLowerCase()

    return tag.includes(norm) || subCat.includes(norm) || common.includes(norm) || name.includes(norm)
  })

  // Sort filtered products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'Price') return b.rawPrice - a.rawPrice
    if (sortBy === 'Name') return a.name.localeCompare(b.name)
    if (sortBy === 'Stock') return b.stockCount - a.stockCount
    if (sortBy === 'Newest') return b.id - a.id
    return 0
  })

  const handleSpecimenAdded = (newSpecimen) => {
    const rawVal = typeof newSpecimen.price === 'number' ? newSpecimen.price : parseFloat(String(newSpecimen.price).replace(/\D/g, '') || '0')
    const formatted = {
      id: newSpecimen.id || Date.now(),
      image: newSpecimen.image || beginnerTarantula,
      isFeatured: false,
      isHidden: false,
      originTag: newSpecimen.origin_tag || 'NEW WORLD',
      name: newSpecimen.name,
      rawPrice: rawVal,
      price: typeof newSpecimen.price === 'number' ? `₹ ${newSpecimen.price.toLocaleString('en-IN')}` : newSpecimen.price,
      commonName: newSpecimen.common_name || newSpecimen.name,
      stockCount: newSpecimen.stock || 10,
      isArchived: false,
      refNumber: newSpecimen.ref_number || 'AR-NEW'
    }
    setProductsList(prev => [formatted, ...prev])
  }

  return (
    <div className="flex flex-row w-full min-h-screen bg-[#FCF9F8]">
      <AdminSidebar currentPage="Products" />
      
      {/* Main Content Area */}
      <div className="ml-0 lg:ml-64 flex-1 p-4 sm:p-6 lg:p-10 pt-24 sm:pt-28 lg:pt-10 bg-[#FCF9F8] w-full min-w-0 font-hanken">
        {/* Page Header & Filter Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 mb-8 pb-6 border-b border-[#E5E2DC]">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-libre font-bold text-[#163422] tracking-tight">
              Product Management
            </h1>
            <p className="font-hanken text-xs font-semibold text-[#525B54] mt-1.5">
              Total Specimens: {productsList.length} • Active Listings: {productsList.filter(p => !p.isArchived).length}
            </p>
          </div>

          <ProductFilterBar 
            onFilterChange={setFilter}
            onSortChange={setSortBy}
          />
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {sortedProducts.map((product) => (
            <AdminProductCard 
              key={product.id} 
              product={product} 
            />
          ))}
          <AddSpecimenCard onClick={() => setIsModalOpen(true)} />
        </div>

        {/* Add Specimen Modal */}
        <AddSpecimenModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSpecimenAdded={handleSpecimenAdded}
        />
      </div>
    </div>
  )
}

export default ProductManagement
