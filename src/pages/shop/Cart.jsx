import { useState, useEffect, useRef } from "react"
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
    tamilnadu: { name: "Tamil Nadu", available: true, eta: "2-3 Business Days", standardFee: 150, expressFee: 250 },
    karnataka: { name: "Karnataka", available: true, eta: "2-4 Business Days", standardFee: 150, expressFee: 250 },
    kerala: { name: "Kerala", available: true, eta: "3-5 Business Days", standardFee: 150, expressFee: 250 },
    andhrapradesh: { name: "Andhra Pradesh", available: true, eta: "3-5 Business Days", standardFee: 150, expressFee: 250 },
    telangana: { name: "Telangana", available: true, eta: "3-5 Business Days", standardFee: 150, expressFee: 250 },
}

const getMinOrder = (coupon) => {
    if (!coupon) return 0
    const val = coupon.minimum_order ?? coupon.minimumOrderValue ?? coupon.min_order_amount ?? coupon.minOrder ?? coupon.minimumOrder ?? 0
    const parsed = parseFloat(val)
    return isNaN(parsed) ? 0 : parsed
}

const Cart = () => {
    const navigate = useNavigate()
    const { cartItems, updateQuantity, removeItem } = useCart()
    const { settings } = useStoreSettings()

    const [deliveryState, setDeliveryState] = useState("Tamil Nadu")
    const [appliedCoupon, setAppliedCoupon] = useState(null)
    const [autoCouponNotice, setAutoCouponNotice] = useState("")
    const [customCode, setCustomCode] = useState("")
    const [shippingMethod, setShippingMethod] = useState('standard') // 'standard' | 'express'

    const appliedCouponRef = useRef(appliedCoupon)
    useEffect(() => {
        appliedCouponRef.current = appliedCoupon
    }, [appliedCoupon])

    const freeShippingThreshold = parseFloat(settings.freeShippingThreshold) || 5000

    const subtotal = cartItems.reduce((acc, item) => {
        const itemPrice = item.products?.price || item.products?.discounted_price || 0
        return acc + (item.quantity * itemPrice)
    }, 0)

    const totalMrp = cartItems.reduce((acc, item) => {
        const origPrice = item.products?.original_price || item.products?.price || 0
        return acc + (item.quantity * origPrice)
    }, 0)

    const isFreeShipping = subtotal > 0 && subtotal >= freeShippingThreshold
    
    // State lookup to determine state-specific standard & express shipping rates
    const normalizedState = (deliveryState || "Tamil Nadu").trim().toLowerCase().replace(/[^a-z]/g, '')
    const stateStatus = normalizedState ? deliveryAvailability[normalizedState] : null

    const currentStateName = stateStatus ? stateStatus.name : (deliveryState.trim() || "Tamil Nadu")

    // Read custom state rates configured in admin settings if present
    const configuredStateRate = settings?.stateShippingRates?.[currentStateName] || settings?.stateShippingRates?.[deliveryState]
    const customStandardFee = (configuredStateRate && configuredStateRate.standard !== undefined) ? Number(configuredStateRate.standard) : null
    const customExpressFee = (configuredStateRate && configuredStateRate.express !== undefined) ? Number(configuredStateRate.express) : null

    const currentStandardFee = customStandardFee !== null ? customStandardFee : (stateStatus ? stateStatus.standardFee : Number(settings?.standardShippingFee || 150))
    const currentExpressFee = customExpressFee !== null ? customExpressFee : (stateStatus ? stateStatus.expressFee : Number(settings?.expressShippingFee || 250))
    const currentStandardEta = stateStatus ? stateStatus.eta : "2-3 Business Days"

    // Compute exact shipping cost based on selected method & state & threshold
    const baseShippingFee = shippingMethod === 'express' ? currentExpressFee : currentStandardFee
    const shippingFee = isFreeShipping ? 0 : baseShippingFee

    // Automatically check and apply eligible coupons from Supabase or Local Storage on every subtotal change
    useEffect(() => {
        checkAndAutoApplyCoupon(subtotal)
    }, [subtotal])

    const checkAndAutoApplyCoupon = async (cartTotal) => {
        if (cartTotal <= 0) {
            setAppliedCoupon(null)
            setAutoCouponNotice("")
            return
        }

        let currentActive = appliedCouponRef.current

        if (currentActive) {
            const minOrder = getMinOrder(currentActive)
            if (cartTotal < minOrder) {
                const code = currentActive.code
                setAppliedCoupon(null)
                setAutoCouponNotice("")
                toast.error(`Coupon "${code}" removed. Minimum order of ₹ ${minOrder.toLocaleString('en-IN')} required.`)
                currentActive = null
            } else {
                const savings = calculateDiscount(currentActive, cartTotal)
                setAppliedCoupon(prev => prev ? ({ ...prev, savings }) : null)
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
                const minOrder = getMinOrder(c)
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
                } else {
                    setAppliedCoupon(null)
                    setAutoCouponNotice("")
                }
            } else {
                setAppliedCoupon(null)
                setAutoCouponNotice("")
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

        const minOrder = getMinOrder(foundCoupon)

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
    const finalTotal = subtotal > 0 ? Math.max(0, subtotal - discountAmount + shippingFee) : 0

    const priceDetails = [
        { detail: "Total MRP", price: `₹ ${totalMrp.toLocaleString('en-IN')}` },
        { detail: "Item Price Subtotal", price: `₹ ${subtotal.toLocaleString('en-IN')}` },
        {
            detail: shippingMethod === 'express' 
                ? 'Express Climate Shipping' 
                : 'Standard Shipping', 
            price: isFreeShipping ? 'FREE' : `+ ₹ ${shippingFee.toLocaleString('en-IN')}`,
            isFree: isFreeShipping
        },
        ...(appliedCoupon ? [{ detail: `Coupon (${appliedCoupon.code})`, price: `- ₹ ${discountAmount.toLocaleString('en-IN')}`, isDiscount: true }] : [])
    ]

  return (
    <div className="py-8 pb-16 font-hanken">
    <Container>

        {/* Free Shipping Progress Banner */}
        <div className="bg-[#FAF8F5] border border-[#E5E2DC] p-4 rounded-md mb-5 shadow-2xs">
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
        </div>

        {/* Check Delivery Availability Section & Select Shipping Method */}
        <div className="bg-white border border-[#C2C8C0] p-4 sm:p-5 shadow-2xs rounded-md space-y-4 font-hanken mb-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-row items-center gap-3 sm:gap-4">
                    <img src={Shipping} className="w-5 object-contain shrink-0" alt="Shipping" />
                    <div>
                        <p className="font-semibold text-xs sm:text-sm text-[#1C1B1B]">
                            Select Delivery State & Calculate Shipping Rates
                        </p>
                        <p className="text-[11px] text-[#6E756F]">
                            Standard & Express shipping costs are determined automatically by state
                        </p>
                    </div>
                </div>

                {deliveryState.trim() && (
                    <div className="text-left sm:text-right">
                        <p className="text-xs font-bold text-[#163422]">
                            ✓ Delivering to {currentStateName || deliveryState.trim()} 
                        </p>
                        <p className="text-[11px] text-[#525B54]">
                            Standard: ₹{currentStandardFee} • Express: ₹{currentExpressFee}
                        </p>
                    </div>
                )}
            </div>

            {/* Quick Select States Pills */}
            <div className="pt-3 border-t border-[#E5E2DC] space-y-2">
                <p className="text-[10px] font-bold text-[#6E756F] uppercase tracking-wider">
                    Quick Select States:
                </p>
                <div className="flex flex-wrap items-center gap-2">
                    {['Tamil Nadu', 'Karnataka', 'Kerala', 'Andhra Pradesh', 'Telangana'].map((stName) => {
                        const configured = settings?.stateShippingRates?.[stName]
                        const normKey = stName.toLowerCase().replace(/[^a-z]/g, '')
                        const statusObj = deliveryAvailability[normKey]
                        const std = configured?.standard !== undefined ? Number(configured.standard) : (statusObj ? statusObj.standardFee : Number(settings?.standardShippingFee || 150))
                        const exp = configured?.express !== undefined ? Number(configured.express) : (statusObj ? statusObj.expressFee : Number(settings?.expressShippingFee || 250))
                        const isSelected = deliveryState.trim().toLowerCase() === stName.toLowerCase()

                        return (
                            <button
                                key={stName}
                                type="button"
                                onClick={() => setDeliveryState(stName)}
                                className={`text-xs px-3 py-1.5 rounded-full border transition cursor-pointer font-bold flex items-center gap-1.5 ${
                                    isSelected
                                        ? 'bg-[#163422] text-white border-[#163422] shadow-2xs'
                                        : 'bg-[#FAF8F5] text-[#163422] border-[#C2C8C0] hover:border-[#163422] hover:bg-white'
                                }`}
                            >
                                <span>{stName}</span>
                                <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-[#6E756F]'}`}>
                                    (Std ₹{std} / Exp ₹{exp})
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Dropdown Menu Below */}
            <div className="pt-2 border-t border-[#E5E2DC]">
                <label className="block text-[10px] font-bold text-[#6E756F] uppercase tracking-wider mb-1.5">
                    Or Select State from All-India Dropdown:
                </label>
                <select
                    value={deliveryState}
                    onChange={(e) => setDeliveryState(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#C2C8C0] py-2.5 px-3.5 font-hanken font-bold text-[#1C1B1B] text-xs sm:text-sm focus:outline-none focus:border-[#163422] rounded-md cursor-pointer shadow-2xs"
                >
                    <option value="">-- Select Your Delivery State --</option>
                    {[
                        "Tamil Nadu", "Kerala", "Karnataka", "Andhra Pradesh", "Telangana",
                        "Maharashtra", "Delhi", "Gujarat", "West Bengal", "Puducherry", "Goa",
                        "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Haryana",
                        "Himachal Pradesh", "Jharkhand", "Madhya Pradesh", "Manipur", "Meghalaya",
                        "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
                        "Tripura", "Uttar Pradesh", "Uttarakhand", "Andaman and Nicobar Islands",
                        "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Jammu and Kashmir",
                        "Ladakh", "Lakshadweep"
                    ].map((stName) => {
                        const configured = settings?.stateShippingRates?.[stName]
                        const normKey = stName.toLowerCase().replace(/[^a-z]/g, '')
                        const statusObj = deliveryAvailability[normKey]
                        const std = configured?.standard !== undefined ? Number(configured.standard) : (statusObj ? statusObj.standardFee : Number(settings?.standardShippingFee || 150))
                        const exp = configured?.express !== undefined ? Number(configured.express) : (statusObj ? statusObj.expressFee : Number(settings?.expressShippingFee || 250))

                        return (
                            <option key={stName} value={stName}>
                                {stName} — Standard: ₹{std} | Express: ₹{exp}
                            </option>
                        )
                    })}
                </select>
            </div>

            {/* Interactive Shipping Method Selection (Standard & Express BELOW Dropdown) */}
            <div className="pt-3 border-t border-[#E5E2DC]">
                <label className="block text-[10px] font-bold text-[#6E756F] uppercase tracking-wider mb-2">
                    Select Shipping Method:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Option 1: Standard Shipping */}
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
                            <p className="font-bold text-xs text-[#163422]">
                                Standard Shipping
                            </p>
                            <p className="text-[11px] text-[#6E756F]">
                                {currentStateName ? `${currentStateName} • ` : ''}{currentStandardEta} • Standard Packaging
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-[#163422]">
                                {isFreeShipping ? 'FREE' : `+ ₹${currentStandardFee}`}
                            </span>
                            {shippingMethod === 'standard' && <Check className="w-4 h-4 text-[#163422]" />}
                        </div>
                    </button>

                    {/* Option 2: Express Climate Shipping */}
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
                            <p className="font-bold text-xs text-[#163422]">
                                Express Climate Shipping
                            </p>
                            <p className="text-[11px] text-[#6E756F]">
                                {currentStateName ? `${currentStateName} • ` : ''}72-Hr Heat Pack • Live Arrival Guarantee
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-[#163422]">
                                {isFreeShipping ? 'FREE' : `+ ₹${currentExpressFee}`}
                            </span>
                            {shippingMethod === 'express' && <Check className="w-4 h-4 text-[#163422]" />}
                        </div>
                    </button>
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
                    disabled={cartItems.length === 0}
                    className={`py-3.5 w-full uppercase tracking-wider font-bold text-xs ${
                        cartItems.length === 0 
                            ? 'opacity-60 cursor-not-allowed bg-gray-400 hover:bg-gray-400' 
                            : 'cursor-pointer'
                    }`}
                    onClick={() => {
                        if (cartItems.length === 0) {
                            toast.error("Your cart is currently empty. Please add items before placing an order.")
                            return
                        }
                        navigate('/checkout', { 
                            state: { 
                                subtotal, 
                                shippingFee, 
                                discountAmount, 
                                finalTotal, 
                                totalAmount: finalTotal, 
                                appliedCoupon, 
                                shippingMethod,
                                deliveryState: currentStateName
                            } 
                        })
                    }}
                >
                    {cartItems.length === 0 ? 'Cart is Empty' : `Place Order - ₹${finalTotal.toLocaleString('en-IN')}`}
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