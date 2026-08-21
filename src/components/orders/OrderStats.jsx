import { Clock, BadgeCheck, Truck, CheckCircle } from 'lucide-react'

const OrderStats = ({ liveCounts, orders = [] }) => {
  const pendingCount = liveCounts?.pending ?? orders.filter(o => o.status === 'Pending').length
  const confirmedCount = liveCounts?.confirmed ?? orders.filter(o => o.status === 'Confirmed' || o.status === 'Processing' || o.status === 'Health Check').length
  const shippedCount = liveCounts?.shipped ?? orders.filter(o => o.status === 'Shipped').length
  const deliveredCount = liveCounts?.delivered ?? orders.filter(o => o.status === 'Delivered').length

  const stats = [
    {
      label: 'INITIATED / PENDING',
      value: pendingCount,
      change: 'Awaiting UTR Check',
      Icon: Clock,
      iconColor: 'text-[#785832]'
    },
    {
      label: 'CONFIRMED / VERIFIED',
      value: confirmedCount,
      change: 'Payment Verified',
      Icon: BadgeCheck,
      iconColor: 'text-[#163422]'
    },
    {
      label: 'DISPATCHED / SHIPPED',
      value: shippedCount,
      change: 'In Transit',
      Icon: Truck,
      iconColor: 'text-[#163422]'
    },
    {
      label: 'DELIVERED',
      value: deliveredCount,
      change: 'Delivered',
      Icon: CheckCircle,
      iconColor: 'text-[#163422]'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {stats.map((stat, idx) => {
        const Icon = stat.Icon
        return (
          <div 
            key={idx} 
            className="bg-white border border-[#E5E2DC] rounded-xl p-5 shadow-2xs hover:shadow-xs transition duration-200"
          >
            <div className="flex justify-between items-start mb-3">
              <Icon className={`w-5 h-5 ${stat.iconColor}`} />
              <span className="font-hanken text-[11px] font-semibold text-[#6E756F]">
                {stat.change}
              </span>
            </div>

            <p className="text-[#6E756F] text-[10px] font-hanken font-bold uppercase tracking-[0.16em] mb-1">
              {stat.label}
            </p>
            <p className="text-3xl font-libre font-bold text-[#163422]">
              {stat.value}
            </p>
          </div>
        )
      })}
    </div>
  )
}

export default OrderStats
