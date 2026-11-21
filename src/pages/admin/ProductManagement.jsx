import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import ProductFilterBar from '../../components/product/ProductFilterBar'
import AdminProductCard from '../../components/product/AdminProductCard'
import AddSpecimenCard from '../../components/product/AddSpecimenCard'
import AddSpecimenModal from '../../components/product/AddSpecimenModal'
import { supabase } from '../../lib/supabase'
import { filterActiveProducts, markProductDeleted } from '../../lib/deletionSync'
import { toast } from 'sonner'

import beginnerTarantula from '../../assets/image/beginner-tarantula-care.webp'

const ProductManagement = () => {
  const [filter, setFilter] = useState('All')
  const [sortBy, setSortBy] = useState('Price')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [productsList, setProductsList] = useState([])

  useEffect(() => {
    fetchLiveProducts()

    const channel = supabase
      .channel('admin-products-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchLiveProducts()
      })
      .subscribe()

    const handleSync = () => fetchLiveProducts()
    window.addEventListener('tocos:data_changed', handleSync)
    window.addEventListener('storage', handleSync)

    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener('tocos:data_changed', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [])

  const fetchLiveProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
      if (error) console.error('Fetch products error:', error)
      
      const rawData = (data && Array.isArray(data)) ? data : []
      const activeData = filterActiveProducts(rawData)

      if (activeData.length > 0) {
        const mapped = activeData.map(p => {
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
        setProductsList([])
      }
    } catch (e) {
      console.warn('Live products fetch notice:', e)
      setProductsList([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Are you sure you want to delete specimen "${product.name}"?`)) return

    try {
      await markProductDeleted(product.id)
      setProductsList(prev => prev.filter(p => p.id !== product.id))
      toast.success(`Specimen "${product.name}" permanently removed from catalog.`)
    } catch (e) {
      console.error('Delete product error:', e)
      toast.error('Failed to delete product: ' + e.message)
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

  const handleSpecimenAdded = () => {
    fetchLiveProducts()
  }

  return (
    <div className="flex flex-row w-full min-h-screen bg-[#FCF9F8]">
      <AdminSidebar currentPage="Products" />
      
      {/* Main Content Area */}
      <div className="ml-0 lg:ml-64 flex-1 p-4 sm:p-6 lg:p-10 pt-24 sm:pt-28 lg:pt-10 bg-[#FCF9F8] w-full min-w-0 font-hanken">
        {/* Page Header & Filter Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 mb-6 pb-6 border-b border-[#E5E2DC]">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-libre font-bold text-[#163422] tracking-tight">
              Product Management
            </h1>
            <p className="font-hanken text-xs font-semibold text-[#525B54] mt-1.5">
              Total Specimens: {productsList.length} • Active Listings: {productsList.filter(p => !p.isArchived).length}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ProductFilterBar 
              onFilterChange={setFilter}
              onSortChange={setSortBy}
            />
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {/* Add Specimen Card is ALWAYS reserved in first position */}
          <AddSpecimenCard onClick={() => setIsModalOpen(true)} />

          {/* List of Products rendered beside it in rows and columns */}
          {sortedProducts.map((product) => (
            <AdminProductCard 
              key={product.id} 
              product={product} 
              onDelete={handleDeleteProduct}
            />
          ))}
        </div>

        {/* Empty Catalog Guidance (when no products exist beside Add Specimen Card) */}
        {sortedProducts.length === 0 && !loading && (
          <div className="mt-8 p-8 border border-dashed border-[#E5E2DC] rounded-xl bg-white text-center">
            <p className="font-libre text-lg font-bold text-[#163422] mb-1">
              Your Catalog is Fresh & Clean
            </p>
            <p className="font-hanken text-xs text-[#6E756F] max-w-md mx-auto leading-relaxed">
              No specimens currently in inventory. Click &quot;Add New Specimen&quot; above to create your client&apos;s first live product listing.
            </p>
          </div>
        )}

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
