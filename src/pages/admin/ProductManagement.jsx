import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import ProductFilterBar from '../../components/product/ProductFilterBar'
import AdminProductCard from '../../components/product/AdminProductCard'
import AddSpecimenCard from '../../components/product/AddSpecimenCard'
import AddSpecimenModal from '../../components/product/AddSpecimenModal'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'
import { Trash2, Sparkles, RefreshCw } from 'lucide-react'
import { isDummyProduct } from '../../data/productService'

import beginnerTarantula from '../../assets/image/beginner-tarantula-care.webp'

const ProductManagement = () => {
  const [filter, setFilter] = useState('All')
  const [sortBy, setSortBy] = useState('Price')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [purging, setPurging] = useState(false)
  const [productsList, setProductsList] = useState([])

  useEffect(() => {
    fetchLiveProducts()
  }, [])

  const fetchLiveProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
      if (error) console.error('Fetch products error:', error)
      
      const clientOnly = (data && Array.isArray(data)) ? data.filter(p => !isDummyProduct(p)) : []

      // Also load locally assigned client products
      let localClientProducts = []
      try {
        const saved = localStorage.getItem('tocos_client_products')
        if (saved) {
          localClientProducts = JSON.parse(saved).filter(p => !isDummyProduct(p))
        }
      } catch (e) {}

      const mergedMap = new Map()
      clientOnly.forEach(p => mergedMap.set(String(p.id), p))
      localClientProducts.forEach(p => mergedMap.set(String(p.id), p))

      const finalData = Array.from(mergedMap.values())

      if (finalData.length > 0) {
        const mapped = finalData.map(p => {
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
      await supabase.from('products').delete().eq('id', product.id)
    } catch (e) {}

    try {
      const saved = localStorage.getItem('tocos_client_products')
      if (saved) {
        const filtered = JSON.parse(saved).filter(p => p.id !== product.id)
        localStorage.setItem('tocos_client_products', JSON.stringify(filtered))
        window.dispatchEvent(new Event('storage'))
      }
    } catch (e) {}

    setProductsList(prev => prev.filter(p => p.id !== product.id))
    toast.success(`Specimen "${product.name}" removed from catalog.`)
  }

  const handlePurgeAllTestData = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently clear ALL test products, dummy orders, and test logs?\n\nThis will reset the application to a completely clean slate ready for handing over to the client."
    )
    if (!confirmed) return

    try {
      setPurging(true)

      // 1. Fetch & delete all products from Supabase
      try {
        const { data: allProds } = await supabase.from('products').select('id')
        if (allProds && allProds.length > 0) {
          const ids = allProds.map(p => p.id)
          await supabase.from('products').delete().in('id', ids)
        }
      } catch (e) {
        console.warn('Product purge DB error:', e)
      }

      // 2. Fetch & delete all orders & order items from Supabase
      try {
        const { data: allOrders } = await supabase.from('orders').select('id')
        if (allOrders && allOrders.length > 0) {
          const ordIds = allOrders.map(o => o.id)
          try {
            await supabase.from('order_items').delete().in('order_id', ordIds)
          } catch (e) {}
          await supabase.from('orders').delete().in('id', ordIds)
        }
      } catch (e) {
        console.warn('Order purge DB error:', e)
      }

      // 3. Clear all test keys in localStorage
      try {
        localStorage.removeItem('tocos_admin_orders')
        localStorage.removeItem('tocos_order_utrs')
        localStorage.removeItem('tocos_order_status_overrides')
        localStorage.removeItem('tocos_local_products')

        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i)
          if (key && (key.startsWith('user_orders_') || key.startsWith('tocos_'))) {
            localStorage.removeItem(key)
          }
        }
        window.dispatchEvent(new Event('storage'))
      } catch (e) {}

      // 4. Reset state
      setProductsList([])
      toast.success('All dummy test products and test data have been permanently purged! Application is fresh for client handover.')
    } catch (err) {
      console.error('Purge error:', err)
      toast.error('Notice during deletion: ' + (err.message || 'Check connection'))
    } finally {
      setPurging(false)
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
      id: newSpecimen.id || `client-${Date.now()}`,
      image: newSpecimen.image || beginnerTarantula,
      isFeatured: false,
      isHidden: false,
      originTag: newSpecimen.origin_tag || 'NEW WORLD',
      name: newSpecimen.name,
      sub_category: newSpecimen.sub_category || 'Terrestrial',
      category: newSpecimen.category || 'Tarantulas',
      rawPrice: rawVal,
      price: typeof newSpecimen.price === 'number' ? `₹ ${newSpecimen.price.toLocaleString('en-IN')}` : newSpecimen.price,
      commonName: newSpecimen.common_name || newSpecimen.name,
      stockCount: newSpecimen.stock || 10,
      stock: newSpecimen.stock || 10,
      isArchived: false,
      refNumber: newSpecimen.ref_number || 'AR-NEW',
      client_assigned: true,
      created_at: new Date().toISOString()
    }

    try {
      const saved = JSON.parse(localStorage.getItem('tocos_client_products') || '[]')
      const filtered = saved.filter(p => p.id !== formatted.id)
      filtered.unshift(formatted)
      localStorage.setItem('tocos_client_products', JSON.stringify(filtered))
      window.dispatchEvent(new Event('storage'))
    } catch (e) {}

    setProductsList(prev => [formatted, ...prev])
  }

  const hasTestPlaceholderData = productsList.some(p => 
    String(p.image).includes('placehold') || 
    p.name.includes('Misting') || 
    p.name.includes('Springtails') || 
    p.name.includes('Water Dish')
  )

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

            {productsList.length > 0 && (
              <button
                onClick={handlePurgeAllTestData}
                disabled={purging}
                className="px-3.5 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs disabled:opacity-50"
                title="Permanently remove all test specimens and dummy orders for clean client handover"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                <span>{purging ? 'Purging...' : 'Clear All Test Data'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Client Handover / Test Data Banner if test placeholders exist */}
        {hasTestPlaceholderData && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50/90 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-950 shadow-2xs">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs text-amber-900">Testing Data Detected for Handover</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Your catalog currently contains placeholder test products. Click &quot;Purge All Test Data Now&quot; to wipe test entries and leave a fresh catalog ready for your client.
                </p>
              </div>
            </div>
            <button
              onClick={handlePurgeAllTestData}
              disabled={purging}
              className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-md text-xs font-bold shrink-0 cursor-pointer transition shadow-xs disabled:opacity-50"
            >
              {purging ? 'Purging...' : 'Purge All Test Data Now'}
            </button>
          </div>
        )}

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
