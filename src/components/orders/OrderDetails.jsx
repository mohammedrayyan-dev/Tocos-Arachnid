import { useState } from 'react'
import { X, MessageSquare, Check, ChevronDown, FileText } from 'lucide-react'
import { toast } from 'sonner'
import OrderInvoiceModal from './OrderInvoiceModal'

const formatOrderDateTime = (dateInput, suffix = '') => {
  if (!dateInput) return null
  try {
    const d = new Date(dateInput)
    if (isNaN(d.getTime())) return null
    const formatted = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
    return suffix ? `${formatted} • ${suffix}` : formatted
  } catch (e) {
    return null
  }
}

const OrderDetails = ({ order, onClose, onStatusChange }) => {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)

  if (!order) return null

  const orderIdCode = order.id || '#TA-89241'
  const currentStatus = order.status || 'Pending'
  const firstName = order.customer?.split(' ')[0] || 'Customer'

  // Dynamic timeline status flags based on order.status
  const isConfirmedOrHigher = ['Confirmed', 'Health Check', 'Processing', 'Shipped', 'Delivered'].includes(currentStatus)
  const isHealthCheckOrHigher = ['Health Check', 'Shipped', 'Delivered'].includes(currentStatus)
  const isShippedOrHigher = ['Shipped', 'Delivered'].includes(currentStatus)
  const isDelivered = currentStatus === 'Delivered'

  const createdDate = order.createdAt || order.created_at || order.date
  const updatedDate = order.updatedAt || order.updated_at || createdDate

  const placedTime = formatOrderDateTime(createdDate, 'Initiated') || 'Just Now • Initiated'
  const confirmedTime = formatOrderDateTime(updatedDate, 'Payment Verified') || 'Payment Verified'
  const healthCheckTime = formatOrderDateTime(updatedDate, 'Passed Inspection') || 'Passed Inspection'
  const shippedTime = formatOrderDateTime(updatedDate, 'Out for Delivery') || 'Out for Delivery'
  const deliveredTime = formatOrderDateTime(updatedDate, 'Delivered') || 'Package Delivered'

  const timelineSteps = [
    {
      title: 'Order Initiated',
      time: placedTime,
      isCompleted: true,
      hasDropdown: false
    },
    {
      title: 'Payment Verified',
      time: isConfirmedOrHigher ? confirmedTime : 'Awaiting Payment Verification',
      isCompleted: isConfirmedOrHigher,
      hasDropdown: true
    },
    {
      title: 'Health Check Inspection',
      time: isHealthCheckOrHigher ? healthCheckTime : 'Pending Health Inspection',
      isCompleted: isHealthCheckOrHigher,
      hasDropdown: true
    },
    {
      title: 'Dispatched & Shipped',
      time: isShippedOrHigher ? shippedTime : 'In Queue for Express Courier',
      isCompleted: isShippedOrHigher,
      hasDropdown: false
    },
    {
      title: 'Package Delivered',
      time: isDelivered ? deliveredTime : 'Expected Delivery in 2-3 Days',
      isCompleted: isDelivered,
      hasDropdown: false
    }
  ]

  // Dynamic WhatsApp Notification text based on currentStatus
  const getWhatsAppMessage = () => {
    switch (currentStatus) {
      case 'Delivered':
        return `"Hello ${firstName}, your order ${orderIdCode} has been delivered! Thank you for choosing Toco's Arachnid. 🏡✨"`
      case 'Shipped':
        return `"Hello ${firstName}, your order ${orderIdCode} has been dispatched via climate-controlled express courier! 🚚"`
      case 'Health Check':
        return `"Hello ${firstName}, your order ${orderIdCode} is undergoing expert vitality inspection by our naturalists. 🕷🩺"`
      case 'Confirmed':
        return `"Hello ${firstName}, your payment for order ${orderIdCode} has been verified & confirmed! 💳✓"`
      default:
        return `"Hello ${firstName}, your order ${orderIdCode} has been initiated and is awaiting payment verification. ⏳"`
    }
  }

  const handleContactCustomer = () => {
    const phone = order.phone || '+919876543210'
    const message = encodeURIComponent(getWhatsAppMessage().replace(/"/g, ''))
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`, '_blank')
    toast.info(`Opening WhatsApp message channel for ${order.customer || 'Customer'}...`)
  }

  return (
    <>
      <div className="w-full lg:w-95 bg-white border border-[#E5E2DC] rounded-xl overflow-hidden shadow-md flex flex-col justify-between shrink-0 font-hanken">
        <div>
          {/* Top Header Box (Dark Green) */}
          <div className="bg-[#133221] p-6 text-white flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-white/70 uppercase tracking-[0.18em]">
                  ACTIVE DETAILS
                </span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                  isDelivered
                    ? 'bg-[#C8EBD0] text-[#163422]'
                    : isShippedOrHigher
                    ? 'bg-[#EAF5ED] text-[#163422]'
                    : 'bg-[#FCECD9] text-[#785832]'
                }`}>
                  {currentStatus}
                </span>
              </div>
              <h2 className="font-libre text-3xl font-bold text-white">
                {orderIdCode}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-1 text-white/80 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Panel Content */}
          <div className="p-6 space-y-6">
            {/* Payment & Transaction ID Verification Box */}
            <div className="bg-[#FAF8F5] border border-[#E5E2DC] p-4 rounded-xl shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-[10px] text-[#6E756F] uppercase tracking-wider">
                  UPI TRANSACTION ID VERIFICATION
                </span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                  order.status === 'Confirmed' || order.status === 'Shipped' || order.status === 'Delivered'
                    ? 'bg-[#EAF5ED] text-[#163422] border border-[#C6E6CE]'
                    : 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                }`}>
                  {order.status === 'Confirmed' || order.status === 'Shipped' || order.status === 'Delivered' ? 'Verified' : 'Needs Admin Check'}
                </span>
              </div>

              <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-[#E5E2DC]">
                <div>
                  <p className="text-[10px] text-[#6E756F]">Submitted UPI Transaction ID</p>
                  <p className="font-mono font-bold text-xs text-[#163422]">
                    {order.utr_number || order.utrNumber || order.utr || 'Awaiting Verification'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const utrToCopy = order.utr_number || order.utrNumber || order.utr || ''
                    if (utrToCopy) {
                      navigator.clipboard.writeText(utrToCopy)
                      toast.success('Copied UPI Transaction ID to clipboard!')
                    } else {
                      toast.error('No UPI Transaction ID available to copy.')
                    }
                  }}
                  className="px-2.5 py-1 bg-[#FAF8F5] hover:bg-gray-100 text-[#163422] text-[10px] font-bold rounded border border-[#E5E2DC] cursor-pointer"
                >
                  Copy ID
                </button>
              </div>

              {/* Admin Quick Verification Action Buttons */}
              {currentStatus === 'Pending' && (
                <div className="mt-3 pt-3 border-t border-[#E5E2DC] flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (onStatusChange) onStatusChange(order.id, 'Confirmed')
                      toast.success(`Payment verified! Order ${order.id} is now Confirmed.`)
                    }}
                    className="flex-1 py-2 bg-[#163422] hover:bg-[#0D2316] text-white text-[11px] font-bold rounded-md transition cursor-pointer text-center uppercase tracking-wider shadow-2xs"
                  >
                    ✓ Confirm Payment
                  </button>
                  <button
                    onClick={() => {
                      if (onStatusChange) onStatusChange(order.id, 'Cancelled')
                      toast.error(`Order ${order.id} marked Cancelled (Invalid UTR).`)
                    }}
                    className="py-2 px-3 bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5] text-[11px] font-bold rounded-md transition cursor-pointer text-center uppercase tracking-wider shadow-2xs"
                  >
                    ✕ Reject (Fake UTR)
                  </button>
                </div>
              )}
            </div>

            {/* WhatsApp Status Box */}
            <div className="bg-[#FAF8F5] border border-[#E5E2DC] p-4 rounded-xl shadow-2xs">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#25D366] flex items-center justify-center text-white shrink-0 shadow-2xs">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#1C1B1B]">
                    WhatsApp Status Update
                  </h4>
                  <p className="text-[10px] text-[#6E756F]">
                    Auto Sync: {currentStatus}
                  </p>
                </div>
              </div>

              <div className="bg-[#EAF5ED] border border-[#C6E6CE] p-3 rounded-lg text-xs font-hanken text-[#163422] leading-relaxed transition-all">
                {getWhatsAppMessage()}
              </div>
            </div>

            {/* Fulfillment Timeline */}
            <div>
              <h3 className="font-bold text-xs text-[#1C1B1B] uppercase tracking-wider mb-4">
                Fulfillment Timeline
              </h3>

              <div className="relative pl-6 space-y-6">
                {/* Vertical Connecting Line */}
                <div className="absolute left-2.25 top-2 bottom-2 w-0.5 bg-[#E5E2DC] z-0" />

                {timelineSteps.map((step, idx) => (
                  <div key={idx} className="relative flex items-start gap-3 z-10">
                    {/* Step Dot Icon */}
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center -ml-6 shrink-0 transition-all duration-300 ${
                      step.isCompleted 
                        ? 'bg-[#163422] text-white ring-4 ring-white shadow-2xs' 
                        : 'bg-white border-2 border-[#C2C8C0] text-transparent ring-4 ring-white'
                    }`}>
                      {step.isCompleted && <Check className="w-3 h-3 stroke-3" />}
                    </div>

                    {/* Step Content */}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold ${step.isCompleted ? 'text-[#163422]' : 'text-[#6E756F]'}`}>
                          {step.title}
                        </span>
                        {step.hasDropdown && (
                          <ChevronDown className="w-3.5 h-3.5 text-[#6E756F] cursor-pointer" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#6E756F] mt-0.5">
                        {step.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="p-6 border-t border-[#E5E2DC] space-y-2.5">
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="w-full py-3 bg-[#163422] hover:bg-[#0D2316] text-white font-bold text-xs rounded-md transition text-center uppercase tracking-[0.14em] cursor-pointer shadow-xs flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4 text-white" />
            <span>Download PDF Invoice</span>
          </button>

          <button
            onClick={handleContactCustomer}
            className="w-full py-3 bg-white border border-[#163422] hover:bg-gray-50 text-[#163422] font-bold text-xs rounded-md transition text-center uppercase tracking-[0.14em] cursor-pointer shadow-2xs"
          >
            CONTACT CUSTOMER
          </button>
        </div>
      </div>

      {/* Invoice Modal */}
      <OrderInvoiceModal
        isOpen={showInvoiceModal}
        order={order}
        onClose={() => setShowInvoiceModal(false)}
      />
    </>
  )
}

export default OrderDetails
