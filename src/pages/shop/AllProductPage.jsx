import { useEffect, useState } from "react"
import Container from "../../components/common/Container"
import ProductCard from "../../components/ProductCard"
import { getAllProducts } from "../../data/productService"
import FilterBar from "../../components/FilterBar"

const AllProductPage = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState({
    species: "All Species",
    priceRange: "All Prices",
    temperament: "Any",
    careLevel: "All Levels",
    sortBy: "Newest Arrivals"
  })

  const selectValue = (key, value) => {
    setSelected((prev) => ({
      ...prev,
      [key]: value
    }))
  }

  const filterProducts = (products, selected) => {
    return products.filter((p) => {
      // 1. Species / Residence filter
      const matchSpecies =
        !selected.species ||
        selected.species === "All Species" ||
        p.residence?.toLowerCase() === selected.species.toLowerCase() ||
        p.sub_category?.toLowerCase() === selected.species.toLowerCase()

      // 2. Price Range filter
      let matchPrice = true
      if (selected.priceRange === "Under ₹1,000") matchPrice = p.price < 1000
      else if (selected.priceRange === "₹1,000 - ₹3,000") matchPrice = p.price >= 1000 && p.price <= 3000
      else if (selected.priceRange === "₹3,000 - ₹5,000") matchPrice = p.price >= 3000 && p.price <= 5000
      else if (selected.priceRange === "Over ₹5,000") matchPrice = p.price > 5000

      // 3. Temperament filter
      const matchTemperament =
        !selected.temperament ||
        selected.temperament === "Any" ||
        p.temperament?.toLowerCase() === selected.temperament.toLowerCase()

      // 4. Care Level filter
      const matchCareLevel =
        !selected.careLevel ||
        selected.careLevel === "All Levels" ||
        p.care_level?.toLowerCase()?.includes(selected.careLevel.toLowerCase()) ||
        (selected.careLevel === "Beginner" && (p.care_level?.toLowerCase().includes("beginner") || !p.care_level))

      return matchSpecies && matchPrice && matchTemperament && matchCareLevel
    })
  }

  const sortProducts = (products, sortBy) => {
    const copy = [...products]
    if (sortBy === "Price: Low to High") return copy.sort((a, b) => a.price - b.price)
    if (sortBy === "Price: High to Low") return copy.sort((a, b) => b.price - a.price)
    if (sortBy === "Name: A to Z") return copy.sort((a, b) => a.name.localeCompare(b.name))
    return copy
  }

  const visibleProducts = sortProducts(filterProducts(products, selected), selected.sortBy)

  useEffect(() => {
    let isCurrent = true

    const load = async () => {
      setLoading(true)
      const data = await getAllProducts()
      if (isCurrent) {
        setProducts(data)
        setLoading(false)
      }
    }
    load()
    return () => {
      isCurrent = false
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="font-hanken text-sm text-[#6B7280]">Loading products...</p>
      </div>
    )
  }

  return (
    <div className="bg-white py-6 min-h-screen">
      <Container>
        <h1 className="font-libre font-bold text-[#163422] text-3xl sm:text-4xl lg:text-5xl mt-4 mb-6">
          All Products
        </h1>

        <FilterBar selected={selected} onSelect={selectValue} />

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-6 pb-16">
          {visibleProducts.length > 0 ? (
            visibleProducts.map((p) => (
              <ProductCard key={p.id} product={p} fromLabel="All Products" />
            ))
          ) : (
            <div className="col-span-full py-12 text-center font-hanken text-sm text-[#6E756F]">
              No products found matching your active filters. Try adjusting your selections.
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}

export default AllProductPage