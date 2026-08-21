import { useState } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import InventoryStats from '../../components/inventory/InventoryStats'
import InventoryFilters from '../../components/inventory/InventoryFilters'
import InventoryTable from '../../components/inventory/InventoryTable'
import { Plus, Download } from 'lucide-react'
import { toast } from 'sonner'

const Inventory = () => {
  const handleExportCSV = () => {
    toast.success('Inventory dataset exported as CSV!')
  }

  const handleAddNewStock = () => {
    toast.info('Opening Add New Stock modal...')
  }

  return (
    <div className="flex flex-row w-full min-h-screen bg-[#FCF9F8]">

      {/* Admin Sidebar */}
      <AdminSidebar currentPage="Inventory" />

      {/* Main Content Area */}
      <div className="ml-0 lg:ml-64 flex-1 p-4 sm:p-6 lg:p-10 pt-24 sm:pt-28 lg:pt-10 bg-[#FCF9F8] w-full min-w-0 font-hanken">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 mb-8 pb-6 border-b border-[#E5E2DC]">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-libre font-bold text-[#163422] tracking-tight">
              Inventory Control
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-white border border-[#E5E2DC] text-[#1C1B1B] rounded-md hover:bg-gray-50 font-hanken text-xs font-bold flex items-center gap-2 cursor-pointer transition shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-[#1C1B1B]" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleAddNewStock}
              className="px-4 py-2.5 bg-[#163422] hover:bg-[#0D2316] text-white rounded-md font-hanken text-xs font-bold flex items-center gap-2 cursor-pointer transition shadow-xs"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Add New Stock</span>
            </button>
          </div>
        </div>

        {/* Top 4 Stat Cards */}
        <InventoryStats />

        {/* Filter Controls Bar */}
        <InventoryFilters />

        {/* Main Inventory Table */}
        <InventoryTable />
      </div>

    </div>
  )
}

export default Inventory
