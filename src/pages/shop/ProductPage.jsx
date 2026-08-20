import { useEffect, useState } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import Container from "../../components/common/Container"
import Cash from "/src/assets/image/icons/brown-cash.svg"
import Shipping from "/src/assets/image/icons/brown-shipping.svg"
import { getProductBySlug } from "../../data/productService"
import Arrows from "/src/assets/image/icons/arrow.svg"
import { useAuth } from "../../context/AuthContext"
import { useCart } from "../../context/CartContext"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import Climate from "/src/assets/image/icons/climate-precision.svg"
import Selection from "/src/assets/image/icons/enclosure-selection.svg"
import Security from "/src/assets/image/icons/security-hides.svg"
import Substrate from "/src/assets/image/icons/substrate.svg"
import Guarantee from "/src/assets/image/icons/guarantee.svg"
import Control from "/src/assets/image/icons/climate-control.svg"
import Delivery from "/src/assets/image/icons/delivery.svg"
import Plus from "/src/assets/image/icons/plus.svg"
import Minus from "/src/assets/image/icons/minus.svg"

const offers = [
  {
    img: Cash, 
    title: "Cash back",
    desc: "Get up to ₹200 off on your first Purchase."
  },
  {
    img: Shipping, 
    title: "Free Shipping",
    desc: "purchase Above ₹5999."
  },
  {
    img: Cash, 
    title: "Cash back",
    desc: "purchase Above ₹6999."
  }
]

const getSizeOptionsForProduct = (product) => {
  if (product?.variants?.options && Array.isArray(product.variants.options)) {
    const unitStr = product.variants.unit ? ` ${product.variants.unit}` : ""
    return product.variants.options.map(opt => `${opt.value}${unitStr}`)
  }

  const cat = (product?.category || "").toLowerCase()
  const subCat = (product?.sub_category || "").toLowerCase()

  if (cat.includes("enclosure") || subCat.includes("enclosure") || subCat.includes("vivarium")) {
    return ["Small (20x20x30 cm)", "Medium (30x30x45 cm)", "Large (45x45x60 cm)", "XL (60x45x90 cm)"]
  }

  if (cat.includes("bioactive") || cat.includes("substrate") || subCat.includes("substrate") || subCat.includes("decor")) {
    return ["1 Litre", "2 Litres", "5 Litres", "10 Litres"]
  }

  if (cat.includes("reptile") || subCat.includes("reptile") || subCat.includes("lizard") || subCat.includes("snake") || subCat.includes("frog")) {
    return ["Baby / Hatchling", "Juvenile", "Sub-Adult", "Adult"]
  }

  // Default Tarantula / Invertebrate sizes matching reference screenshot
  return ["0 - 1 cm", "4 - 6 cm", "1 - 2 cm", "6 - 10 cm", "2 - 4 cm", "10 - 14 cm"]
}

const enclosureData = [
  {
    img: Selection,
    title: "1. Enclosure Selection",
    desc: "Glass or Acrylic with cross-ventilation is essential for air quality."
  },
  {
    img: Substrate,
    title: "2. Substrate & Depth",
    desc: "10-15cm of coco fiber or peat moss for natural burrowing behavior."
  },
  {
    img: Security,
    title: "3. Security & Hides",
    desc: "Provide cork bark or half-logs for security and stress reduction."
  },
  {
    img: Climate,
    title: "4. Climate Precision",
    desc: "Maintain 72-78°F and 60-70% humidity for optimal health."
  }
]

const shippingDetails = [
  {
    id: 1,
    img: Guarantee,
    title: "Live Arrival Guarantee",
    desc: "We guarantee your specimen arrives healthy. In case of DOA, notify us within 2 hours with video proof."
  },
  {
    id: 2,
    img: Control,
    title: "Climate-Controlled Packaging",
    desc: "Specialized insulated boxes with heat or cool packs included as required by current weather conditions."
  },
  {
    id: 3,
    img: Delivery,
    title: "Express Delivery",
    desc: "24-48 hour express delivery to ensure specimen safety and minimal transit stress."
  },
]

const ProductPage = () => {
  const { user } = useAuth()
  const { addItem } = useCart()

  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const [showDetails, setShowDetails] = useState(true)
  const [showEnclosure, setShowEnclosure] = useState(true)
  const [showShipping, setShowShipping] = useState(true)

  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  const fromLabel = location.state?.from || "Home Page"

  const handleBack = () => {
    navigate(-1)
  }

  const handleAddToCart = async () => {
    if (!user) {
      toast.info("Please sign in to add items to your cart")
      navigate("/sign-in", { state: { returnTo: location.pathname } })
    } else {
      await addItem(product.id, qty)
      toast.success("Item added to cart!")
    }
  }

  const handleBuyNow = async () => {
    if (!user) {
      toast.info("Please sign in to proceed with checkout")
      navigate("/sign-in", { state: { returnTo: location.pathname } })
    } else {
      await addItem(product.id, qty)
      navigate("/cart")
    }
  }

  useEffect(() => {
    let isCurrent = true

    const load = async () => {
      setLoading(true)
      const data = await getProductBySlug(slug)
      if (isCurrent) {
        setProduct(data)
        const sizeOpts = getSizeOptionsForProduct(data)
        setSelectedSize(sizeOpts[2] || sizeOpts[0] || "")
        setLoading(false)
      }
    }

    load()

    return () => {
      isCurrent = false
    }
  }, [slug])

  if (loading) {
    return ( 
      <div className="flex items-center justify-center min-h-100">
        <p className="font-hanken text-sm text-[#6B7280]">Loading product details...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <p className="font-hanken text-sm text-[#6B7280]">Product not found.</p>
      </div>
    )
  }

  const {
    name,
    scientific_name,
    price,
    in_stock,
    description,
    temperament,
    thumbnail,
    discounted_price,
    category
  } = product

  const galleryImages = [thumbnail, thumbnail]
  const currentSizeOptions = getSizeOptionsForProduct(product)

  return (
    <div className="bg-white min-h-screen py-6">
      <Container>

        {/* Navigation Back Link */}
        <button
          onClick={handleBack}
          className="font-hanken text-sm font-semibold text-[#785832] hover:text-[#163422] flex items-center gap-2 cursor-pointer mb-4 transition group"
        >
          <ArrowLeft className="w-4 h-4 text-[#785832] group-hover:-translate-x-1 transition-transform" />
          <span>{fromLabel}</span>
        </button>

        {/* Product Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start mb-10">

          {/* Left Column: Image Gallery */}
          <div className="flex flex-col gap-3">
            <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-100 rounded-sm overflow-hidden border border-[#E5E2DC] bg-[#FAF8F5]">
              <img
                src={galleryImages[selectedImageIndex] || thumbnail}
                alt={name}
                className="w-full h-full object-cover"
              />
              {temperament && (
                <span className="absolute top-3 left-3 bg-[#785832] font-hanken text-white px-2 py-0.5 uppercase text-[9px] font-bold rounded-xs tracking-wider">
                  {temperament}
                </span>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex items-center gap-2.5">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-sm overflow-hidden border cursor-pointer transition ${
                    selectedImageIndex === idx ? "border-[#163422]" : "border-[#E5E2DC]"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Purchase Box */}
          <div className="bg-white border border-[#E5E2DC] rounded-none p-4 lg:p-5 flex flex-col gap-3 shadow-2xs">
            
            {/* Header: Title & Badges */}
            <div className="flex flex-col gap-1">
              <h1 className="font-libre text-xl sm:text-2xl lg:text-3xl font-bold text-[#1C1B1B] leading-snug">
                {name} {scientific_name && <span className="font-normal text-[#1C1B1B]">({scientific_name})</span>}
              </h1>

              <div className="flex items-center gap-2.5 mt-0.5">
                <span className="bg-[#FCECD9] text-[#785832] font-hanken font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-xs">
                  BEST FOR BEGINNERS
                </span>
                <span className="font-hanken text-[11px] text-[#6E756F]">
                  100+ bought in last month
                </span>
              </div>
            </div>

            {/* Price Row */}
            <div className="flex flex-col gap-0.5">
              <div className="flex items-baseline gap-2.5">
                <span className="font-libre text-2xl lg:text-3xl font-bold text-[#785832]">
                  ₹{(typeof price === 'number' ? price : (parseFloat(String(price || 0).replace(/[^\d.]/g, '')) || 0)).toLocaleString('en-IN')}.00
                </span>
                {discounted_price && (
                  <span className="font-libre text-sm text-[#785832] line-through">
                    ₹{(typeof discounted_price === 'number' ? discounted_price : (parseFloat(String(discounted_price || 0).replace(/[^\d.]/g, '')) || 0)).toLocaleString('en-IN')}.00
                  </span>
                )}
              </div>
              <p className="font-hanken text-[11px] text-[#6E756F] mt-0.5 leading-tight">
                Shipping will be calculated at Checkout. Delivery possible all over India.
              </p>
            </div>

            <div className="h-px bg-[#E5E2DC] w-full" />

            {/* Offers Section */}
            <div>
              <h2 className="font-libre text-lg font-bold text-[#785832] mb-1.5">
                Offers
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {offers.map((o, idx) => (
                  <div key={idx} className="bg-white border border-[#E5E2DC] p-2.5 rounded-none flex flex-col justify-between min-h-22.5">
                    <div>
                      <img src={o.img} alt="" className="w-4 h-4 object-contain" />
                      <h3 className="font-hanken font-bold text-xs text-[#1C1B1B] mt-1.5">
                        {o.title}
                      </h3>
                      <p className="font-hanken text-[10px] text-[#6E756F] leading-snug mt-0.5">
                        {o.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamic Size Selector */}
            {currentSizeOptions.length > 0 && (
              <div>
                <h2 className="font-libre text-lg font-bold text-[#785832] mb-1.5">
                  Size
                </h2>
                <div className="grid grid-cols-2 gap-y-1.5 gap-x-4">
                  {currentSizeOptions.map((sz, idx) => {
                    const isSelected = selectedSize === sz
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedSize(sz)}
                        className="flex items-center gap-2 font-hanken text-xs font-medium text-[#1C1B1B] cursor-pointer select-none"
                      >
                        <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                          isSelected ? 'border-[#163422]' : 'border-[#C2C8C0]'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#163422]" />}
                        </div>
                        <span>{sz}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Quantity Stepper & Add to Cart & BUY NOW */}
            <div className="flex flex-col gap-2 mt-0.5">
              <div className="flex items-center gap-2">
                {/* Stepper */}
                <div className="flex items-center justify-between border border-[#163422] px-3 py-2 rounded-none bg-white w-24">
                  <button
                    disabled={!in_stock}
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="text-[#1C1B1B] font-bold text-sm hover:opacity-75 cursor-pointer disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="font-hanken font-bold text-xs text-[#1C1B1B]">
                    {qty}
                  </span>
                  <button
                    disabled={!in_stock}
                    onClick={() => setQty(qty + 1)}
                    className="text-[#1C1B1B] font-bold text-sm hover:opacity-75 cursor-pointer disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={!in_stock}
                  className="flex-1 py-2 px-4 bg-white border border-[#163422] text-[#163422] font-hanken font-bold text-xs rounded-none hover:bg-[#163422] hover:text-white transition cursor-pointer text-center uppercase tracking-wider disabled:opacity-50"
                >
                  Add to Cart
                </button>
              </div>

              {/* BUY NOW Button */}
              <button
                onClick={handleBuyNow}
                disabled={!in_stock}
                className="w-full py-3 px-4 bg-[#163422] hover:bg-[#0D2316] text-white font-hanken font-bold text-xs tracking-widest uppercase rounded-none transition cursor-pointer text-center shadow-2xs disabled:opacity-50"
              >
                {in_stock ? "BUY NOW" : "SOLD OUT"}
              </button>
            </div>
          </div>
        </div>

        {/* Accordions Section */}
        <div className="flex flex-col gap-6 mb-16">

          {/* Accordion 1: Details */}
          <div className="border-b border-[#E5E2DC] pb-6">
            <div
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between py-2 cursor-pointer group"
            >
              <h2 className="font-libre text-2xl font-bold text-[#91724B] tracking-tight">
                {category === "Tarantulas" || !category ? "Tarantula Details" : `${category} Details`}
              </h2>
              <img 
                src={Arrows}
                alt="Toggle details"
                className={`w-6 h-6 object-contain cursor-pointer transition-transform duration-300 ${showDetails ? "rotate-360" : "rotate-270"}`}
              />
            </div>

            {showDetails && (
              <div className="pt-4 flex flex-col gap-3">
                <p className="font-hanken text-sm text-[#525B54] leading-relaxed">
                  {description || "The Brachypelma auratum, commonly known as the Mexican Flame Knee, is a stunning terrestrial tarantula endemic to the Pacific coast of Mexico. It is closely related to the famous Mexican Red Knee but distinguished by its more vibrant, flame-like orange markings on the patella."}
                </p>
                <ul className="font-hanken text-xs text-[#525B54] space-y-1.5 pl-1">
                  <li>• <strong className="font-semibold text-[#163422]">Adult Size:</strong> Up to 15cm (6 inches)</li>
                  <li>• <strong className="font-semibold text-[#163422]">Lifespan:</strong> Females up to 25+ years, Males 5-8 years</li>
                  <li>• <strong className="font-semibold text-[#163422]">Temperament:</strong> Docile but can be skittish</li>
                  <li>• <strong className="font-semibold text-[#163422]">Growth Rate:</strong> Slow to Medium</li>
                </ul>
              </div>
            )}
          </div>

          {/* Accordion 2: Enclosure Setup */}
          <div className="border-b border-[#E5E2DC] pb-6">
            <div
              onClick={() => setShowEnclosure(!showEnclosure)}
              className="w-full flex items-center justify-between py-2 cursor-pointer group"
            >
              <h2 className="font-libre text-2xl font-bold text-[#163422] tracking-tight">
                Enclosure Setup
              </h2>
              <img 
                src={Arrows}
                alt="Toggle enclosure"
                className={`w-6 h-6 object-contain cursor-pointer transition-transform duration-300 ${showEnclosure ? "rotate-360" : "rotate-270"}`}
              />
            </div>

            {showEnclosure && (
              <div className="pt-4 flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {enclosureData.map((e, idx) => (
                    <div key={idx} className="bg-[#FAF8F5] border border-[#E5E2DC] p-4 rounded-md flex items-start gap-3.5">
                      <img src={e.img} alt="" className="w-4 h-4 object-contain mt-0.5" />
                      <div className="flex flex-col gap-0.5">
                        <h3 className="font-hanken font-bold text-xs text-[#163422]">
                          {e.title}
                        </h3>
                        <p className="font-hanken text-[11px] text-[#6E756F] leading-snug">
                          {e.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="font-hanken italic text-xs text-[#6E756F] pt-1">
                  Proper enclosure setup is critical for the long-term health and safety of your {name}.
                </p>
              </div>
            )}
          </div>

          {/* Accordion 3: Shipping Details */}
          <div className="border-b border-[#E5E2DC] pb-6">
            <div
              onClick={() => setShowShipping(!showShipping)}
              className="w-full flex items-center justify-between py-2 cursor-pointer group"
            >
              <h2 className="font-libre text-2xl font-bold text-[#163422] tracking-tight">
                Shipping Details
              </h2>
              <img 
                src={Arrows}
                alt="Toggle shipping"
                className={`w-6 h-6 object-contain cursor-pointer transition-transform duration-300 ${showShipping ? "rotate-360" : "rotate-270"}`}
              />
            </div>

            {showShipping && (
              <div className="pt-4 flex flex-col gap-3">
                {shippingDetails.map((s) => (
                  <div 
                    key={s.id}
                    className={`p-4 rounded-md border flex items-start gap-3.5 ${
                      s.id === 1 ? "bg-[#FFF9F2] border-[#F3E2CF]" : "bg-[#FAF8F5] border-[#E5E2DC]"
                    }`}
                  >
                    <img src={s.img} alt="" className="w-4 h-4 object-contain mt-0.5" />
                    <div className="flex flex-col gap-0.5">
                      <h3 className={`font-hanken font-bold text-xs ${s.id === 1 ? "text-[#91724B]" : "text-[#163422]"}`}>
                        {s.title}
                      </h3>
                      <p className="font-hanken text-xs text-[#6E756F] leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </Container>
    </div>
  )
}

export default ProductPage