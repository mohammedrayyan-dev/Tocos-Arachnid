const ProductStats = ({ stats }) => {
  const defaultStats = {
    totalSpecimens: '142',
    activeListings: '138'
  }

  const displayStats = stats || defaultStats

  return (
    <div className="mb-8">
      <h1 className="text-4xl font-sand font-bold text-[#1a1a1a] mb-2">
        Product Management
      </h1>
      <p className="text-gray-600 font-hanken text-sm">
        Total Specimens: <span className="font-semibold">{displayStats.totalSpecimens}</span> · Active Listings: <span className="font-semibold">{displayStats.activeListings}</span>
      </p>
    </div>
  )
}

export default ProductStats
