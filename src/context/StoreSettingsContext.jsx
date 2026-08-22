import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const envUpiId = import.meta.env.VITE_UPI_ID

const DEFAULT_SETTINGS = {
  storeName: "Toco's Arachnid",
  supportEmail: "support@tocosarachnid.com",
  whatsappNumber: "+91 98765 43210",
  currency: "INR (₹)",
  upiId: envUpiId || "9360435317@okbizaxis",
  payeeName: "Tocos Arachnid",
  standardShippingFee: "150",
  expressShippingFee: "250",
  freeShippingThreshold: "5000",
  enableRazorpay: false,
  requireHealthCheck: true,
  enableAutoEmailReceipts: true
}

const StoreSettingsContext = createContext()

export const StoreSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('tocos_store_settings')
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS
    } catch (e) {
      return DEFAULT_SETTINGS
    }
  })

  // Load from local settings fallback, skipping DB query if table doesn't exist
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('*')
          .maybeSingle()

        if (!error && data) {
          const merged = {
            storeName: data.store_name || DEFAULT_SETTINGS.storeName,
            supportEmail: data.support_email || DEFAULT_SETTINGS.supportEmail,
            whatsappNumber: data.whatsapp_number || DEFAULT_SETTINGS.whatsappNumber,
            currency: data.currency || DEFAULT_SETTINGS.currency,
            upiId: data.upi_id || DEFAULT_SETTINGS.upiId,
            payeeName: data.payee_name || DEFAULT_SETTINGS.payeeName,
            standardShippingFee: data.standard_shipping_fee || DEFAULT_SETTINGS.standardShippingFee,
            expressShippingFee: data.express_shipping_fee || DEFAULT_SETTINGS.expressShippingFee,
            freeShippingThreshold: data.free_shipping_threshold || DEFAULT_SETTINGS.freeShippingThreshold,
            enableRazorpay: data.enable_razorpay ?? DEFAULT_SETTINGS.enableRazorpay,
            requireHealthCheck: data.require_health_check ?? DEFAULT_SETTINGS.requireHealthCheck,
            enableAutoEmailReceipts: data.enable_auto_email_receipts ?? DEFAULT_SETTINGS.enableAutoEmailReceipts
          }
          setSettings(merged)
          localStorage.setItem('tocos_store_settings', JSON.stringify(merged))
        }
      } catch (e) {
        // Table not present in DB, use default settings silently
      }
    }

    fetchSettings()
  }, [])

  const updateSettings = async (newSettings) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)
    localStorage.setItem('tocos_store_settings', JSON.stringify(updated))

    // Persist to Supabase DB
    try {
      await supabase.from('store_settings').upsert([{
        id: 1,
        store_name: updated.storeName,
        support_email: updated.supportEmail,
        whatsapp_number: updated.whatsappNumber,
        currency: updated.currency,
        upi_id: updated.upiId,
        payee_name: updated.payeeName,
        standard_shipping_fee: updated.standardShippingFee,
        express_shipping_fee: updated.expressShippingFee,
        free_shipping_threshold: updated.freeShippingThreshold,
        enable_razorpay: updated.enableRazorpay,
        require_health_check: updated.requireHealthCheck,
        enable_auto_email_receipts: updated.enableAutoEmailReceipts
      }])
    } catch (e) {
      console.warn('DB settings save notice:', e)
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
