const AdminProductCard = ({ product, isSelected }) => {
  const {
    image,
    isFeatured,
    isHidden,
    originTag,
    name,
    price,
    commonName,
    stockCount,
    isArchived,
    refNumber
  } = product

  return (
    <div className={`bg-white rounded-xl overflow-hidden transition duration-200 flex flex-col justify-between ${
      isSelected 
        ? 'border-2 border-blue-500 shadow-md ring-2 ring-blue-100' 
        : 'border border-[#E5E2DC] shadow-2xs hover:shadow-xs'
    }`}>
      <div>
        {/* Specimen Thumbnail Container */}
        <div className="relative overflow-hidden bg-[#FAF8F5] h-52">
          <img
            src={image}
            alt={name}
            className={`w-full h-full object-cover transition duration-300 ${isHidden ? 'opacity-60 grayscale-30' : ''}`}
          />

          {/* Badges Container */}
          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
            {isFeatured && (
              <span className="bg-[#163422]/95 backdrop-blur-xs text-white font-hanken font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded shadow-2xs">
                FEATURED
              </span>
            )}

            {isHidden && (
              <span className="bg-gray-200/90 backdrop-blur-xs text-[#525B54] font-hanken font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded">
                HIDDEN
              </span>
            )}

            {originTag && (
              <span className="bg-white/95 backdrop-blur-xs text-[#1C1B1B] font-hanken font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded shadow-2xs">
                {originTag}
              </span>
            )}
          </div>
        </div>

        {/* Card Content */}
        <div className="p-5">
          <div className="flex justify-between items-start gap-2 mb-1">
            <h3 className="font-libre font-bold text-xl text-[#163422] leading-tight">
              {name}
            </h3>
            <span className="font-hanken font-bold text-xs md:text-sm text-[#1C1B1B] shrink-0">
              {price}
            </span>
          </div>

          <p className="font-hanken text-xs text-[#525B54] mb-4 leading-relaxed">
            {commonName}
          </p>
        </div>
      </div>

      {/* Card Footer Divider */}
      <div className="px-5 pb-4 pt-3 border-t border-[#E5E2DC] flex items-center justify-between font-hanken text-xs">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${isArchived ? 'bg-gray-400' : 'bg-[#163422]'}`} />
          <span className={`font-semibold ${isArchived ? 'text-[#6E756F]' : 'text-[#1C1B1B]'}`}>
            {isArchived ? 'Archived' : `In Stock (${stockCount})`}
          </span>
        </div>

        <span className="font-hanken text-[10px] text-[#6E756F]">
          Ref: {refNumber}
        </span>
      </div>
    </div>
  )
}

export default AdminProductCard
