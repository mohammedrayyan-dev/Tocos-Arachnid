import { useState } from 'react'
import { X, Truck, PackageCheck, MapPin, CheckCircle2, Clock, RefreshCw, ShieldCheck } from 'lucide-react'
import beginnerTarantula from '../../assets/image/beginner-tarantula-care.webp'
import mexicanRedKnee from '../../assets/image/mexican-red-knee.webp'
import brazilianBlack from '../../assets/image/brazilian-black.webp'

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

const ShipmentTrackingModal = ({ isOpen, order, onClose, onRefresh }) => {
  const [refreshing, setRefreshing] = useState(false)

  if (!isOpen || !order) return null

  const orderId = order.id || '#AF-479-XBB'
  const trackingNumber = `AWB-${orderId.replace(/[^a-zA-Z0-9]/g, '')}-CLIMATE`
  const status = (order.status || 'Pending').trim()
  const destination = order.address || order.state || 'Indiranagar, Bengaluru'
  const items = Array.isArray(order.items) && order.items.length > 0 ? order.items : [
    {
      name: 'Conservatory Specimen Order',
      quantity: 1,
      category: 'Live Specimen'
    }
  ]

  const getStepStatus = (stepIndex) => {
    // Step 0: Order Initiated
    // Step 1: Payment Verified
    // Step 2: Specimen Health Check
    // Step 3: Dispatched & Shipped
    // Step 4: Delivered
    const statusLower = status.toLowerCase()
    if (statusLower === 'delivered') return 'completed'
    if (statusLower === 'shipped') {
      return stepIndex <= 3 ? (stepIndex === 3 ? 'active' : 'completed') : 'upcoming'
    }
    if (statusLower === 'health check') {
      return stepIndex <= 2 ? (stepIndex === 2 ? 'active' : 'completed') : 'upcoming'
    }
    if (statusLower === 'confirmed' || statusLower === 'processing') {
      return stepIndex <= 1 ? (stepIndex === 1 ? 'active' : 'completed') : 'upcoming'
    }
    // Pending (Order Initiated)
    return stepIndex === 0 ? 'active' : 'upcoming'
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    if (onRefresh) await onRefresh()
    setTimeout(() => setRefreshing(false), 500)
  }

  const timelineSteps = [
    {
      title: '1. Order Initiated',
      subtitle: 'Submitted UTR transaction ID — awaiting concierge payment verification',
      icon: Clock,
      stepIdx: 0
    },
    {
      title: '2. Payment Verified & Confirmed',
      subtitle: 'Payment verified in bank account & queued for specimen inspection',
      icon: PackageCheck,
      stepIdx: 1
    },
    {
      title: '3. Specimen Health Check & Thermal Packaging',
      subtitle: 'Our naturalists conduct vitality assessment & 72-hr climate-controlled packaging',
      icon: ShieldCheck,
      stepIdx: 2
    },
    {
      title: '4. Dispatched via Express Live Cargo',
      subtitle: 'In transit via Delhivery Specialized Live Animal Express Courier',
      icon: Truck,
      stepIdx: 3
    },
    {
      title: '5. Delivered to Destination',
      subtitle: 'Handed over at customer address with 100% Live Arrival Guarantee',
      icon: MapPin,
      stepIdx: 4
    }
  ]

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-hanken">
      <div className="bg-white rounded-xl max-w-xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-[#E5E2DC]">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#E5E2DC] flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <Truck className="w-5 h-5 text-[#163422]" />
            <div>
              <h2 className="text-lg font-libre font-bold text-[#163422] leading-none">
                Shipment Live Tracking
              </h2>
              <p className="text-[11px] text-[#6E756F] mt-0.5">
                Tracking ID: <span className="font-mono font-bold text-[#1C1B1B]">{trackingNumber}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-[#163422] hover:bg-[#EAF5ED] rounded-md transition cursor-pointer disabled:opacity-50"
              title="Refresh live status"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#6E756F] hover:text-[#163422] rounded-md transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[80vh] space-y-6">
          {/* Order Header Summary Card */}
          <div className="bg-[#FAF8F5] border border-[#E5E2DC] p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-[#6E756F] uppercase tracking-wider">
                Order Number
              </p>
              <p className="font-libre font-bold text-base text-[#163422]">
                {orderId}
              </p>
              <p className="text-xs text-[#525B54] mt-0.5 leading-relaxed break-words">
                Destination: <strong className="text-[#1C1B1B]">{destination}</strong>
              </p>
            </div>

            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                status.toLowerCase() === 'delivered'
                  ? 'bg-[#EAF5ED] text-[#163422] border border-[#C6E6CE]'
                  : status.toLowerCase() === 'shipped' || status.toLowerCase() === 'confirmed'
                  ? 'bg-[#EAF5ED] text-[#163422] border border-[#C6E6CE]'
                  : 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
              }`}>
                {status}
              </span>
              <p className="text-[11px] text-[#6E756F] mt-1">
                Carrier: <strong className="text-[#163422]">Delhivery Express</strong>
              </p>
            </div>
          </div>

          {/* Shipment Progress Stepper Timeline */}
          <div>
            <h3 className="text-xs font-bold text-[#6E756F] uppercase tracking-wider mb-4">
              Real-Time Tracking Progress
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5E2DC]">
              {timelineSteps.map((step, idx) => {
                const stepState = getStepStatus(step.stepIdx)
                const IconComponent = step.icon

                return (
                  <div key={idx} className="relative flex items-start gap-4">
                    {/* Circle Node */}
                    <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs transition ${
                      stepState === 'completed'
                        ? 'bg-[#163422] text-white shadow-xs'
                        : stepState === 'active'
                        ? 'bg-[#FCECD9] border-2 border-[#785832] text-[#785832] animate-pulse'
                        : 'bg-white border-2 border-[#E5E2DC] text-[#9CA3AF]'
                    }`}>
                      {stepState === 'completed' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-current" />
                      )}
                    </div>

                    <div>
                      <h4 className={`font-bold text-xs ${
                        stepState === 'upcoming' ? 'text-[#9CA3AF]' : 'text-[#163422]'
                      }`}>
                        {step.title}
                      </h4>
                      <p className="text-[11px] text-[#525B54] mt-0.5 leading-relaxed">
                        {step.subtitle}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Package Items List */}
          <div className="border-t border-[#E5E2DC] pt-5">
            <h3 className="text-xs font-bold text-[#6E756F] uppercase tracking-wider mb-3">
              Items in Package ({items.length})
            </h3>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-[#FAF8F5] p-3 rounded-md border border-[#E5E2DC]">
                  <img
                    src={getImageSrc(item)}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-md border border-[#E5E2DC] shrink-0"
                    onError={(e) => {
                      e.currentTarget.src = beginnerTarantula
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-libre font-bold text-sm text-[#163422] truncate">
                      {item.name || item.products?.name}
                    </p>
                    <p className="text-xs text-[#525B54]">
                      {item.category || item.subDetails || 'Live Specimen'} • <strong className="text-[#163422]">Qty: {item.quantity || 1}</strong>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Arrival Guarantee Footer Notice */}
          <div className="bg-[#EAF5ED] border border-[#C6E6CE] p-3.5 rounded-lg flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#163422] shrink-0" />
            <p className="text-xs text-[#163422] font-semibold">
              Live Arrival Guarantee Active: All shipments are monitored with 72-hour temperature logging.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#FAF8F5] border-t border-[#E5E2DC] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#163422] hover:bg-[#0D2316] text-white font-bold text-xs uppercase tracking-wider rounded-md transition cursor-pointer"
          >
            Close Tracking
          </button>
        </div>
      </div>
    </div>
  )
}

export default ShipmentTrackingModal
