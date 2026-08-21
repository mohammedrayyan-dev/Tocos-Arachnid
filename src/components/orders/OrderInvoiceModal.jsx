import React from 'react'
import { X, Printer, Download, ShieldCheck, Tag } from 'lucide-react'
import TocoLogo from "/src/assets/image/tocos-logo.png"

const parsePrice = (p) => {
  if (p === null || p === undefined) return 0
  if (typeof p === 'number') return isNaN(p) ? 0 : p
  const clean = String(p).replace(/,/g, '').replace(/[^\d.]/g, '')
  const num = parseFloat(clean)
  return isNaN(num) ? 0 : num
}

const OrderInvoiceModal = ({ isOpen, order, onClose }) => {
  if (!isOpen || !order) return null

  const orderId = order.id || order.order_id || order.orderId || '#TA-89241'
  const customerName = order.customer || order.shipping_name || order.customer_name || order.recipient || 'Valued Customer'
  const email = order.email || order.customer_email || 'Not provided'
  const phone = order.phone || order.phone_number || order.customer_phone || 'Not provided'
  
  // Format full address string cleanly
  let fullAddress = order.address || order.shipping_address || ''
  const city = order.city || order.shipping_city || order.city_state || ''
  const zip = order.zip || order.shipping_zip || order.postal_code || ''

  if (city && !fullAddress.includes(city)) {
    fullAddress += fullAddress ? `, ${city}` : city
  }
  if (zip && !fullAddress.includes(zip)) {
    fullAddress += fullAddress ? ` ${zip}` : zip
  }
  if (!fullAddress) fullAddress = 'Address on file'

  const status = order.status || 'Confirmed'
  const dateObj = order.createdAt || order.created_at ? new Date(order.createdAt || order.created_at) : new Date()
  const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  // Extract items list or create fallback item
  const itemsList = Array.isArray(order.items) && order.items.length > 0
    ? order.items
    : [
        {
          name: order.species || order.name || 'Conservatory Specimen Order',
          category: order.category || 'Live Specimen',
          scientific_name: order.scientific_name || '',
          quantity: order.quantity || 1,
          price: parsePrice(order.rawAmount || order.total_amount || order.amount)
        }
      ]

  const calculatedSubtotal = itemsList.reduce((acc, it) => {
    const qty = it.quantity || 1
    const unitP = parsePrice(it.price || it.discounted_price || it.unitPrice || 0)
    return acc + (unitP > 0 ? unitP * qty : 0)
  }, 0)

  const finalTotalNum = parsePrice(order.rawAmount || order.total_amount || order.amount) || calculatedSubtotal
  
  // Precise financial breakdown logic
  const shippingFeeNum = order.shipping_fee ?? order.shippingFee ?? (calculatedSubtotal > 0 && calculatedSubtotal < 5000 ? 150 : 0)
  const explicitDiscount = order.discount_amount ?? order.discountAmount ?? 0
  
  // Compute effective coupon discount if final total is less than subtotal + shipping
  const calculatedDiscount = Math.max(0, (calculatedSubtotal + shippingFeeNum) - finalTotalNum)
  const effectiveDiscountNum = explicitDiscount > 0 ? explicitDiscount : calculatedDiscount
  
  // Coupon code label
  const couponCode = order.coupon_code || order.couponCode || order.discount_code || order.coupon || (effectiveDiscountNum > 0 ? 'PROMO SAVINGS' : '')

  const handlePrint = () => {
    const windowPrint = window.open('', '_blank', 'width=850,height=950,toolbar=0,scrollbars=1,status=0')
    if (!windowPrint) return

    const itemsRowsHtml = itemsList.map((it) => {
      const name = it.name || it.products?.name || 'Specimen Item'
      const variant = it.scientific_name || it.category || it.sub_category || 'Standard Specimen'
      const qty = it.quantity || 1
      const unitP = parsePrice(it.price || it.products?.discounted_price || it.products?.price)
      const lineTotal = unitP > 0 ? (unitP * qty) : finalTotalNum

      return `
        <tr>
          <td style="padding: 12px 14px; border-bottom: 1px solid #E5E2DC; font-weight: bold; color: #1C1B1B;">${name}</td>
          <td style="padding: 12px 14px; border-bottom: 1px solid #E5E2DC; color: #525B54;">${variant}</td>
          <td style="padding: 12px 14px; border-bottom: 1px solid #E5E2DC; text-align: center; font-weight: bold;">${qty}</td>
          <td style="padding: 12px 14px; border-bottom: 1px solid #E5E2DC; text-align: right;">₹ ${unitP > 0 ? unitP.toLocaleString('en-IN') : finalTotalNum.toLocaleString('en-IN')}</td>
          <td style="padding: 12px 14px; border-bottom: 1px solid #E5E2DC; text-align: right; font-weight: bold; color: #163422;">₹ ${lineTotal.toLocaleString('en-IN')}</td>
        </tr>
      `
    }).join('')

    windowPrint.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${orderId} - Toco's Arachnid</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1C1B1B; background: #fff; padding: 36px; font-size: 13px; line-height: 1.5; }
            .header-bar { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; border-bottom: 2px solid #163422; margin-bottom: 20px; }
            .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
            .brand-img { width: 32px; height: 32px; object-fit: contain; }
            .brand-title { font-family: Georgia, serif; font-size: 24px; font-weight: bold; color: #163422; }
            .subtext { font-size: 11px; color: #525B54; margin-top: 2px; }
            .status-badge { background: #EAF5ED; color: #163422; border: 1px solid #C6E6CE; padding: 4px 10px; font-size: 10px; font-weight: bold; border-radius: 4px; display: inline-block; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
            .order-id { font-family: Georgia, serif; font-size: 18px; font-weight: bold; color: #1C1B1B; }
            .grid-details { display: flex; justify-content: space-between; gap: 16px; background: #FAF8F5; border: 1px solid #E5E2DC; border-radius: 8px; padding: 16px; margin: 20px 0; }
            .col { width: 48%; }
            .label { font-size: 10px; font-weight: bold; color: #6E756F; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
            .val-title { font-weight: bold; font-size: 14px; color: #1C1B1B; }
            .val-desc { color: #525B54; font-size: 12px; line-height: 1.4; }
            .items-table { width: 100%; border-collapse: collapse; border: 1px solid #E5E2DC; border-radius: 8px; overflow: hidden; margin: 20px 0; }
            .items-table th { background: #FAF8F5; border-bottom: 1px solid #E5E2DC; padding: 10px 14px; font-size: 10px; font-weight: bold; color: #6E756F; text-transform: uppercase; letter-spacing: 0.1em; text-align: left; }
            .summary-box { display: flex; justify-content: flex-end; margin: 20px 0; }
            .summary-table { width: 320px; }
            .summary-row { display: flex; justify-content: space-between; font-size: 12px; color: #6E756F; padding: 4px 0; }
            .summary-total { display: flex; justify-content: space-between; font-size: 15px; font-weight: bold; color: #163422; border-top: 1px solid #E5E2DC; padding-top: 8px; margin-top: 6px; }
            .coupon-row { background: #FEE2E2; color: #991B1B; padding: 6px 10px; border-radius: 6px; margin: 4px 0; font-weight: bold; }
            .guarantee-policy { border-top: 1px solid #E5E2DC; padding-top: 16px; font-size: 11px; color: #6E756F; margin-top: 24px; }
            .guarantee-title { font-weight: bold; color: #163422; margin-bottom: 4px; }
          </style>
        </head>
        <body>
          <div class="header-bar">
            <div>
              <div class="brand">
                <img src="${TocoLogo}" class="brand-img" alt="Toco Logo" />
                <span class="brand-title">Toco's Arachnid</span>
              </div>
              <p class="subtext">Arachne Elite Conservatory • Hosur, Tamil Nadu</p>
              <p class="subtext">GSTIN: 33ABCDE1234F1ZH • Contact: support@tocos.com</p>
            </div>
            <div style="text-align: right;">
              <span class="status-badge">INVOICE PAID (${status.toUpperCase()})</span>
              <p class="order-id">${orderId}</p>
              <p style="font-size: 11px; color: #6E756F; margin-top: 2px;">Date: ${formattedDate}</p>
            </div>
          </div>

          <div class="grid-details">
            <div class="col">
              <p class="label">BILLED TO / CUSTOMER DETAILS</p>
              <p class="val-title">${customerName}</p>
              <p class="val-desc">${email}</p>
              <p class="val-desc">${phone}</p>
            </div>
            <div class="col">
              <p class="label">CLIMATE-CONTROLLED SHIPPING ADDRESS</p>
              <p class="val-desc" style="font-weight: 600; color: #1C1B1B;">${fullAddress}</p>
              <p style="font-size: 11px; color: #163422; font-weight: bold; margin-top: 6px;">🛡️ Live Arrival Guarantee Active</p>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>SPECIMEN / ITEM DESCRIPTION</th>
                <th>VARIANT / DETAILS</th>
                <th style="text-align: center;">QTY</th>
                <th style="text-align: right;">UNIT PRICE</th>
                <th style="text-align: right;">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRowsHtml}
            </tbody>
          </table>

          <div class="summary-box">
            <div class="summary-table">
              <div class="summary-row">
                <span>Item Subtotal (${itemsList.reduce((sum, i) => sum + (i.quantity || 1), 0)} items):</span>
                <span style="font-weight: 600; color: #1C1B1B;">₹ ${calculatedSubtotal > 0 ? calculatedSubtotal.toLocaleString('en-IN') : finalTotalNum.toLocaleString('en-IN')}</span>
              </div>
              <div class="summary-row">
                <span>Climate Express Shipping:</span>
                <span style="font-weight: 600; color: ${shippingFeeNum > 0 ? '#1C1B1B' : '#163422'};">
                  ${shippingFeeNum > 0 ? `₹ ${shippingFeeNum.toLocaleString('en-IN')}` : 'FREE (₹ 0)'}
                </span>
              </div>
              ${effectiveDiscountNum > 0 ? `
                <div class="summary-row coupon-row">
                  <span>Applied Coupon (${couponCode}):</span>
                  <span>- ₹ ${effectiveDiscountNum.toLocaleString('en-IN')}</span>
                </div>
              ` : ''}
              <div class="summary-row">
                <span>Taxes & Live Packaging:</span>
                <span style="font-weight: 600; color: #1C1B1B;">Included</span>
              </div>
              <div class="summary-total">
                <span>TOTAL AMOUNT PAID:</span>
                <span>₹ ${finalTotalNum.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div class="guarantee-policy">
            <p class="guarantee-title">🌿 Toco's Arachnid Guarantee Policy:</p>
            <p>Specimens are shipped in insulated heat/cool packs. Report any live arrival issues within 2 hours of package delivery with unboxing video proof.</p>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 250);
            }
          </script>
        </body>
      </html>
    `)
    windowPrint.document.close()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-hanken">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Controls Header */}
        <div className="px-4 sm:px-6 py-4 bg-[#FAF8F5] border-b border-[#E5E2DC] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#163422]" />
            <h2 className="text-lg sm:text-xl font-libre font-bold text-[#163422]">
              Official Order Invoice
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-3 sm:px-4 py-2 bg-[#163422] hover:bg-[#0D2316] text-white rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs transition"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button onClick={onClose} className="p-1 text-[#6E756F] hover:text-[#163422] cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Area */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1">
          {/* Header Box */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b-2 border-[#163422]">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <img src={TocoLogo} alt="Toco Logo" className="w-7 h-7 object-contain" />
                <span className="font-libre text-2xl font-bold text-[#163422]">
                  Toco's Arachnid
                </span>
              </div>
              <p className="text-xs text-[#525B54]">
                Arachne Elite Conservatory • Hosur, Tamil Nadu
              </p>
              <p className="text-xs text-[#525B54]">
                GSTIN: 33ABCDE1234F1ZH • Contact: support@tocos.com
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="bg-[#EAF5ED] text-[#163422] px-3 py-1 rounded text-xs font-bold uppercase tracking-wider inline-block mb-1.5 border border-[#C6E6CE]">
                INVOICE PAID ({status.toUpperCase()})
              </span>
              <p className="text-lg font-libre font-bold text-[#1C1B1B]">
                {orderId}
              </p>
              <p className="text-xs text-[#6E756F]">
                Date: {formattedDate}
              </p>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 my-6 p-4 bg-[#FAF8F5] border border-[#E5E2DC] rounded-xl text-xs">
            <div>
              <p className="text-[10px] font-bold text-[#6E756F] uppercase tracking-wider mb-1">
                BILLED TO / CUSTOMER DETAILS
              </p>
              <p className="font-bold text-[#1C1B1B] text-sm">{customerName}</p>
              <p className="text-[#525B54]">{email}</p>
              <p className="text-[#525B54]">{phone}</p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-[#6E756F] uppercase tracking-wider mb-1">
                CLIMATE-CONTROLLED SHIPPING ADDRESS
              </p>
              <p className="text-[#1C1B1B] font-semibold leading-relaxed">{fullAddress}</p>
              <div className="flex items-center gap-1 text-[11px] text-[#163422] font-bold mt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Live Arrival Guarantee Active</span>
              </div>
            </div>
          </div>

          {/* Dynamic Line Items Table */}
          <div className="border border-[#E5E2DC] rounded-lg overflow-x-auto my-6">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E5E2DC] text-[10px] font-bold text-[#6E756F] uppercase tracking-wider">
                  <th className="px-4 py-3">SPECIMEN / ITEM DESCRIPTION</th>
                  <th className="px-4 py-3">VARIANT / DETAILS</th>
                  <th className="px-4 py-3 text-center">QTY</th>
                  <th className="px-4 py-3 text-right">UNIT PRICE</th>
                  <th className="px-4 py-3 text-right">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2DC]">
                {itemsList.map((it, idx) => {
                  const name = it.name || it.products?.name || 'Specimen Item'
                  const variant = it.scientific_name || it.category || it.sub_category || 'Standard Specimen'
                  const qty = it.quantity || 1
                  const unitP = parsePrice(it.price || it.products?.discounted_price || it.products?.price)
                  const lineTotal = unitP > 0 ? (unitP * qty) : finalTotalNum

                  return (
                    <tr key={idx}>
                      <td className="px-4 py-3.5 font-bold text-[#1C1B1B]">
                        {name}
                      </td>
                      <td className="px-4 py-3.5 text-[#525B54]">
                        {variant}
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold">{qty}</td>
                      <td className="px-4 py-3.5 text-right font-semibold">
                        ₹ {unitP > 0 ? unitP.toLocaleString('en-IN') : finalTotalNum.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-[#163422]">
                        ₹ {lineTotal.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Detailed Financial Breakdown */}
          <div className="flex justify-end my-6">
            <div className="w-72 space-y-2.5 text-xs font-hanken">
              <div className="flex justify-between text-[#6E756F]">
                <span>Item Subtotal ({itemsList.reduce((sum, i) => sum + (i.quantity || 1), 0)} items):</span>
                <span className="font-semibold text-[#1C1B1B]">
                  ₹ {calculatedSubtotal > 0 ? calculatedSubtotal.toLocaleString('en-IN') : finalTotalNum.toLocaleString('en-IN')}
                </span>
              </div>
              
              <div className="flex justify-between text-[#6E756F]">
                <span>Climate Express Shipping:</span>
                <span className={`font-semibold ${shippingFeeNum > 0 ? 'text-[#1C1B1B]' : 'text-[#163422]'}`}>
                  {shippingFeeNum > 0 ? `₹ ${shippingFeeNum.toLocaleString('en-IN')}` : 'FREE (₹ 0)'}
                </span>
              </div>

              {effectiveDiscountNum > 0 && (
                <div className="flex justify-between items-center text-[#991B1B] bg-[#FEE2E2] px-2.5 py-1.5 rounded-md border border-[#FCA5A5] font-bold">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Applied Coupon ({couponCode}):</span>
                  </span>
                  <span>- ₹ {effectiveDiscountNum.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-[#6E756F]">
                <span>Taxes & Live Packaging:</span>
                <span className="font-semibold text-[#1C1B1B]">Included</span>
              </div>

              <div className="border-t-2 border-[#163422] pt-2.5 flex justify-between text-sm font-bold text-[#163422]">
                <span>TOTAL AMOUNT PAID:</span>
                <span>₹ {finalTotalNum.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Guarantee & Terms Footer Notice */}
          <div className="pt-6 border-t border-[#E5E2DC] text-[11px] text-[#6E756F] space-y-1">
            <p className="font-bold text-[#163422]">
              🌿 Toco's Arachnid Guarantee Policy:
            </p>
            <p>
              Specimens are shipped in insulated heat/cool packs. Report any live arrival issues within 2 hours of package delivery with unboxing video proof.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderInvoiceModal
