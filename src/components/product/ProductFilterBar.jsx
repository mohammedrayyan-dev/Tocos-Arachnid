import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'

const ProductFilterBar = ({ onFilterChange, onSortChange }) => {
  const [activeFilter, setActiveFilter] = useState('All')
  const [sortBy, setSortBy] = useState('Price')

  const filters = ['All', 'Old World', 'New World']

  const handleFilterClick = (filter) => {
    setActiveFilter(filter)
    if (onFilterChange) onFilterChange(filter)
  }

  const handleSortChange = (e) => {
    setSortBy(e.target.value)
    if (onSortChange) onSortChange(e.target.value)
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 font-hanken text-xs">
      {/* Filter Tabs Group */}
      <div className="bg-[#FAF8F5] border border-[#E5E2DC] rounded-lg p-1 flex items-center gap-1 shadow-2xs">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => handleFilterClick(filter)}
            className={`px-4 py-1.5 rounded-md transition font-semibold cursor-pointer ${
              activeFilter === filter
                ? 'bg-white text-[#163422] shadow-2xs font-bold'
                : 'text-[#6E756F] hover:text-[#1C1B1B]'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="bg-white border border-[#E5E2DC] hover:border-[#163422] rounded-md pl-9 pr-8 py-2 font-semibold text-[#1C1B1B] focus:outline-none cursor-pointer shadow-2xs appearance-none"
          >
            <option value="Price">Sort by: Price</option>
            <option value="Newest">Sort by: Newest</option>
            <option value="Name">Sort by: Name</option>
            <option value="Stock">Sort by: Stock</option>
          </select>
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#6E756F] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <svg className="w-3.5 h-3.5 text-[#6E756F] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default ProductFilterBar
