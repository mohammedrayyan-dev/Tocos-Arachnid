import { Link } from "react-router-dom"
import Button from "./common/Button"
import beginnerTarantula from "../assets/image/beginner-tarantula-care.webp"
import mexicanRedKnee from "../assets/image/mexican-red-knee.webp"
import brazilianBlack from "../assets/image/brazilian-black.webp"
import { useCart } from "../context/CartContext"
import { toast } from "sonner"

const ProductCard = ({ product, fromLabel }) => {
    if (!product) return null
    const { name, slug, price, scientific_name, category, sub_category, temperament, in_stock } = product
    
    let rawImg = product.thumbnail || product.image || (Array.isArray(product.images) && product.images[0])
    let imageSrc = rawImg
    if (!rawImg || String(rawImg).includes('placehold.co')) {
        const nameLower = String(name || '').toLowerCase()
        if (nameLower.includes('mexican') || nameLower.includes('hamorii')) {
            imageSrc = mexicanRedKnee
        } else if (nameLower.includes('brazilian') || nameLower.includes('pulchra')) {
            imageSrc = brazilianBlack
        } else {
            imageSrc = beginnerTarantula
        }
    }

    const toSlug = (str) => (str ? String(str).toLowerCase().replace(/\s+/g, "-") : "")

  const { addItem } = useCart()

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product.id, 1, product)
    toast.success(`${name} added to cart!`)
  }

  return (

    <Link
    to={`/${toSlug(category || 'tarantulas')}/${toSlug(sub_category || 'terrestrial')}/${slug || ''}`}
    state={{ from: fromLabel || sub_category }}>

    <div className="flex flex-col h-full w-full bg-white border border-[#E5E7EB] rounded-lg overflow-hidden shadow-2xs hover:shadow-md transition duration-200">

    <div className="relative w-full aspect-square bg-[#FAF8F5] overflow-hidden">
        <img 
            src={imageSrc} 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
                const nameLower = String(name || '').toLowerCase()
                if (nameLower.includes('mexican') || nameLower.includes('hamorii')) {
                    e.currentTarget.src = mexicanRedKnee
                } else if (nameLower.includes('brazilian') || nameLower.includes('pulchra')) {
                    e.currentTarget.src = brazilianBlack
                } else {
                    e.currentTarget.src = beginnerTarantula
                }
            }}
        />
        {temperament && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10">
            <p className="bg-[#785832]/95 backdrop-blur-xs font-hanken text-white px-2 py-0.5 rounded-xs uppercase text-[9px] sm:text-xs font-bold shadow-2xs">
                {temperament}
            </p>
          </div>
        )}
    </div>

    <div className="w-full p-3 sm:p-4 flex flex-col justify-between flex-1 bg-white">
        <div>
          <div className="flex flex-col lg:flex-row lg:justify-between items-start gap-1 lg:gap-2">
              <h2 className="text-[#1C1B1B] font-libre text-sm sm:text-base lg:text-lg font-bold leading-snug line-clamp-2">
                  {name}
              </h2>
              <div className="text-left lg:text-right shrink-0 mt-0.5 lg:mt-0">
                <p className="text-[#163422] font-hanken text-sm sm:text-base lg:text-lg font-bold whitespace-nowrap">
                    ₹ {Number(price).toLocaleString('en-IN')}
                </p>
                {product.original_price && Number(product.original_price) > Number(price) && (
                  <div className="flex items-center gap-1 font-hanken">
                    <span className="line-through text-[9px] sm:text-[10px] text-[#6E756F]">
                      ₹ {Number(product.original_price).toLocaleString('en-IN')}
                    </span>
                    <span className="bg-[#EAF5ED] text-[#163422] font-bold text-[8px] sm:text-[9px] px-1 rounded">
                      {Math.round(((Number(product.original_price) - Number(price)) / Number(product.original_price)) * 100)}% OFF
                    </span>
                  </div>
                )}
              </div>
          </div>
          {scientific_name && (
            <p className="text-[#424843] font-hanken text-[11px] sm:text-xs font-medium mt-1 italic line-clamp-1">
                {scientific_name}
            </p>
          )}
        </div>

        <div className="mt-3">
          <span 
          className={`text-[9px] sm:text-xs font-semibold rounded-xs py-0.5 px-2 inline-block
          ${in_stock ? "bg-[#003710] text-white" : "bg-[#A4755130] text-[#A47551]" }`}>
            {in_stock ? "In stock" : "Sold out"}
          </span>
          <Button
          variant="outline"
          className="font-bold w-full h-9 sm:h-10 mt-2 cursor-pointer text-xs sm:text-sm"
          onClick={handleAddToCart}
          >
              Add to Cart
          </Button>
        </div>
    </div>

    </div>

    </Link>

  )
}

export default ProductCard