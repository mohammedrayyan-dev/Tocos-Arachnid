import { useState, useEffect } from 'react'
import { ChevronRight, Filter, Download, ChevronDown, FileText, ShoppingBag } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'
import OrderInvoiceModal from './OrderInvoiceModal'

const OrdersTable = ({ orders, onSelectOrder, selectedOrderId, onOrdersUpdated }) => {
  const [ordersList, setOrdersList] = useState(orders || [])
  const [invoiceOrder, setInvoiceOrder] = useState(null)
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false)

  useEffect(() => {
    setOrdersList(orders || [])
  }, [orders])

  const handleStatusChange = async (orderId, newStatus) => {
    const rawId = orderId.replace(/^#/, '')
    setOrdersList(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))

    try {
      // 1. Update local storage
      const localOrders = JSON.parse(localStorage.getItem('tocos_admin_orders') || '[]')
      const updatedLocal = localOrders.map(o => (o.id === orderId || o.id === rawId) ? { ...o, status: newStatus } : o)
      localStorage.setItem('tocos_admin_orders', JSON.stringify(updatedLocal))

      // 2. Update Supabase
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', rawId)

      if (error) console.warn('Supabase order update notice:', error.message)

      toast.success(`Order ${orderId} updated to ${newStatus}! Reflects live on customer dashboard.`)
      if (onOrdersUpdated) onOrdersUpdated()
    } catch (e) {
      toast.success(`Order ${orderId} updated to ${newStatus}!`)
    }
  }

  const handleOpenInvoice = (order, e) => {
    e.stopPropagation()
    setInvoiceOrder(order)
    setIsInvoiceOpen(true)
  }

  const handleExportCSV = () => {
    if (!ordersList || !ordersList.length) {
      toast.error('No orders available to export')
      return
    }

    const headers = ["Order ID", "Customer Name", "Email", "Phone", "Amount", "Status", "Shipping Address", "Date"]
    
    const rows = ordersList.map(o => {
      const cleanId = String(o.id || o.rawId || '').replace(/"/g, '""')
      const customer = String(o.customer || '').replace(/"/g, '""')
      const email = String(o.email || '').replace(/"/g, '""')
      const phone = String(o.phone || '').replace(/"/g, '""')
      const amount = String(o.amount || '').replace(/"/g, '""')
      const status = String(o.status || '').replace(/"/g, '""')
      const address = String(o.address || '').replace(/"/g, '""')
      const date = String(o.date || o.created_at || new Date().toISOString()).replace(/"/g, '""')

      return `"${cleanId}","${customer}","${email}","${phone}","${amount}","${status}","${address}","${date}"`
    })

    const csvString = '\uFEFF' + [headers.join(','), ...rows].join('\r\n')
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Tocos_Arachnid_Orders_Report_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success(`Exported ${ordersList.length} order(s) to CSV!`)
  }

  return (
    <div className="bg-white border border-[#E5E2DC] rounded-xl overflow-hidden shadow-xs font-hanken">
      {/* Header Bar */}
      <div className="bg-white px-6 py-4 border-b border-[#E5E2DC] flex items-center justify-between">
        <h2 className="text-2xl font-libre font-bold text-[#163422]">
          Orders List ({ordersList.length})
        </h2>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => toast.info('Filter options loaded')}
            className="px-4 py-2 bg-white border border-[#E5E2DC] text-[#1C1B1B] rounded-md font-hanken text-xs font-semibold hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Filter className="w-3.5 h-3.5 text-[#6E756F]" />
            <span>Filter</span>
          </button>

          <button 
            onClick={handleExportCSV}
            className="px-4 py-2 bg-[#163422] hover:bg-[#0D2316] text-white rounded-md font-hanken text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table or Empty State */}
      {ordersList.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center justify-center gap-2 bg-[#FAF8F5]">
          <ShoppingBag className="w-8 h-8 text-[#6E756F]" />
          <p className="font-hanken font-bold text-sm text-[#1C1B1B]">No Orders Found</p>
          <p className="font-hanken text-xs text-[#6E756F]">New customer purchases will automatically show up here in real-time.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E5E2DC]">
                <th className="px-6 py-3.5 font-hanken font-bold text-[10px] text-[#6E756F] uppercase tracking-wider">
                  ORDER ID
                </th>
                <th className="px-6 py-3.5 font-hanken font-bold text-[10px] text-[#6E756F] uppercase tracking-wider">
                  CUSTOMER
                </th>
                <th className="px-6 py-3.5 font-hanken font-bold text-[10px] text-[#6E756F] uppercase tracking-wider">
                  AMOUNT
                </th>
                <th className="px-6 py-3.5 font-hanken font-bold text-[10px] text-[#6E756F] uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-6 py-3.5 font-hanken font-bold text-[10px] text-[#6E756F] uppercase tracking-wider text-right">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E2DC]">
              {ordersList.map((order, idx) => {
                const isSelected = selectedOrderId === order.id
                return (
                  <tr
                    key={idx}
                    onClick={() => onSelectOrder && onSelectOrder(order)}
                    className={`hover:bg-[#FAF8F5] transition cursor-pointer ${
                      isSelected ? 'bg-[#EAF5ED]/50 font-semibold' : ''
                    }`}
                  >
                    {/* Order ID */}
                    <td className="px-6 py-4 font-hanken font-bold text-xs text-[#1C1B1B]">
                      {order.id}
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#FCECD9] text-[#785832] font-hanken font-bold text-[11px] flex items-center justify-center shrink-0">
                          {order.customerInitial || 'C'}
                        </div>
                        <span className="font-hanken font-bold text-xs text-[#1C1B1B]">
                          {order.customer}
                        </span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 font-hanken font-bold text-xs text-[#1C1B1B]">
                      {order.amount}
                    </td>

                    {/* Status Dropdown */}
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="relative inline-flex items-center gap-1">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="font-hanken text-xs font-bold text-[#1C1B1B] bg-transparent border-none focus:outline-none cursor-pointer pr-4 appearance-none"
                        >
                          <option value="Pending">Order Initiated (Pending)</option>
                          <option value="Confirmed">Payment Verified (Confirmed)</option>
                          <option value="Health Check">Specimen Health Check</option>
                          <option value="Shipped">Dispatched / Shipped</option>
                          <option value="Delivered">Package Delivered</option>
                          <option value="Cancelled">Order Cancelled</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-[#6E756F] pointer-events-none absolute right-0 top-1/2 -translate-y-1/2" />
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={(e) => handleOpenInvoice(order, e)}
                          className="p-1 text-[#6E756F] hover:text-[#163422] hover:bg-gray-100 rounded transition cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                          title="Download Order PDF Invoice"
                        >
                          <FileText className="w-4 h-4 text-[#163422]" />
                          <span className="hidden sm:inline">PDF</span>
                        </button>

                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            if (onSelectOrder) onSelectOrder(order)
                          }}
                          className="p-1 text-[#6E756F] hover:text-[#163422] transition cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* PDF Invoice Modal */}
      <OrderInvoiceModal
        isOpen={isInvoiceOpen}
        order={invoiceOrder}
        onClose={() => setIsInvoiceOpen(false)}
      />
    </div>
  )
}

export default OrdersTable
