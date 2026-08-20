import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import FeaturedSection from "../../components/FeaturedSection"
import Container from "../../components/common/Container"
import Shipping from "/src/assets/image/icons/brown-shipping.svg"
import { useCart } from "../../context/CartContext"
import Button from "../../components/common/Button"
import { supabase } from "../../lib/supabase"
import { Tag, Sparkles, X, Truck, Check } from "lucide-react"
import { toast } from "sonner"
import { useStoreSettings } from "../../context/StoreSettingsContext"
import beginnerTarantula from "../../assets/image/beginner-tarantula-care.webp"

const toSlug = (str) => (str ? str.toLowerCase().replace(/\s+/g, "-") : "")

const deliveryAvailability = {
    karnataka: { available: true, eta: "2-4 days", fee: "Free" },
    tamilnadu: { available: true, eta: "3-5 days", fee: "Free" },
    maharashtra: { available: true, eta: "3-6 days", fee: "₹249" },
    delhi: { available: true, eta: "2-3 days", fee: "Free" },
    telangana: { available: true, eta: "4-6 days", fee: "₹199" },
    kerala: { available: false, eta: "Unavailable", fee: "Not available" },
    westbengal: { available: false, eta: "Unavailable", fee: "Not available" },
    assam: { available: false, eta: "Unavailable", fee: "Not available" },
}

const Cart = () => {
    const navigate = useNavigate()
    const { cartItems, updateQuantity, removeItem } = useCart()
    const { settings } = useStoreSettings()

    const [deliveryState, setDeliveryState] = useState("")
    const [appliedCoupon, setAppliedCoupon] = useState(null)
    const [autoCouponNotice, setAutoCouponNotice] = useState("")
    const [customCode, setCustomCode] = useState("")
    const [shippingMethod, setShippingMethod] = useState('standard') // 'standard' | 'express'

    const standardShippingFee = parseFloat(settings.standardShippingFee) || 150
    const expressShippingFee = parseFloat(settings.expressShippingFee) || 250
    const freeShippingThreshold = parseFloat(settings.freeShippingThreshold) || 5000

    const subtotal = cartItems.reduce((acc, item) => {
        const itemPrice = item.products?.price || item.products?.discounted_price || 0
        return acc + (item.quantity * itemPrice)
    }, 0)

    const totalMrp = cartItems.reduce((acc, item) => {
        const origPrice = item.products?.original_price || item.products?.price || 0
        return acc + (item.quantity * origPrice)
    }, 0)

    const isFreeShipping = subtotal >= freeShippingThreshold
    
    // Compute exact shipping cost based on selected method & threshold
    let shippingFee = 0
    if (subtotal > 0) {
        if (isFreeShipping) {
            shippingFee = 0
        } else if (shippingMethod === 'express') {
            shippingFee = expressShippingFee
        } else {
            shippingFee = standardShippingFee
        }
    }

    // Automatically check and apply eligible coupons from Supabase or Local Storage
    useEffect(() => {
        if (subtotal > 0) {
            checkAndAutoApplyCoupon(subtotal)
        } else {
            setAppliedCoupon(null)
            setAutoCouponNotice("")
        }
    }, [subtotal])

    const checkAndAutoApplyCoupon = async (cartTotal) => {
        if (appliedCoupon) {
            const minOrder = parseFloat(appliedCoupon.minimum_order || appliedCoupon.minimumOrderValue || 0)
            if (cartTotal < minOrder) {
                const code = appliedCoupon.code
                setAppliedCoupon(null)
                setAutoCouponNotice("")
                toast.error(`Ineligible for coupon "${code}". Minimum order of ₹ ${minOrder.toLocaleString('en-IN')} required.`)
                return
            } else {
                const savings = calculateDiscount(appliedCoupon, cartTotal)
                setAppliedCoupon(prev => ({ ...prev, savings }))
                return
            }
        }

        try {
            let availableCoupons = []
            
            try {
                const saved = localStorage.getItem('tocos_coupons')
                if (saved) availableCoupons = JSON.parse(saved)
            } catch (e) {}

            try {
                const { data } = await supabase.from('coupons').select('*').eq('status', 'ACTIVE')
                if (data && data.length > 0) {
                    availableCoupons = [...data, ...availableCoupons]
                }
            } catch (e) {}

            if (!availableCoupons.length) {
                availableCoupons = [
                    { id: 1, code: 'WEB_ONLY_30', discount_type: 'Percentage (%)', discount_value: 30, minimum_order: 1000, max_usage: 1000, usage_count: 12 }
                ]
            }

            // Remove WELCOME10 if present
            availableCoupons = availableCoupons.filter(c => String(c.code).toUpperCase() !== 'WELCOME10')

            const eligible = availableCoupons.filter(c => {
                const minOrder = parseFloat(c.minimum_order || c.minimumOrderValue || 0)
                const maxUses = parseInt(c.max_usage || c.maxUsage || 9999)
                const usedUses = parseInt(c.usage_count || c.usageCount || 0)
                return cartTotal >= minOrder && usedUses < maxUses
            })

            if (eligible.length > 0) {
                let best = eligible[0]
                let bestSavings = calculateDiscount(best, cartTotal)

                for (let i = 1; i < eligible.length; i++) {
                    const savings = calculateDiscount(eligible[i], cartTotal)
                    if (savings > bestSavings) {
                        best = eligible[i]
                        bestSavings = savings
                    }
                }

                if (bestSavings > 0) {
                    setAppliedCoupon({
                        ...best,
                        savings: bestSavings
                    })
                    setAutoCouponNotice(`Best Coupon "${best.code}" Automatically Applied!`)
                }
            }
        } catch (e) {
            console.warn('Auto coupon check notice:', e)
        }
    }

    const calculateDiscount = (coupon, total) => {
        if (!coupon) return 0
        const val = parseFloat(coupon.discount_value || coupon.discountValue || 0)
        const type = coupon.discount_type || coupon.discountType || 'Percentage (%)'

        if (type === 'Fixed Amount (₹)' || type === 'Fixed Amount' || type === 'Fixed') {
            return Math.min(val, total)
        } else {
            return Math.round((total * val) / 100)
        }
    }

    const handleApplyCustomCode = async () => {
        if (!customCode.trim()) return
        const inputCode = customCode.trim().toUpperCase()

        if (inputCode === 'WELCOME10') {
            toast.error('Coupon "WELCOME10" is expired or no longer available.')
            return
        }

        let foundCoupon = null

        try {
            const saved = localStorage.getItem('tocos_coupons')
            if (saved) {
                const list = JSON.parse(saved)
                foundCoupon = list.find(c => c.code.toUpperCase() === inputCode)
            }
        } catch (e) {}

        if (!foundCoupon) {
            try {
                const { data } = await supabase.from('coupons').select('*').ilike('code', inputCode).maybeSingle()
                if (data) foundCoupon = data
            } catch (e) {}
        }

        if (!foundCoupon) {
            if (inputCode === 'WEB_ONLY_30') {
                foundCoupon = { code: 'WEB_ONLY_30', discount_type: 'Percentage (%)', discount_value: 30, minimum_order: 1000 }
            }
        }

        if (!foundCoupon) {
            toast.error(`Invalid promo code "${inputCode}". Please check code and try again.`)
            return
        }

        const minOrder = parseFloat(foundCoupon.minimum_order || foundCoupon.minimumOrderValue || 0)

        if (subtotal < minOrder) {
            setAppliedCoupon(null)
            setAutoCouponNotice("")
            toast.error(`Ineligible for coupon "${foundCoupon.code}". Minimum order of ₹ ${minOrder.toLocaleString('en-IN')} required.`)
            return
        }

        const savings = calculateDiscount(foundCoupon, subtotal)
        if (savings <= 0) {
            setAppliedCoupon(null)
            toast.error(`Coupon "${foundCoupon.code}" offers ₹ 0 discount on this cart.`)
            return
        }

        setAppliedCoupon({
            ...foundCoupon,
            code: foundCoupon.code.toUpperCase(),
            savings
        })
        setAutoCouponNotice(`Coupon "${foundCoupon.code.toUpperCase()}" Applied!`)
        toast.success(`Coupon ${foundCoupon.code.toUpperCase()} applied! Saved ₹ ${savings.toLocaleString('en-IN')}`)
        setCustomCode("")
    }

    const discountAmount = appliedCoupon ? appliedCoupon.savings : 0
    const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee)

    const normalizedState = deliveryState.trim().toLowerCase()
    const stateStatus = normalizedState ? deliveryAvailability[normalizedState] : null

    const priceDetails = [
        { detail: "Total MRP", price: `₹ ${totalMrp.toLocaleString('en-IN')}` },
        { detail: "Item Price Subtotal", price: `₹ ${subtotal.toLocaleString('en-IN')}` },
        {
            detail: shippingMethod === 'express' ? 'Climate Express Shipping' : 'Standard Shipping', 
            price: isFreeShipping ? 'FREE' : `+ ₹ ${shippingFee.toLocaleString('en-IN')}`,
            isFree: isFreeShipping
        },
        ...(appliedCoupon ? [{ detail: `Coupon (${appliedCoupon.code})`, price: `- ₹ ${discountAmount.toLocaleString('en-IN')}`, isDiscount: true }] : [])
    ]

  return (
    <div className="py-8 pb-16 font-hanken">
    <Container>

        {/* Free Shipping Progress & Method Selector */}
        <div className="bg-[#FAF8F5] border border-[#E5E2DC] p-4 rounded-md mb-5 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div className="flex items-start sm:items-center gap-2.5">
                    <Truck className="w-4 h-4 text-[#163422] shrink-0 mt-0.5 sm:mt-0" />
                    {isFreeShipping ? (
                        <p className="text-xs sm:text-sm font-bold text-[#163422]">
                            🎉 Congratulations! You unlocked Free Shipping on both options!
                        </p>
                    ) : (
                        <p className="text-xs sm:text-sm text-[#525B54]">
                            Add <strong className="text-[#163422]">₹ {(freeShippingThreshold - subtotal).toLocaleString('en-IN')}</strong> more to unlock <strong>FREE Shipping</strong> (Threshold: ₹ {freeShippingThreshold.toLocaleString('en-IN')})
                        </p>
                    )}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#EAF5ED] text-[#163422] px-2.5 py-1 rounded shrink-0 whitespace-nowrap">
                    {isFreeShipping ? 'FREE SHIPPING UNLOCKED' : `FREE THRESHOLD: ₹${freeShippingThreshold.toLocaleString()}`}
                </span>
            </div>

            {/* Interactive Shipping Method Selection */}
            <div className="pt-3 border-t border-[#E5E2DC] grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option 1: Standard Shipping (₹150) */}
                <button
                    type="button"
                    onClick={() => setShippingMethod('standard')}
                    className={`p-3 rounded-md text-left transition cursor-pointer border flex items-center justify-between ${
                        shippingMethod === 'standard'
                            ? 'border-2 border-[#163422] bg-white shadow-xs'
                            : 'border-[#E5E2DC] bg-[#FAF8F5] hover:bg-white'
                    }`}
                >
                    <div>
                        <p className="font-bold text-xs text-[#163422]">Standard Shipping</p>
                        <p className="text-[11px] text-[#6E756F]">3-5 Business Days • Standard Packaging</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#163422]">
                            {isFreeShipping ? 'FREE' : `+ ₹${standardShippingFee}`}
                        </span>
                        {shippingMethod === 'standard' && <Check className="w-4 h-4 text-[#163422]" />}
                    </div>
                </button>

                {/* Option 2: Express Climate Shipping (₹250) */}
                <button
                    type="button"
                    onClick={() => setShippingMethod('express')}
                    className={`p-3 rounded-md text-left transition cursor-pointer border flex items-center justify-between ${
                        shippingMethod === 'express'
                            ? 'border-2 border-[#163422] bg-white shadow-xs'
                            : 'border-[#E5E2DC] bg-[#FAF8F5] hover:bg-white'
                    }`}
                >
                    <div>
                        <p className="font-bold text-xs text-[#163422]">Express Climate Shipping</p>
                        <p className="text-[11px] text-[#6E756F]">72-Hr Heat Pack • Live Arrival Guarantee</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#163422]">
                            {isFreeShipping ? 'FREE' : `+ ₹${expressShippingFee}`}
                        </span>
                        {shippingMethod === 'express' && <Check className="w-4 h-4 text-[#163422]" />}
                    </div>
                </button>
            </div>
        </div>

        <div className="bg-white border border-[#C2C8C0] p-4 sm:p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-row items-center gap-3 sm:gap-6">
                    <img src={Shipping} className="w-5 object-contain shrink-0" alt="Shipping" />
                    <p className="font-hanken font-semibold text-xs sm:text-sm text-[#1C1B1B]">
                        Check Delivery Availability
                    </p>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
                    <input 
                        type="text"
                        value={deliveryState}
                        onChange={(e) => setDeliveryState(e.target.value)}
                        placeholder="Enter State"
                        className="bg-[#F0EDED] py-2 px-4 font-sand font-semibold text-[#6B7280] text-xs sm:text-sm focus:outline-none rounded-sm w-full sm:w-45"
                    />

                    {deliveryState.trim() && (
                        <div className="text-right">
                            {stateStatus ? (
                                <p className={`font-hanken text-xs ${stateStatus.available ? "text-[#163422]" : "text-[#8B3E32]"}`}>
                                    {stateStatus.available ? `Available in ${deliveryState.trim()}` : `Not delivering to ${deliveryState.trim()}`} 
                                    <span className="font-semibold ml-1">• {stateStatus.eta}</span>
                                </p>
                            ) : (
                                <p className="font-hanken text-xs text-[#6B7280]">
                                    Try a supported state like Karnataka, Tamil Nadu, Maharashtra, Delhi or Telangana
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Auto Coupon Banner */}
        {appliedCoupon && (
            <div className="bg-[#EAF5ED] border border-[#C6E6CE] mt-4 p-3.5 sm:p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-hanken">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#163422] text-white flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="font-bold text-xs text-[#163422]">
                            {autoCouponNotice || `Coupon "${appliedCoupon.code}" Active`}
                        </p>
                        <p className="text-[11px] text-[#525B54] mt-0.5">
                            Saved <strong className="text-[#163422]">₹ {discountAmount.toLocaleString('en-IN')}</strong> on this order based on purchase conditions. (Limit: 1 coupon per order)
                        </p>
                    </div>
                </div>

                <button 
                    onClick={() => {
                        setAppliedCoupon(null)
                        setAutoCouponNotice("")
                        toast.info("Coupon removed")
                    }}
                    className="text-xs font-bold text-[#8B3E32] hover:underline cursor-pointer flex items-center gap-1 shrink-0"
                >
                    <X className="w-3.5 h-3.5" />
                    <span>Remove Coupon</span>
                </button>
            </div>
        )}

        <div className="flex flex-col md:flex-row gap-6 mt-6 mb-12 items-start">

            <div className="flex flex-col gap-4 w-full md:w-3/5 lg:w-2/3">
                {cartItems.length === 0 ? (
                    <div className="bg-[#FAF8F5] border border-dashed border-[#C2C8C0] p-8 sm:p-10 rounded-md text-center flex flex-col items-center justify-center gap-2">
                        <p className="font-libre text-xl font-bold text-[#163422]">Your Cart is Currently Empty</p>
                        <p className="font-hanken text-xs text-[#6E756F]">Explore our collection below to add your favorite arachnids & equipment.</p>
                    </div>
                ) : (
                    cartItems.map((i) => (
                    <div 
                        key={i.id}
                        className="bg-[#FFFFFF] border border-[#C2C8C0] p-3.5 sm:p-4 rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-2xs"
                    >
                        <div className="flex flex-row items-start gap-3 sm:gap-4 w-full sm:w-auto min-w-0 flex-1">
                            <Link 
                                to={`/${toSlug(i.products?.category || 'tarantulas')}/${toSlug(i.products?.sub_category || 'terrestrial')}/${i.products?.slug}`}
                                className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 hover:opacity-90 transition bg-[#FAF8F5] rounded-xs border border-[#E5E2DC] overflow-hidden"
                            >
                                <img 
                                    src={i.products?.thumbnail || i.products?.image} 
                                    alt={i.products?.name} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = beginnerTarantula
                                    }}
                                />
                            </Link>

                            <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                                <Link 
                                    to={`/${toSlug(i.products?.category || 'tarantulas')}/${toSlug(i.products?.sub_category || 'terrestrial')}/${i.products?.slug}`}
                                    className="hover:underline min-w-0"
                                >
                                    <h1 className="font-libre text-[#1C1B1B] text-sm sm:text-base font-bold leading-snug">
                                        {i.products?.name}
                                    </h1>
                                </Link>

                                {(i.products?.common_name || i.products?.scientific_name) && (
                                    <p className="font-hanken text-xs text-[#525B54] italic truncate">
                                        {i.products?.common_name || i.products?.scientific_name}
                                    </p>
                                )}

                                <p className="font-hanken text-[11px] text-[#6E756F] mt-0.5">
                                    {i.products?.category} • {i.products?.sub_category || "Standard"}
                                </p>

                                {/* Dedicated Mobile Price Row */}
                                <div className="flex items-center gap-2 mt-1 sm:hidden">
                                    <span className="font-libre text-sm font-bold text-[#163422] whitespace-nowrap">
                                        ₹ {(i.quantity * (i.products?.price || 0)).toLocaleString('en-IN')}
                                    </span>
                                    {i.products?.original_price && i.products.original_price > i.products.price && (
                                        <span className="font-hanken line-through text-[#785832] text-[11px] whitespace-nowrap">
                                            ₹ {(i.quantity * i.products.original_price).toLocaleString('en-IN')}
                                        </span>
                                    )}
                                </div>

                                <div className="font-hanken text-[#1C1B1B] text-xs sm:text-sm flex flex-wrap items-center gap-2 mt-2">
                                    <span className="font-bold">x{i.quantity}</span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => updateQuantity(i.id, i.quantity - 1)}
                                            className="w-6.5 h-6.5 sm:w-7 sm:h-7 border border-[#C2C8C0] bg-[#FAF8F5] text-[#1C1B1B] font-bold text-xs sm:text-sm flex items-center justify-center rounded-md hover:bg-[#E5E2DC] transition cursor-pointer shrink-0"
                                            title="Decrease Quantity"
                                        >
                                            -
                                        </button>
                                        <button
                                            onClick={() => updateQuantity(i.id, i.quantity + 1)}
                                            className="w-6.5 h-6.5 sm:w-7 sm:h-7 border border-[#C2C8C0] bg-[#FAF8F5] text-[#1C1B1B] font-bold text-xs sm:text-sm flex items-center justify-center rounded-md hover:bg-[#E5E2DC] transition cursor-pointer shrink-0"
                                            title="Increase Quantity"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <span className="text-[#C2C8C0] text-xs">|</span>
                                    <button
                                        onClick={() => removeItem(i.id)}
                                        className="font-hanken text-xs font-semibold text-[#8B3E32] hover:underline cursor-pointer"
                                        title="Remove Item"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Desktop Price View */}
                        <div className="hidden sm:flex flex-col items-end shrink-0 self-center">
                            <p className="font-libre text-[#163422] text-sm sm:text-base font-bold whitespace-nowrap">
                                ₹ {(i.quantity * (i.products?.price || 0)).toLocaleString('en-IN')}
                            </p>
                            {i.products?.original_price && i.products.original_price > i.products.price && (
                                <p className="font-hanken line-through text-[#785832] text-xs mt-0.5 whitespace-nowrap">
                                    ₹ {(i.quantity * i.products.original_price).toLocaleString('en-IN')}
                                </p>
                            )}
                        </div>
                    </div>
                    ))
                )}
            </div>

            {/* Sidebar Summary */}
            <div className="bg-[#FFFFFF] border border-[#C2C8C0] p-4 sm:p-5 w-full md:w-2/5 lg:w-1/3 flex flex-col gap-3.5 font-hanken rounded-md shadow-2xs">

                <h2 className="text-xs font-bold text-[#424843] uppercase tracking-wider">
                    Price Details
                </h2>

                {priceDetails.map((d, idx) => (
                    <div key={idx} className="flex flex-row items-start justify-between gap-2">
                        <p className={`min-w-0 flex-1 text-xs sm:text-sm leading-snug ${d.isDiscount || d.isFree ? 'font-bold text-[#163422]' : 'text-[#424843]'}`}>
                            {d.detail}
                        </p>
                        <p className={`text-xs sm:text-sm font-bold shrink-0 whitespace-nowrap ${d.isDiscount || d.isFree ? 'text-[#163422]' : 'text-[#1C1B1B]'}`}>
                            {d.price}
                        </p>
                    </div>
                ))}

                {/* Promo Code Input Box */}
                <div className="pt-3 border-t border-[#E5E2DC]">
                    <p className="text-[10px] font-bold text-[#6E756F] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                            <Tag className="w-3 h-3 text-[#163422]" />
                            <span>HAVE A PROMO CODE?</span>
                        </span>
                        <span className="text-[9px] text-[#525B54]">1 coupon per order</span>
                    </p>
                    <div className="flex gap-2">
                        <input 
                            type="text"
                            value={customCode}
                            onChange={(e) => setCustomCode(e.target.value)}
                            placeholder="Promo Code (e.g. WEB_ONLY_30)"
                            className="bg-[#FAF8F5] border border-[#E5E2DC] px-2.5 py-2 text-xs uppercase font-bold text-[#1C1B1B] rounded-md focus:outline-none focus:border-[#163422] min-w-0 flex-1 truncate"
                        />
                        <button
                            onClick={handleApplyCustomCode}
                            className="px-3.5 py-2 bg-[#163422] hover:bg-[#0D2316] text-white font-bold text-xs rounded-md transition cursor-pointer shrink-0"
                        >
                            Apply
                        </button>
                    </div>
                </div>

                <div className="border border-[#C2C8C0]"/>

                <div className="flex flex-row items-center justify-between gap-2">
                    <p className="font-libre text-sm sm:text-base font-bold text-[#1C1B1B] whitespace-nowrap">
                        Total Amount
                    </p>
                    <p className="font-libre text-lg sm:text-xl font-bold text-[#163422] whitespace-nowrap">
                        ₹ {finalTotal.toLocaleString('en-IN')}
                    </p>
                </div>

                <Button
                    variant="brandb"
                    className="py-3.5 w-full uppercase tracking-wider font-bold text-xs cursor-pointer"
                    onClick={() => navigate('/checkout', { 
                        state: { 
                            subtotal, 
                            shippingFee, 
                            discountAmount, 
                            finalTotal, 
                            totalAmount: finalTotal, 
                            appliedCoupon, 
                            shippingMethod 
                        } 
                    })}
                >
                    Place Order - ₹{finalTotal.toLocaleString('en-IN')}
                </Button>

                <p className="text-xs text-[#6E756F] text-center leading-relaxed">
                    Once you place your order, you will receive an email confirmation with climate-controlled shipping details.
                </p>

            </div>

        </div>

    </Container>

    {/* Collectors Choice Section with generous spacing */}
    <div className="mt-12 pt-8 border-t border-[#E5E2DC] bg-[#FAF8F5] py-10">
        <FeaturedSection
            type="Collectors Choice"
            title="Collectors Choice: Best Sellers"
            description="Docile, hardy, and stunningly beautiful starter species." 
        />
    </div>

    </div>
  )
}

export default Cart