import { useState } from 'react'
import { SlidersHorizontal, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

const InventoryFilters = ({ onFilterChange }) => {
  const [type, setType] = useState('All Types')
  const [origin, setOrigin] = useState('All Origins')
  const [status, setStatus] = useState('All Stock')

  const handleReset = () => {
    setType('All Types')
    setOrigin('All Origins')
    setStatus('All Stock')
    toast.info('Filters reset to default')
    if (onFilterChange) onFilterChange({ type: 'All Types', origin: 'All Origins', status: 'All Stock' })
  }

  return (
    <div className="bg-white border border-[#E5E2DC] rounded-xl p-4 mb-6 shadow-2xs flex flex-wrap items-center justify-between gap-4 font-hanken text-xs">
      <div className="flex flex-wrap items-center gap-4">
        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#6E756F]">Type:</span>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value)
              if (onFilterChange) onFilterChange({ type: e.target.value, origin, status })
            }}
            className="bg-[#FAF8F5] border border-[#E5E2DC] rounded-md px-3 py-1.5 font-semibold text-[#1C1B1B] focus:outline-none cursor-pointer shadow-2xs"
          >
            <option>All Types</option>
            <option>Terrestrial</option>
            <option>Arboreal</option>
            <option>Fossorial</option>
          </select>
        </div>

        {/* Origin Filter */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#6E756F]">Origin:</span>
          <select
            value={origin}
            onChange={(e) => {
              setOrigin(e.target.value)
              if (onFilterChange) onFilterChange({ type, origin: e.target.value, status })
            }}
            className="bg-[#FAF8F5] border border-[#E5E2DC] rounded-md px-3 py-1.5 font-semibold text-[#1C1B1B] focus:outline-none cursor-pointer shadow-2xs"
          >
            <option>All Origins</option>
            <option>New World</option>
            <option>Old World</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#6E756F]">Status:</span>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              if (onFilterChange) onFilterChange({ type, origin, status: e.target.value })
            }}
            className="bg-[#FAF8F5] border border-[#E5E2DC] rounded-md px-3 py-1.5 font-semibold text-[#1C1B1B] focus:outline-none cursor-pointer shadow-2xs"
          >
            <option>All Stock</option>
            <option>In Stock</option>
            <option>Low Stock</option>
            <option>Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => toast.info('Advanced filtering panel opened')}
          className="flex items-center gap-1.5 text-[#163422] font-bold hover:underline cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Advanced Filters</span>
        </button>

        <button
          onClick={handleReset}
          title="Reset Filters"
          className="p-1.5 text-[#6E756F] hover:text-[#163422] rounded-md hover:bg-gray-100 transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

export default InventoryFilters
