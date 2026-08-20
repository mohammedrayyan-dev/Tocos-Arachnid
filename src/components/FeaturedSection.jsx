import Container from "./common/Container"
import { Link } from "react-router-dom"
import RightArrow from "/src/assets/image/icons/right-arrow-brown.svg"
import { useState, useEffect } from "react"
import { getFeaturedByType } from "../data/productService"
import ProductCard from "./ProductCard"

const FeaturedSection = ({ type, title, description }) => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let isCurrent = true
        const load = async () => {
            setLoading(true)
            const data = await getFeaturedByType(type, 4)
            if (isCurrent) {
                setProducts(data)
                setLoading(false)
            }
        }
        load()
        return () => { isCurrent = false }
    }, [type])

    if (loading) {
        return (
            <Container>
                <div className="py-8">
                    <p className="font-hanken text-sm text-[#6B7280]">Loading recommendations...</p>
                </div>
            </Container>
        )
    }

    if (products.length === 0) return null 

  return (

    <Container>

    <div className="flex flex-col gap-1.5 py-6 sm:py-8 md:py-10">
        <div className="flex flex-row items-center justify-between gap-4">
            <h1 className="font-libre text-xl sm:text-2xl md:text-3xl font-bold text-[#163422]">
                {title}
            </h1>  
            <Link 
            to={`/featured/${type.toLowerCase().replace(/\s+/g, "-")}`}
            className="font-hanken text-xs sm:text-sm md:text-base text-[#785832] font-semibold flex flex-row items-center gap-1.5 whitespace-nowrap shrink-0 hover:underline">
                <span>View all</span>
                <img src={RightArrow} alt="Right Arrow" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#785832] object-contain shrink-0" />
            </Link>
        </div>

        <p className="font-hanken text-xs sm:text-sm md:text-base text-[#424843]">
            {description}
        </p>
    </div>

    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-12 sm:mb-16">
    {products.map((p) => (
        <ProductCard key={p.id} product={p} fromLabel={title} />
    ))}
    </div>

    </Container>
  )
}

export default FeaturedSection