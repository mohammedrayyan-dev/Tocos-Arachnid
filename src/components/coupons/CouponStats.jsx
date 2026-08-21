const CouponStats = ({ stats, onCreateClick }) => {
  const defaultStats = {
    active: '12',
    expired: '4',
    scheduled: '2'
  }

  const displayStats = stats || defaultStats

  return (
    <div className="mb-8 flex justify-between items-start">
      <div>
        <h1 className="text-5xl font-sand font-bold text-[#1a1a1a] mb-3">
          Coupon Management
        </h1>
        <div className="flex gap-6 text-sm">
          <p className="font-hanken text-gray-600">
            <span className="font-semibold text-gray-900">{displayStats.active}</span> Active
          </p>
          <p className="font-hanken text-gray-600">
            <span className="font-semibold text-gray-900">{displayStats.expired}</span> Expired
          </p>
          <p className="font-hanken text-gray-600">
            <span className="font-semibold text-gray-900">{displayStats.scheduled}</span> Scheduled
          </p>
        </div>
      </div>
      <button 
        onClick={onCreateClick}
        className="px-5 py-3 bg-[#003710] text-white rounded font-hanken font-bold text-sm hover:bg-[#002808] transition"
      >
        CREATE NEW COUPON
      </button>
    </div>
  )
}

export default CouponStats
