import { Link, useLocation } from 'react-router-dom'
import Container from '../../components/common/Container'
import beginnerTarantula from '../../assets/image/beginner-tarantula-care.webp'
import mexicanRedKnee from '../../assets/image/mexican-red-knee.webp'
import brazilianBlack from '../../assets/image/brazilian-black.webp'

const DEFAULT_THUMBNAIL = beginnerTarantula

const parsePriceNumber = (val) => {
  if (val === undefined || val === null) return 0
  if (typeof val === 'number') return isNaN(val) ? 0 : val
  const str = String(val).replace(/,/g, '').replace(/[^\d.]/g, '')
  const num = parseFloat(str)
  return isNaN(num) ? 0 : num
}

const getImageSrc = (item) => {
  let rawImg = item.thumbnail || item.image || item.products?.thumbnail || (Array.isArray(item.products?.images) && item.products?.images[0])
  if (!rawImg || String(rawImg).includes('placehold.co')) {
    const nameLower = String(item.name || item.products?.name || '').toLowerCase()
    if (nameLower.includes('mexican') || nameLower.includes('hamorii')) {
      return mexicanRedKnee
    } else if (nameLower.includes('brazilian') || nameLower.includes('pulchra')) {
      return brazilianBlack
    } else {
      return beginnerTarantula
    }
  }
  return rawImg
}

const PaymentSuccess = () => {
  const location = useLocation()
  
  let orderData = location.state?.orderData
  if (!orderData) {
    try {
      const saved = sessionStorage.getItem("pending_checkout_order") || localStorage.getItem("last_placed_order")
      if (saved) orderData = JSON.parse(saved)
    } catch (e) {}
  }

  const orderId = orderData?.orderId || orderData?.order_id || orderData?.id || '#AF-479-XBB'
  const items = (orderData?.items && orderData.items.length > 0) ? orderData.items : [
    {
      name: 'Conservatory Specimen Order',
      scientific_name: 'Live Specimen',
      category: 'ORDER CONFIRMED',
      price: orderData?.rawTotalAmount || orderData?.total_amount || 962,
      quantity: 1,
      thumbnail: DEFAULT_THUMBNAIL
    }
  ]

  const totalPaidNum = parsePriceNumber(orderData?.rawTotalAmount || orderData?.total_amount || orderData?.totalAmount || orderData?.amount || 962)
  const formattedTotalPaid = `₹${totalPaidNum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="py-10 mb-16 font-hanken">
      <Container>
        <div className="max-w-260 mx-auto flex flex-col items-center">
          
          {/* Checkmark Icon */}
          <div className="w-14 h-14 bg-[#C8EBD0] text-[#163422] rounded-xl flex items-center justify-center mb-5 shadow-xs">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Main Header */}
          <h1 className="font-libre text-4xl md:text-5xl font-bold text-[#163422] text-center mb-3 tracking-tight">
            Your new companion is on the way.
          </h1>
          <p className="font-hanken text-sm md:text-base text-[#424843] text-center max-w-xl mb-6 leading-relaxed">
            Thank you for your order, <strong className="text-[#163422]">{orderData?.recipient || orderData?.shipping_name || orderData?.customer_name || 'Valued Customer'}</strong>! You will receive live tracking and WhatsApp delivery updates shortly.
          </p>

          {/* Order Number & Total Paid Badge */}
          <div className="bg-[#FAF8F5] border border-[#E5E2DC] px-8 py-3.5 rounded-xl text-center mb-10 shadow-2xs flex flex-col sm:flex-row items-center gap-6">
            <div>
              <p className="font-hanken text-[10px] font-bold text-[#6E756F] uppercase tracking-[0.16em]">
                ORDER NUMBER
              </p>
              <p className="font-hanken font-bold text-sm text-[#1C1B1B] mt-0.5">
                {orderId}
              </p>
            </div>

            <div className="hidden sm:block w-px h-8 bg-[#E5E2DC]"></div>

            <div>
              <p className="font-hanken text-[10px] font-bold text-[#6E756F] uppercase tracking-[0.16em]">
                TOTAL AMOUNT PAID
              </p>
              <p className="font-libre font-bold text-lg text-[#163422] mt-0.5">
                {formattedTotalPaid}
              </p>
            </div>
          </div>

          {/* Main Grid Section */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-6 w-full items-start">
            
            {/* Left Column: Ordered Product Card List */}
            <div className="flex flex-col gap-4 overflow-y-auto max-h-125 pr-1.5">
              {items.map((item, idx) => {
                const qty = item.quantity || 1
                const unitPrice = parsePriceNumber(item.price || item.products?.discounted_price || item.products?.price)
                const lineSubtotal = unitPrice > 0 ? (unitPrice * qty) : totalPaidNum
                const priceFormatted = `₹${lineSubtotal.toLocaleString('en-IN')}`
                const img = getImageSrc(item)
                const name = item.name || item.products?.name || 'Live Specimen'

                return (
                  <div 
                    key={idx} 
                    className="bg-white border border-[#E5E2DC] rounded-md overflow-hidden flex flex-col md:flex-row items-stretch shadow-xs shrink-0"
                  >
                    <img 
                      src={img} 
                      alt={name} 
                      className="w-full md:w-50 h-44 md:h-auto object-cover shrink-0 bg-[#FAF8F5]"
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_THUMBNAIL
                      }}
                    />

                    <div className="p-5 flex flex-col justify-between flex-1 gap-3">
                      <div>
                        <span className="font-hanken text-[10px] font-bold text-[#785832] uppercase tracking-wider block mb-1">
                          {item.category || item.products?.category || 'ORDER ITEM'}
                        </span>
                        <h2 className="font-libre text-xl md:text-2xl font-bold text-[#163422] mb-1 leading-tight">
                          {name}
                        </h2>
                        {item.scientific_name && (
                          <p className="font-hanken text-xs italic text-[#525B54]">
                            {item.scientific_name}
                          </p>
                        )}
                        {item.quantity && (
                          <p className="font-hanken text-xs font-bold text-[#163422] mt-1">
                            Quantity: {item.quantity}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-[#E5E2DC] flex items-center justify-between">
                        <span className="font-hanken text-xs text-[#424843]">Item Subtotal</span>
                        <span className="font-libre text-lg font-bold text-[#163422]">
                          {priceFormatted}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Right Column: "What happens next?" Card */}
            <div>
              <div className="bg-[#133221] p-6 lg:p-7 text-white shadow-xs rounded-md">
                <h3 className="font-libre text-2xl font-bold text-white mb-6">
                  What happens next?
                </h3>

                <div className="space-y-5">
                  {/* Step 1 */}
                  <div className="flex items-start gap-3.5">
                    <div className="shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-[#A4E0B2]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-hanken font-bold text-xs text-white">
                        1. WhatsApp Confirmation
                      </h4>
                      <p className="font-hanken text-[11px] text-white/80 mt-0.5 leading-relaxed">
                        Expect a message from our concierge to finalize your delivery window.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3.5">
                    <div className="shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-[#A4E0B2]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-hanken font-bold text-xs text-white">
                        2. Expert Health Check
                      </h4>
                      <p className="font-hanken text-[11px] text-white/80 mt-0.5 leading-relaxed">
                        Our naturalists conduct a final vitality assessment before packaging.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3.5">
                    <div className="shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-[#A4E0B2]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-hanken font-bold text-xs text-white">
                        3. Climate-Controlled Shipping
                      </h4>
                      <p className="font-hanken text-[11px] text-white/80 mt-0.5 leading-relaxed">
                        Dispatched in specialized insulated containers with 72-hour heat/cool packs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Single Return to Home Action Button */}
              <div className="mt-4">
                <Link
                  to="/"
                  className="w-full block bg-white border border-[#C2C8C0] hover:bg-gray-50 text-[#1C1B1B] font-hanken font-bold text-xs py-3.5 rounded-md tracking-[0.14em] text-center uppercase cursor-pointer transition shadow-2xs"
                >
                  RETURN TO HOME
                </Link>
              </div>
            </div>

          </div>

          {/* Payment Details Card */}
          <div className="w-full mt-8 bg-white border border-[#E5E2DC] rounded-xl p-6 shadow-xs font-hanken">
            <h3 className="font-libre text-xl font-bold text-[#163422] mb-4 pb-3 border-b border-[#E5E2DC]">
              Payment & Order Confirmation Summary
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-[#FAF8F5] p-4 rounded-lg border border-[#E5E2DC]">
                <span className="text-[#6E756F] font-semibold block text-[10px] uppercase tracking-wider mb-1">
                  Recipient Name
                </span>
                <span className="font-bold text-[#163422] text-sm">
                  {orderData?.recipient || orderData?.shipping_name || orderData?.customer_name || 'Valued Customer'}
                </span>
              </div>

              <div className="bg-[#FAF8F5] p-4 rounded-lg border border-[#E5E2DC]">
                <span className="text-[#6E756F] font-semibold block text-[10px] uppercase tracking-wider mb-1">
                  UPI Transaction ID
                </span>
                <span className="font-mono font-bold text-[#163422] text-sm">
                  {orderData?.utr_number || orderData?.utrNumber || orderData?.utr || 'Verified'}
                </span>
              </div>

              <div className="bg-[#EAF5ED] p-4 rounded-lg border border-[#C6E6CE]">
                <span className="text-[#163422] font-semibold block text-[10px] uppercase tracking-wider mb-1">
                  Total Amount Paid
                </span>
                <span className="font-libre font-bold text-[#163422] text-xl">
                  {formattedTotalPaid}
                </span>
              </div>
            </div>
          </div>

        </div>
      </Container>
    </div>
  )
}

export default PaymentSuccess
