import { toast } from 'sonner'
import { Calendar, Download } from 'lucide-react'

const DashboardHeader = () => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 className="text-4xl lg:text-5xl font-libre font-bold text-[#163422] tracking-tight">
          Overview Dashboard
        </h1>
        <p className="text-sm font-hanken text-[#525B54] mt-1.5">
          Welcome back. Your arachnid conservatory is thriving today.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={() => toast.info('Filtering analytics for Last 30 Days')}
          className="px-4 py-2.5 bg-[#FAF8F5] border border-[#E5E2DC] text-[#163422] rounded-md hover:bg-gray-100 font-hanken text-xs font-bold flex items-center gap-2 cursor-pointer transition shadow-2xs"
        >
          <Calendar className="w-3.5 h-3.5 text-[#163422]" />
          <span>Last 30 Days</span>
        </button>

        <button 
          onClick={() => toast.success('Exporting overview dashboard data (CSV)...')}
          className="px-4 py-2.5 bg-[#163422] hover:bg-[#0D2316] text-white rounded-md font-hanken text-xs font-bold flex items-center gap-2 cursor-pointer transition shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-white" />
          <span>Export Data</span>
        </button>
      </div>
    </div>
  )
}

export default DashboardHeader
