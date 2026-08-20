import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { getAllFeaturedByType } from "../../data/productService"
import ProductCard from "../../components/ProductCard"
import Container from "../../components/common/Container"
import FilterBar from "../../components/FilterBar"

const titleMap = {
    "New Arrivals" : "New Arrivals",
    "Recommended Beginner" : "Recommended for Beginners",
    "Collectors Choice" : "Collector's Choice",
}

const filterConfig = [
    {
        key: "residence",
        label: "Residence",
        options: ["All Residence", "Terrestrial", "Arboreal", "Fossorial"]
    },
    {
        key: "priceRange",
        label: "Price Range",
        options: ["All Prices", "Low to High", "High to Low"]
    },
    {
        key: "temperament",
        label: "Temperament",
        options: ["Any", "Docile", "Defensive", "Highly Defensive", "Prone to Bite"]
    }
]

const FeaturedAllPage = () => {
    const { type } = useParams()

    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState({
        residence: null,
        priceRange: null,
        temperament: null,
    })

    const filterProducts = (products, selected) => {
        return products.filter((product) => {
            const matchResidence = !selected.residence || product.residence === selected.residence
            const matchTemperament = !selected.temperament || product.temperament === selected.temperament

            return matchResidence && matchTemperament
        })
    }

    const sortProducts = (products, selected) => {
        const copy = [...products]

        if(selected.priceRange === "Low to High") {
            return copy.sort((a, b) => a.price - b.price)
        }

        if(selected.priceRange === "High to Low") {
            return copy.sort((a, b) => b.price - a.price)
        }

        return copy
    }

    const visibleProducts = sortProducts(filterProducts(products, selected), selected)

    const selectValue = (key, value) => {
        setSelected((prev) => ({
            ...prev,
            [key]: prev[key] === value ? null : value,
        }))
    }

    const featuredType = type
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ")

    console.log("featuredType:", featuredType)

    const load = async () => {
    setLoading(true)
    const data = await getAllFeaturedByType(featuredType)
    console.log("products returned:", data)
    if (isCurrent) {
        setProducts(data)
        setLoading(false)
    }
}

    useEffect(() => {
        let isCurrent = true
        const load = async () => {
            setLoading(true)
            const data = await getAllFeaturedByType(featuredType)
            if (isCurrent) {
                setProducts(data)
                setLoading(false)
            }
        }
        load()
        return () => { isCurrent = false }
    }, [featuredType])

    if (loading) {
        return (
            <div className="flex items-center justify-center px-6 py-10">
                <p className="px-6 py-10 text-sm text-[#6B7280]">Loading...</p>
            </div>
        )
    }

    return (

    <Container>

        <div className="flex flex-col gap-3 mt-8 mb-6 max-w-2xl">
            <h1 className="font-libre font-bold text-[#163422] text-5xl">
                {titleMap[featuredType] || "Featured Products"}
            </h1>
            <p className="font-hanken text-lg text-[#424843]">
                Featured Products
            </p>
        </div>

        <FilterBar selected={selected} onSelect={selectValue} filters={filterConfig} />

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-6 pb-16">
            {visibleProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
            ))}
        </div>

        {visibleProducts.length === 0 && ( 
            <div className="flex items-center justify-center px-6 py-10">
                <p className="px-6 py-10 text-sm text-[#6B7280]">No products found</p>
            </div>
        )}

    </Container>

    )
}

export default FeaturedAllPage