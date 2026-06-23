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

    if (loading) return null
    if (products.length === "0") return null 

    const toSlug = (str) => str.toLowerCase().replace(/\s+/g, "-")

  return (

    <Container>

    <div className="flex flex-col gap-3 py-8">
        <h1 className="font-libre text-3xl font-semibold text-[#163422]">
            {title}
        </h1>  

        <div className="flex flex-row justify-between">
            <p className="font-hanken text-base text-[#424843]">
                {description}
            </p>
            <Link 
            to={`/featured/${toSlug(type)}`}
            className="font-hanken text-base text-[#785832] font-medium flex flex-row items-center gap-2">
                View all
                <img src={RightArrow} alt="Right Arrow" className="text-[#785832] object-contain" />
            </Link>
        </div>
    </div>

    <div className="flex flex-row gap-10">
    {products.map((p) => (
        <ProductCard key={p.id} product={p} />
    ))}
    </div>

    </Container>
  )
}

export default FeaturedSection