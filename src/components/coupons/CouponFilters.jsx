import { useState } from 'react'
import { Search } from 'lucide-react'

const CouponFilters = ({ onFilterChange, onSearch }) => {
  const [activeTab, setActiveTab] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const tabs = ['All', 'Active', 'Expired', 'Scheduled']

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    if (onFilterChange) onFilterChange(tab)
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    if (onSearch) onSearch(value)
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => handleTabClick(tab)}
            className={`px-4 py-2 rounded-md font-hanken text-xs transition cursor-pointer ${
              activeTab === tab
                ? 'bg-[#163422] text-white font-bold shadow-2xs'
                : 'text-[#525B54] hover:text-[#163422] font-semibold hover:bg-[#FAF8F5]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search Input Box */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search coupon codes..."
          className="bg-white border border-[#E5E2DC] hover:border-[#163422] focus:border-[#163422] rounded-md pl-9 pr-4 py-2 font-hanken text-xs text-[#1C1B1B] w-64 md:w-80 focus:outline-none transition shadow-2xs"
        />
        <Search className="w-3.5 h-3.5 text-[#6E756F] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  )
}

export default CouponFilters
