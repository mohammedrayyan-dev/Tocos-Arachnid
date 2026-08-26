import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const envUpiId = import.meta.env.VITE_UPI_ID

const DEFAULT_STATE_RATES = {
  "Tamil Nadu": { standard: 150, express: 250 },
  "Kerala": { standard: 150, express: 250 },
  "Karnataka": { standard: 150, express: 250 },
  "Andhra Pradesh": { standard: 150, express: 250 },
  "Telangana": { standard: 150, express: 250 },
  "Maharashtra": { standard: 150, express: 250 },
  "Delhi": { standard: 150, express: 250 },
  "Gujarat": { standard: 150, express: 250 },
  "West Bengal": { standard: 150, express: 250 },
  "Puducherry": { standard: 150, express: 250 },
  "Goa": { standard: 150, express: 250 }
}

const DEFAULT_SETTINGS = {
  storeName: "Toco's Arachnid",
  supportEmail: "support@tocosarachnid.com",
  whatsappNumber: "+91 98765 43210",
  currency: "INR (₹)",
  upiId: envUpiId || "9360435317@okbizaxis",
  payeeName: "Tocos Arachnid",
  qrCodeImage: "",
  standardShippingFee: "150",
  expressShippingFee: "250",
  freeShippingThreshold: "5000",
  enableRazorpay: false,
  requireHealthCheck: true,
  enableAutoEmailReceipts: true,
  stateShippingRates: DEFAULT_STATE_RATES
}

const StoreSettingsContext = createContext()

export const StoreSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)

  // Fetch settings exclusively from Supabase DB table
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('*')
          .maybeSingle()

        if (!error && data) {
          setSettings(prev => ({
            ...prev,
            storeName: data.store_name || prev.storeName,
            supportEmail: data.support_email || prev.supportEmail,
            whatsappNumber: data.whatsapp_number || prev.whatsappNumber,
            currency: data.currency || prev.currency,
            upiId: data.upi_id || prev.upiId,
            payeeName: data.payee_name || prev.payeeName,
            qrCodeImage: data.qr_code_image || prev.qrCodeImage,
            standardShippingFee: data.standard_shipping_fee || prev.standardShippingFee,
            expressShippingFee: data.express_shipping_fee || prev.expressShippingFee,
            freeShippingThreshold: data.free_shipping_threshold || prev.freeShippingThreshold,
            enableRazorpay: data.enable_razorpay ?? prev.enableRazorpay,
            requireHealthCheck: data.require_health_check ?? prev.requireHealthCheck,
            enableAutoEmailReceipts: data.enable_auto_email_receipts ?? prev.enableAutoEmailReceipts,
            stateShippingRates: data.state_shipping_rates ? { ...DEFAULT_STATE_RATES, ...data.state_shipping_rates } : prev.stateShippingRates
          }))
        }
      } catch (e) {
        console.warn("Supabase settings fetch notice:", e)
      }
    }

    fetchSettings()
  }, [])

  const updateSettings = async (newSettings) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)

    // Save exclusively to Supabase DB
    try {
      const { error } = await supabase.from('store_settings').upsert([{
        id: 1,
        store_name: updated.storeName,
        support_email: updated.supportEmail,
        whatsapp_number: updated.whatsappNumber,
        currency: updated.currency,
        upi_id: updated.upiId,
        payee_name: updated.payeeName,
        qr_code_image: updated.qrCodeImage,
        standard_shipping_fee: updated.standardShippingFee,
        express_shipping_fee: updated.expressShippingFee,
        free_shipping_threshold: updated.freeShippingThreshold,
        enable_razorpay: updated.enableRazorpay,
        require_health_check: updated.requireHealthCheck,
        enable_auto_email_receipts: updated.enableAutoEmailReceipts,
        state_shipping_rates: updated.stateShippingRates
      }])
      if (error) console.error("Supabase settings upsert error:", error)
    } catch (err) {
      console.error("Supabase settings upsert exception:", err)
    }
  }

  return (
    <StoreSettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </StoreSettingsContext.Provider>
  )
}

export const useStoreSettings = () => {
  const context = useContext(StoreSettingsContext)
  if (!context) {
    return {
      settings: DEFAULT_SETTINGS,
      updateSettings: () => {}
    }
  }
  return context
}
