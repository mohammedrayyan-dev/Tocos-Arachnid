import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import QRCode from 'qrcode'
import { useCart } from '../../context/CartContext'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useStoreSettings } from '../../context/StoreSettingsContext'

const QRCodePattern = ({ upiUrl, customQrImage, isExpired }) => {
    const [qrDataUrl, setQrDataUrl] = useState('')

    useEffect(() => {
        if (customQrImage) return
        if (!upiUrl) return
        QRCode.toDataURL(upiUrl, {
            margin: 2,
            width: 320,
            errorCorrectionLevel: 'H',
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error('QR Generation error:', err))
    }, [upiUrl, customQrImage])

    const displayImage = customQrImage || qrDataUrl

    return (
        <div className="relative w-48.75 h-48.75 flex items-center justify-center bg-white">
            {displayImage ? (
                <img 
                    src={displayImage} 
                    alt="UPI Payment QR Code" 
                    className="w-47.5 h-47.5 object-contain rounded-md"
                />
            ) : (
                <div className="w-47.5 h-47.5 bg-[#FAF8F5] animate-pulse flex items-center justify-center text-xs text-[#525B54]">
                    Generating QR...
                </div>
            )}
        </div>
    )
}

const parsePriceNumber = (val) => {
  if (val === undefined || val === null) return 0
  if (typeof val === 'number') return isNaN(val) ? 0 : val
  const str = String(val).replace(/,/g, '').replace(/[^\d.]/g, '')
  const num = parseFloat(str)
  return isNaN(num) ? 0 : num
}

const QRPayment = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { clearCart, totalAmount: cartTotal } = useCart()
    const { user } = useAuth()
    const { settings } = useStoreSettings()

    const envUpiId = import.meta.env.VITE_UPI_ID
    const rawUpiId = settings.upiId || envUpiId || "9360435317@okbizaxis"
    const activeUpiId = rawUpiId.trim()
    const activePayeeName = (settings.payeeName || settings.storeName || "Tocos Arachnid").trim()

    // Initial 5-minute timer (300 seconds)
    const [timeLeft, setTimeLeft] = useState(300)
    const [isExpired, setIsExpired] = useState(false)
    const [isVerifying, setIsVerifying] = useState(false)
    const [utrNumber, setUtrNumber] = useState('')

    const rawOrderData = location.state?.orderData || {}

    // Cleanly extract valid total amount numeric value
    const calculatedNumeric = parsePriceNumber(rawOrderData.rawTotalAmount || rawOrderData.totalAmount || cartTotal || 3999)
    const displayTotalAmount = `₹${calculatedNumeric.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

    const [orderData, setOrderData] = useState({
        recipient: rawOrderData.recipient || user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Customer",
        orderId: rawOrderData.orderId || `#AF-${Math.floor(100 + Math.random() * 900)}-XBB`,
        totalAmount: displayTotalAmount,
        rawTotalAmount: calculatedNumeric,
        shippingDetails: rawOrderData.shippingDetails || {},
        items: rawOrderData.items || []
    })

    // Clean payee name and order ID for NPCI UPI URI specification compliance:
    // 1. Payee name: Alphanumeric only, no special characters or %20 encoding (GPay/PhonePe scanner strict rule)
    const cleanPayeeNoSpaces = activePayeeName.replace(/[^a-zA-Z0-9]/g, '') || 'TocosArachnid'

    // 2. Remove '#' symbol from orderId for transaction note
    const cleanOrderId = String(orderData.orderId || '').replace(/#/g, '').trim()

    // 3. Format numeric total strictly as 2 decimal places (e.g. 3999.00)
    const formattedAmount = Number(calculatedNumeric || 0).toFixed(2)

    // 4. Construct standard scannable NPCI UPI URI (DO NOT encode '@' in pa, omit 'tr' for non-gateway VPAs)
    const upiPaymentUrl = `upi://pay?pa=${activeUpiId}&pn=${cleanPayeeNoSpaces}&am=${formattedAmount}&cu=INR`

    const handleCopyUpiId = () => {
        navigator.clipboard.writeText(activeUpiId)
        toast.success(`Copied UPI ID "${activeUpiId}" to clipboard!`)
    }

    useEffect(() => {
        if (timeLeft <= 0) {
            setIsExpired(true)
            return
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setIsExpired(true)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [timeLeft])

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const handleRefreshQR = () => {
        const randomSuffix = Math.floor(100 + Math.random() * 900)
        setOrderData(prev => ({
            ...prev,
            orderId: `#AF-${Math.floor(100 + Math.random() * 900)}-X${randomSuffix}`
        }))
        setTimeLeft(300)
        setIsExpired(false)
        toast.success('Generated new QR Code!')
    }

    const handleCancel = () => {
        toast.error('Transaction cancelled')
        navigate('/cart')
    }

    const handlePaymentSuccess = async () => {
        if (isExpired || isVerifying) return

        const cleanUtr = utrNumber.replace(/\D/g, '')
        if (!cleanUtr || cleanUtr.length !== 12) {
            toast.error('Invalid UPI Transaction ID: Must be an exact 12-digit numeric ID (e.g. 324598127041) from GPay / PhonePe / Paytm.')
            return
        }

        setIsVerifying(true)
        
        try {
            const activeUser = user || (await supabase.auth.getUser())?.data?.user
            const cleanRecipient = orderData.recipient || activeUser?.user_metadata?.full_name || activeUser?.email?.split('@')[0] || 'Customer'
            const cleanPhone = orderData.shippingDetails?.phone_number || ''

            const payload = {
                id: orderData.orderId,
                user_id: activeUser?.id || null,
                email: activeUser?.email || 'customer@tocos.com',
                customer_name: cleanRecipient,
                shipping_name: cleanRecipient,
                phone_number: cleanPhone,
                customer_phone: cleanPhone,
                shipping_address: orderData.shippingDetails?.shipping_address || 'Address on file',
                shipping_city: orderData.shippingDetails?.city_state || '',
                shipping_zip: orderData.shippingDetails?.postal_code || '',
                total_amount: calculatedNumeric,
                items: orderData.items || [],
                status: 'Pending',
                utr_number: cleanUtr,
                utrNumber: cleanUtr,
                utr: cleanUtr,
                created_at: new Date().toISOString()
            }

            // 1. Instantly save to local storage for Admin orders sync
            try {
                const existingAdmin = JSON.parse(localStorage.getItem('tocos_admin_orders') || '[]')
                const updatedAdminOrders = [payload, ...existingAdmin.filter(o => o.id !== payload.id)]
                localStorage.setItem('tocos_admin_orders', JSON.stringify(updatedAdminOrders))
            } catch (e) {}

            // 2. Instantly save to local storage for Customer Order History sync
            if (activeUser?.id || activeUser?.email) {
                try {
                    const userKey = activeUser.id ? `user_orders_${activeUser.id}` : `user_orders_${activeUser.email}`
                    const existingUserOrders = JSON.parse(localStorage.getItem(userKey) || '[]')
                    const updatedUserOrders = [payload, ...existingUserOrders.filter(o => o.id !== payload.id)]
                    localStorage.setItem(userKey, JSON.stringify(updatedUserOrders))
                } catch (e) {}
            }

            // 3. Insert into Supabase DB table for permanent cross-device persistence
            try {
                const dbPayload = {
                    id: orderData.orderId,
                    user_id: activeUser?.id || null,
                    email: activeUser?.email || 'customer@tocos.com',
                    customer_name: cleanRecipient || 'Customer',
                    shipping_name: cleanRecipient || 'Customer',
                    phone_number: cleanPhone || '9876543210',
                    customer_phone: cleanPhone || '9876543210',
                    shipping_address: orderData.shippingDetails?.shipping_address || 'Address on file',
                    shipping_city: orderData.shippingDetails?.city_state || 'Bengaluru',
                    shipping_state: orderData.shippingDetails?.state || 'Karnataka',
                    shipping_zip: orderData.shippingDetails?.postal_code || '560001',
                    shipping_landmark: orderData.shippingDetails?.landmark || 'Near Center',
                    total_amount: calculatedNumeric,
                    items: orderData.items || [],
                    utr_number: cleanUtr,
                    utrNumber: cleanUtr,
                    utr: cleanUtr,
                    status: 'Pending',
                    created_at: new Date().toISOString()
                }

                // First attempt full payload insert
                const { error: fullErr } = await supabase.from('orders').insert([dbPayload])
                if (fullErr) {
                    console.warn("Supabase full insert notice, trying fallback payload:", fullErr.message)
                    // Fallback insert if custom columns differ in schema
                    const fallbackPayload = {
                        user_id: activeUser?.id || null,
                        shipping_name: cleanRecipient || 'Customer',
                        phone_number: cleanPhone || '9876543210',
                        shipping_address: orderData.shippingDetails?.shipping_address || 'Address on file',
                        shipping_city: orderData.shippingDetails?.city_state || 'Bengaluru',
                        shipping_state: orderData.shippingDetails?.state || 'Karnataka',
                        shipping_zip: orderData.shippingDetails?.postal_code || '560001',
                        shipping_landmark: orderData.shippingDetails?.landmark || 'Near Center',
                        total_amount: calculatedNumeric,
                        utr_number: cleanUtr,
                        utrNumber: cleanUtr,
                        utr: cleanUtr,
                        status: 'Pending'
                    }
                    await supabase.from('orders').insert([fallbackPayload])
                } else {
                    console.log("Successfully inserted complete order payload to Supabase DB!")
                }
            } catch (dbErr) {
                console.warn("Supabase order insert exception:", dbErr)
            }

            if (clearCart) clearCart()

            toast.success('Payment verified & order recorded!')
            navigate('/payment-success', { state: { orderData: { ...orderData, totalAmount: displayTotalAmount, items: orderData.items || [] } } })
        } catch (err) {
            console.error("Payment verification error:", err)
            toast.error("An error occurred during verification")
        } finally {
            setIsVerifying(false)
        }
    }

    return (
        <div className="bg-[#FAF8F5] min-h-screen flex flex-col font-hanken">
            {/* Sub-header Banner */}
            <div className="bg-[#163422] text-white py-4 px-6 text-center">
                <h1 className="font-hanken font-bold text-xs uppercase tracking-[0.2em] text-[#C8EBD0]">
                    SECURE UPI PAYMENT GATEWAY
                </h1>
            </div>

            {/* Main Content Area */}
            <div className="max-w-260 mx-auto w-full flex-1 flex items-center justify-center py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 lg:gap-16 items-center w-full">
                    
                    {/* Left Column */}
                    <div className="flex flex-col">
                        <h2 className="font-libre text-3xl sm:text-4xl lg:text-[2.85rem] font-bold text-[#163422] tracking-tight leading-none">
                            Complete Purchase
                        </h2>
                        <p className="font-hanken text-sm lg:text-[0.95rem] text-[#525B54] mt-4 sm:mt-5 leading-relaxed max-w-full lg:max-w-115">
                            Your selection of premium arachnids and specialist care equipment is ready for shipment. Please complete the transaction using the secure QR.
                        </p>

                        {/* Order Details Card */}
                        <div className="mt-6 sm:mt-8 bg-[#F4F2EE] border border-[#E3E0DA] p-5 sm:p-6 lg:p-7 max-w-full lg:max-w-115 w-full flex flex-col gap-4">
                            <p className="font-hanken text-[11px] font-bold uppercase tracking-[0.16em] text-[#6E756F]">
                                ORDER DETAILS
                            </p>

                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-center py-2.5 border-b border-[#E3E0DA]">
                                    <span className="font-hanken text-sm text-[#525B54]">Recipient</span>
                                    <span className="font-hanken text-sm font-medium text-[#163422]">{orderData.recipient}</span>
                                </div>

                                <div className="flex justify-between items-center py-2.5 border-b border-[#E3E0DA]">
                                    <span className="font-hanken text-sm text-[#525B54]">Order ID</span>
                                    <span className="font-hanken text-sm font-medium text-[#163422]">{orderData.orderId}</span>
                                </div>

                                <div className="flex justify-between items-center pt-3">
                                    <span className="font-hanken text-sm text-[#525B54]">Total Amount</span>
                                    <span className="font-libre text-2xl font-bold text-[#163422]">{displayTotalAmount}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Terminal Card */}
                    <div className="flex justify-center lg:justify-end w-full">
                        <div className="bg-white border border-[#E8E5DF] shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-5 sm:p-8 lg:p-10 flex flex-col items-center justify-center max-w-full lg:max-w-100 w-full">
                            <span className="font-hanken text-[11px] font-bold uppercase tracking-[0.24em] text-[#91724B]">
                                SECURE TERMINAL
                            </span>
                            <h3 className="font-libre text-2xl font-bold text-[#163422] mt-1.5 mb-2">
                                Scan to Pay
                            </h3>

                            {/* Direct Merchant UPI ID Box (Configured via Admin > Settings) */}
                            <div className="w-full bg-[#FAF8F5] border border-[#E3E0DA] rounded-md p-3 mb-4 text-center">
                                <p className="text-[11px] text-[#525B54] font-medium">Merchant UPI ID (VPA):</p>
                                <p className="font-mono font-bold text-xs sm:text-sm text-[#163422] my-1 select-all">
                                    {activeUpiId}
                                </p>
                                <button
                                    type="button"
                                    onClick={handleCopyUpiId}
                                    className="text-[10px] font-bold uppercase tracking-wider text-[#163422] bg-[#EAF5ED] hover:bg-[#d6ebd9] border border-[#C2C8C0] px-3 py-1 rounded transition cursor-pointer mt-1"
                                >
                                    📋 Copy UPI ID
                                </button>
                            </div>

                            {/* QR Frame with L-shaped corner brackets & dynamic blur on expire */}
                            <div 
                                onClick={handlePaymentSuccess}
                                className={`relative p-6 bg-white flex items-center justify-center my-2 transition-all duration-500 select-none ${
                                    isExpired ? 'blur-[7px] opacity-40 pointer-events-none' : 'cursor-pointer'
                                }`}
                                title={isExpired ? "QR Expired" : "Click to simulate payment completion"}
                            >
                                {/* Top-Left Corner */}
                                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#163422]"></div>
                                {/* Top-Right Corner */}
                                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#163422]"></div>
                                {/* Bottom-Left Corner */}
                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#163422]"></div>
                                {/* Bottom-Right Corner */}
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#163422]"></div>

                                <QRCodePattern upiUrl={upiPaymentUrl} customQrImage={settings.qrCodeImage} isExpired={isExpired} />
                            </div>

                            {!isExpired && (
                                <a
                                    href={upiPaymentUrl}
                                    className="mt-2 text-[11px] font-bold text-[#163422] underline hover:text-[#0d2316] transition flex items-center justify-center gap-1.5"
                                >
                                    <span>📱 Open directly in UPI App (GPay / PhonePe / Paytm)</span>
                                </a>
                            )}

                            <p className="text-[11px] text-[#525B54] font-semibold mt-2.5 text-center flex items-center justify-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#163422] inline-block animate-pulse"></span>
                                <span>Verified Merchant: <strong className="text-[#163422]">{activePayeeName}</strong></span>
                            </p>

                            {/* Status Pill */}
                            {!isExpired ? (
                                <div className="bg-[#ECE8E3] rounded-md px-5 py-2.5 flex items-center justify-center gap-2 mt-4">
                                    <svg className="w-4 h-4 text-[#163422]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="9" />
                                        <polyline points="12 7 12 12 15 15" />
                                    </svg>
                                    <span className="font-hanken text-xs font-semibold text-[#163422]">
                                        QR expires in {formatTime(timeLeft)}
                                    </span>
                                </div>
                            ) : (
                                <div className="bg-[#EFECE8] rounded-md px-5 py-2 flex items-center justify-center mt-4">
                                    <span className="font-hanken text-xs font-medium text-[#B91C1C]">
                                        QR code expired
                                    </span>
                                </div>
                            )}

                            {/* Mandatory UPI Transaction ID Input */}
                            {!isExpired && (
                                <div className="w-full mt-5 font-hanken">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#163422]">
                                            UPI Transaction ID / Ref No. <span className="text-[#991B1B]">*</span>
                                        </label>
                                        <span className="text-[10px] font-bold text-[#6E756F]">
                                            {utrNumber.replace(/\D/g, '').length} / 12 Digits
                                        </span>
                                    </div>
                                    <input 
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={utrNumber}
                                        onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                                        placeholder="e.g. 324598127041 (12 Digits)"
                                        maxLength={12}
                                        className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E3E0DA] focus:border-[#163422] rounded-md text-xs font-mono font-bold text-[#163422] outline-none shadow-2xs placeholder:text-[#9DA39E] placeholder:font-normal tracking-widest"
                                    />
                                    <p className="text-[10px] text-[#6E756F] mt-1 font-medium">
                                        Found on your GPay / PhonePe / Paytm payment screen after paying
                                    </p>
                                </div>
                            )}

                            {/* Verify & Place Order Action */}
                            {!isExpired && (
                                <button
                                    type="button"
                                    onClick={handlePaymentSuccess}
                                    disabled={isVerifying}
                                    className="w-full mt-4 py-3.5 bg-[#163422] hover:bg-[#0d2316] text-white font-hanken font-bold text-xs uppercase tracking-widest rounded-md shadow-xs transition cursor-pointer text-center disabled:opacity-50"
                                >
                                    {isVerifying ? 'Verifying UTR & Placing Order...' : 'Verify UTR & Place Order'}
                                </button>
                            )}

                            {/* Refresh QR Code link (Shown when expired) */}
                            {isExpired && (
                                <button
                                    type="button"
                                    onClick={handleRefreshQR}
                                    className="mt-4 font-hanken text-xs font-semibold text-[#163422] hover:text-black cursor-pointer transition"
                                >
                                    Refresh QR Code
                                </button>
                            )}

                            {/* Cancel Link */}
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex items-center justify-center gap-1.5 mt-4 text-[#163422] hover:text-black cursor-pointer transition font-hanken text-xs font-semibold"
                            >
                                <svg className="w-3.5 h-3.5 stroke-2 text-[#163422]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Cancel Transaction
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* Empty footer spacer for symmetry */}
            <div className="py-2"></div>
        </div>
    )
}

export default QRPayment
