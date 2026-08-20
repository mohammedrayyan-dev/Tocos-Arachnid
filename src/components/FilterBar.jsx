const filterConfig = [
  {
    key: "species",
    label: "SPECIES",
    options: ["All Species", "Terrestrial", "Arboreal", "Fossorial"]
  },
  {
    key: "priceRange",
    label: "PRICE RANGE",
    options: ["All Prices", "Under ₹1,000", "₹1,000 - ₹3,000", "₹3,000 - ₹5,000", "Over ₹5,000"]
  },
  {
    key: "temperament",
    label: "TEMPERAMENT",
    options: ["Any", "Docile", "Skittish", "Defensive"]
  },
  {
    key: "careLevel",
    label: "CARE LEVEL",
    options: ["All Levels", "Beginner", "Intermediate", "Advanced"]
  }
]

const sortConfig = {
  key: "sortBy",
  label: "SORT BY",
  options: ["Newest Arrivals", "Price: Low to High", "Price: High to Low", "Name: A to Z"]
}

const FilterBar = ({ selected = {}, onSelect }) => {
  return (
    <div className="bg-[#F4F2EE] border border-[#E3E0DA] rounded-md p-5 lg:p-6 mb-8 w-full shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
      
      {/* Left Filter Options */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:flex-wrap items-center gap-4 lg:gap-6 w-full lg:w-auto">
        {filterConfig.map((f) => (
          <div key={f.key} className="flex flex-col gap-1.5 w-full sm:w-auto min-w-0">
            <label className="font-hanken text-[10px] font-bold text-[#6E756F] uppercase tracking-[0.18em]">
              {f.label}
            </label>
            <div className="relative">
              <select
                value={selected[f.key] || f.options[0]}
                onChange={(e) => onSelect(f.key, e.target.value)}
                className="w-full bg-white border border-[#E3E0DA] rounded-md px-3.5 py-2 pr-8 font-hanken text-xs font-semibold text-[#1C1B1B] focus:outline-none focus:border-[#163422] shadow-xs appearance-none cursor-pointer"
              >
                {f.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {/* Chevron Down Icon */}
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#525B54] text-[10px]">
                ▼
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Right Sort By Option */}
      <div className="flex flex-col gap-1.5 min-w-[150px] md:ml-auto">
        <label className="font-hanken text-[10px] font-bold text-[#6E756F] uppercase tracking-[0.18em]">
          {sortConfig.label}
        </label>
        <div className="relative">
          <select
            value={selected[sortConfig.key] || sortConfig.options[0]}
            onChange={(e) => onSelect(sortConfig.key, e.target.value)}
            className="w-full bg-white border border-[#E3E0DA] rounded-md px-3.5 py-2 pr-8 font-hanken text-xs font-semibold text-[#1C1B1B] focus:outline-none focus:border-[#163422] shadow-xs appearance-none cursor-pointer"
          >
            {sortConfig.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {/* Chevron Down Icon */}
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#525B54] text-[10px]">
            ▼
          </div>
        </div>
      </div>

    </div>
  )
}

export default FilterBar