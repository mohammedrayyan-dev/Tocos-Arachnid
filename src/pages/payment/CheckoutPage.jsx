import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import Container from "../../components/common/Container"
import { useAuth } from "../../context/AuthContext"
import { useCart } from "../../context/CartContext"
import { useStoreSettings } from "../../context/StoreSettingsContext"
import { toast } from "sonner"
import { supabase } from "../../lib/supabase"
import { MapPin, CheckCircle2, Truck, Check } from "lucide-react"

const parsePriceNumber = (val) => {
  if (val === undefined || val === null) return 0
  if (typeof val === 'number') return isNaN(val) ? 0 : val
  const str = String(val).replace(/,/g, '').replace(/[^\d.]/g, '')
  const num = parseFloat(str)
  return isNaN(num) ? 0 : num
}

const CheckoutPage = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { user } = useAuth()
    const { totalAmount, cartItems } = useCart()
    const { settings } = useStoreSettings()

    const [savedAddresses, setSavedAddresses] = useState([])
    const [selectedAddrId, setSelectedAddrId] = useState(null)
    const [shippingMethod, setShippingMethod] = useState(location.state?.shippingMethod || 'standard')

    const standardShippingFee = parseFloat(settings.standardShippingFee) || 150
    const expressShippingFee = parseFloat(settings.expressShippingFee) || 250
    const freeShippingThreshold = parseFloat(settings.freeShippingThreshold) || 5000

    const appliedCoupon = location.state?.appliedCoupon || null
    const baseSubtotal = location.state?.subtotal ?? (cartItems?.reduce((sum, item) => {
        const itemPrice = parsePriceNumber(item.products?.discounted_price || item.products?.price || item.price)
        return sum + (itemPrice * (item.quantity || 1))
    }, 0) || 0)

    const isFreeShipping = baseSubtotal >= freeShippingThreshold
    const shippingFee = location.state?.shippingFee ?? (isFreeShipping ? 0 : (shippingMethod === 'express' ? expressShippingFee : standardShippingFee))
    const discountAmount = location.state?.discountAmount ?? 0

    const finalNumericTotal = location.state?.finalTotal ?? location.state?.totalAmount ?? Math.max(0, baseSubtotal + shippingFee - discountAmount)
    const formattedTotal = `₹${finalNumericTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

    const [shippingDetails, setShippingDetails] = useState({
        shipping_name: "",
        phone_number: "",
        shipping_address: "",
        area_locality: "",
        postal_code: "",
        city_state: "",
        shipping_landmark: ""
    })

    // Pre-populate fields automatically from profile / saved addresses
    useEffect(() => {
        const loadProfileAndAddresses = async () => {
            const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || (user?.email ? user.email.split('@')[0] : "")
            let phone = user?.user_metadata?.phone || user?.phone || ""
            
            let loadedAddresses = []
            if (user?.id) {
                try {
                    const raw = localStorage.getItem(`user_addresses_${user.id}`)
                    if (raw) loadedAddresses = JSON.parse(raw)
                } catch (e) {}

                if (loadedAddresses.length === 0 && user?.user_metadata?.addresses && Array.isArray(user.user_metadata.addresses)) {
                    loadedAddresses = user.user_metadata.addresses
                }
            }

            setSavedAddresses(loadedAddresses)

            // Select default or first address if available
            const defaultAddr = loadedAddresses.find(a => a.isDefault) || loadedAddresses[0]

            if (defaultAddr) {
                setSelectedAddrId(defaultAddr.id)
                setShippingDetails({
                    shipping_name: fullName,
                    phone_number: phone,
                    shipping_address: defaultAddr.street || "",
                    area_locality: defaultAddr.area || "",
                    postal_code: defaultAddr.zipCode || "",
                    city_state: defaultAddr.area || "",
                    shipping_landmark: ""
                })
            } else {
                setShippingDetails(prev => ({
                    ...prev,
                    shipping_name: fullName,
                    phone_number: phone
                }))
            }
        }

        loadProfileAndAddresses()
    }, [user])

    const handleSelectAddress = (addr) => {
        setSelectedAddrId(addr.id)
        setShippingDetails(prev => ({
            ...prev,
            shipping_address: addr.street || "",
            area_locality: addr.area || "",
            postal_code: addr.zipCode || "",
            city_state: addr.area || ""
        }))
        toast.success(`Loaded ${addr.type} address!`)
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setShippingDetails((prev) => ({ ...prev, [name]: value }))
    }

    const handleProceedToPayment = () => {
        const name = (shippingDetails.shipping_name || '').trim()
        const phone = (shippingDetails.phone_number || '').trim()
        const address = (shippingDetails.shipping_address || '').trim()
        const area = (shippingDetails.city_state || shippingDetails.area_locality || '').trim()
        const postcode = (shippingDetails.postal_code || '').trim()

        if (!name) {
            toast.error("Please enter your Full Name")
            return
        }
        if (!phone) {
            toast.error("Please enter your Phone Number")
            return
        }
        if (!address) {
            toast.error("Please enter your Street Address")
            return
        }

        const randomOrderId = `#AF-${Math.floor(100 + Math.random() * 900)}-XBB`

        const orderData = {
            order_id: randomOrderId,
            orderId: randomOrderId,
            recipient: name,
            created_at: new Date().toISOString(),
            status: "Processing",
            total_amount: finalNumericTotal,
            totalAmount: formattedTotal,
            rawTotalAmount: finalNumericTotal,
            subtotal: baseSubtotal,
            shipping_fee: shippingFee,
            applied_coupon: appliedCoupon ? (appliedCoupon.code || appliedCoupon) : null,
            discount_amount: discountAmount,
            items: (cartItems || []).map(item => ({
                id: item.products?.id || item.product_id,
                name: item.products?.name || "Specimen Item",
                quantity: item.quantity || 1,
                price: item.products?.discounted_price || item.products?.price || item.price || 0,
                scientific_name: item.products?.scientific_name || "",
                category: item.products?.category || "",
                sub_category: item.products?.sub_category || "",
                image: item.products?.thumbnail || item.products?.image || ""
            })),
            shipping_name: name,
            phone_number: phone,
            shipping_address: address,
            area_locality: area,
            postal_code: postcode,
            city_state: area,
            shipping_landmark: shippingDetails.shipping_landmark || "",
            shippingDetails: {
                ...shippingDetails,
                shipping_name: name,
                phone_number: phone,
                shipping_address: address,
                area_locality: area,
                postal_code: postcode,
                city_state: area
            },
            email: user?.email || ""
        }

        try {
            sessionStorage.setItem("pending_checkout_order", JSON.stringify(orderData))
        } catch (e) {}

        navigate("/qr-payment", { 
            state: { 
                orderData,
                totalAmount: finalNumericTotal
            } 
        })
    }

    return (
        <div className="bg-[#FAF8F5] min-h-screen py-10 font-hanken">
            <Container>
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <button
                            onClick={() => navigate('/cart')}
                            className="font-hanken text-xs font-semibold text-[#163422] underline hover:text-black mb-2 inline-block cursor-pointer"
                        >
                            &larr; Back to Cart
                        </button>
                        <h1 className="font-libre text-2xl sm:text-3xl md:text-4xl font-bold text-[#163422]">
                            Shipping Information
                        </h1>
                    </div>
                </div>

                <p className="font-hanken text-sm text-[#525B54] mb-6">
                    Please review or modify your shipping details to complete your order.
                </p>

                {/* Saved Profile Addresses Quick Select Bar */}
                {savedAddresses.length > 0 && (
                    <div className="bg-white border border-[#E5E2DC] p-4 rounded-lg mb-8 shadow-xs">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[#163422]" />
                                <span className="font-hanken font-bold text-xs text-[#163422] uppercase tracking-wider">
                                    Saved Profile Addresses ({savedAddresses.length})
                                </span>
                            </div>
                            <span className="text-[11px] text-[#6E756F]">Click address to auto-fill</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {savedAddresses.map((addr) => (
                                <button
                                    key={addr.id}
                                    type="button"
                                    onClick={() => handleSelectAddress(addr)}
                                    className={`p-3 rounded-md text-left transition cursor-pointer border flex flex-col justify-between ${
                                        selectedAddrId === addr.id
                                            ? 'border-2 border-[#163422] bg-[#F4F9F1] shadow-xs'
                                            : 'border-[#E5E2DC] bg-[#FAF8F5] hover:bg-white'
                                    }`}
                                >
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-xs text-[#163422]">{addr.type}</span>
                                            {selectedAddrId === addr.id && (
                                                <CheckCircle2 className="w-3.5 h-3.5 text-[#163422]" />
                                            )}
                                        </div>
                                        <p className="text-[11px] text-[#525B54] truncate">{addr.street}</p>
                                        <p className="text-[10px] text-[#6E756F] truncate">{addr.area} {addr.zipCode}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="flex flex-col gap-1">
                        <label className="font-hanken text-[11px] font-semibold uppercase tracking-[0.16em] text-[#424843]">
                            Full Name *
                        </label>
                        <input
                            name="shipping_name"
                            value={shippingDetails.shipping_name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            className="w-full border border-[#C2C8C0] bg-white p-3 text-[#163422] placeholder:text-[#7C827C] focus:border-[#163422] focus:outline-none rounded-xs"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="font-hanken text-[11px] font-semibold uppercase tracking-[0.16em] text-[#424843]">
                            Phone Number *
                        </label>
                        <input
                            name="phone_number"
                            value={shippingDetails.phone_number}
                            onChange={handleChange}
                            placeholder="+91 Phone Number"
                            className="w-full border border-[#C2C8C0] bg-white p-3 text-[#163422] placeholder:text-[#7C827C] focus:border-[#163422] focus:outline-none rounded-xs"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="font-hanken text-[11px] font-semibold uppercase tracking-[0.16em] text-[#424843]">
                            State / Postcode *
                        </label>
                        <input
                            name="postal_code"
                            value={shippingDetails.postal_code}
                            onChange={handleChange}
                            placeholder="e.g. Karnataka, 560038"
                            className="w-full border border-[#C2C8C0] bg-white p-3 text-[#163422] placeholder:text-[#7C827C] focus:border-[#163422] focus:outline-none rounded-xs"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="font-hanken text-[11px] font-semibold uppercase tracking-[0.16em] text-[#424843]">
                            Area / State *
                        </label>
                        <input
                            name="city_state"
                            value={shippingDetails.city_state}
                            onChange={handleChange}
                            placeholder="e.g. Indiranagar, Bengaluru, Karnataka"
                            className="w-full border border-[#C2C8C0] bg-white p-3 text-[#163422] placeholder:text-[#7C827C] focus:border-[#163422] focus:outline-none rounded-xs"
                        />
                    </div>
                </div>

                <div className="mt-5 flex flex-col gap-1">
                    <label className="font-hanken text-[11px] font-semibold uppercase tracking-[0.16em] text-[#424843]">
                        Street Address *
                    </label>
                    <input
                        name="shipping_address"
                        value={shippingDetails.shipping_address}
                        onChange={handleChange}
                        placeholder="Flat / Building / Street address"
                        className="w-full border border-[#C2C8C0] bg-white p-3 text-[#163422] placeholder:text-[#7C827C] focus:border-[#163422] focus:outline-none rounded-xs"
                    />
                </div>

                <div className="mt-5 flex flex-col gap-1">
                    <label className="font-hanken text-[11px] font-semibold uppercase tracking-[0.16em] text-[#424843]">
                        Landmark (Optional)
                    </label>
                    <input
                        name="shipping_landmark"
                        value={shippingDetails.shipping_landmark}
                        onChange={handleChange}
                        placeholder="Nearby landmark"
                        className="w-full border border-[#C2C8C0] bg-white p-3 text-[#163422] placeholder:text-[#7C827C] focus:border-[#163422] focus:outline-none rounded-xs"
                    />
                </div>

                <div className="mt-8 sm:mt-9 flex flex-col items-stretch sm:items-end gap-4">
                    <button
                        onClick={handleProceedToPayment}
                        className="flex items-center justify-center gap-2 rounded-md bg-[#163422] px-6 sm:px-8 py-3.5 font-hanken text-xs sm:text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#0e2619] cursor-pointer w-full sm:w-auto text-center"
                    >
                        <span>Proceed to Payment - {formattedTotal}</span>
                        <span aria-hidden="true">&rarr;</span>
                    </button>

                    <div className="flex items-center justify-center sm:justify-end gap-2 font-hanken text-xs sm:text-sm text-[#424843]">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#163422] text-[10px] text-[#163422] shrink-0">✓</span>
                        <span>100% Secure Checkout & Live Arrival Guarantee</span>
                    </div>
                </div>
            </Container>
        </div>
    )
}

export default CheckoutPage