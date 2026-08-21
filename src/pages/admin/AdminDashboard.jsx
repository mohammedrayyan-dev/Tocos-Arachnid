import AdminSidebar from "../../components/admin/AdminSidebar"
import DashboardHeader from "../../components/dashboard/DashboardHeader"
import StatsCards from "../../components/dashboard/StatsCards"
import RevenueAnalytics from "../../components/dashboard/RevenueAnalytics"
import RecentOrdersActivity from "../../components/dashboard/RecentOrdersActivity"
import SpecimenOfMonth from "../../components/dashboard/SpecimenOfMonth"
import LowStockAlerts from "../../components/dashboard/LowStockAlerts"
import SalesPerformance from "../../components/dashboard/SalesPerformance"

const AdminDashboard = () => {
  return (
    <div className="flex flex-row w-full min-h-screen bg-[#FCF9F8]">

      {/* Admin Sidebar */}
      <AdminSidebar currentPage="Dashboard" />

      {/* Main Admin Dashboard Content Area */}
      <div className="ml-0 lg:ml-64 flex-1 p-4 sm:p-6 lg:p-10 pt-24 sm:pt-28 lg:pt-10 bg-[#FCF9F8] w-full min-w-0">
        <DashboardHeader />
        <StatsCards />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column (2/3 width) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <RevenueAnalytics />
            <RecentOrdersActivity />
          </div>
          
          {/* Right Column (1/3 width) */}
          <div className="flex flex-col gap-6">
            <SpecimenOfMonth />
            <LowStockAlerts />
            <SalesPerformance />
          </div>
        </div>
      </div>

    </div>
  )
}

export default AdminDashboard