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
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('tocos_store_settings')
      if (saved) {
        const parsed = JSON.parse(saved)
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          stateShippingRates: parsed.stateShippingRates ? { ...DEFAULT_STATE_RATES, ...parsed.stateShippingRates } : DEFAULT_STATE_RATES
        }
      }
      return DEFAULT_SETTINGS
    } catch (e) {
      return DEFAULT_SETTINGS
    }
  })

  // Load from Supabase DB table, merging with local settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('*')
          .maybeSingle()

        if (!error && data) {
          setSettings(prev => {
            const savedLocal = localStorage.getItem('tocos_store_settings')
            const localParsed = savedLocal ? JSON.parse(savedLocal) : {}

            const merged = {
              ...prev,
              storeName: localParsed.storeName || data.store_name || prev.storeName,
              supportEmail: localParsed.supportEmail || data.support_email || prev.supportEmail,
              whatsappNumber: localParsed.whatsappNumber || data.whatsapp_number || prev.whatsappNumber,
              currency: localParsed.currency || data.currency || prev.currency,
              upiId: localParsed.upiId || data.upi_id || prev.upiId,
              payeeName: localParsed.payeeName || data.payee_name || prev.payeeName,
              qrCodeImage: localParsed.qrCodeImage || data.qr_code_image || prev.qrCodeImage,
              standardShippingFee: localParsed.standardShippingFee || data.standard_shipping_fee || prev.standardShippingFee,
              expressShippingFee: localParsed.expressShippingFee || data.express_shipping_fee || prev.expressShippingFee,
              freeShippingThreshold: localParsed.freeShippingThreshold || data.free_shipping_threshold || prev.freeShippingThreshold,
              enableRazorpay: localParsed.enableRazorpay ?? data.enable_razorpay ?? prev.enableRazorpay,
              requireHealthCheck: localParsed.requireHealthCheck ?? data.require_health_check ?? prev.requireHealthCheck,
              enableAutoEmailReceipts: localParsed.enableAutoEmailReceipts ?? data.enable_auto_email_receipts ?? prev.enableAutoEmailReceipts,
              stateShippingRates: localParsed.stateShippingRates || (data.state_shipping_rates ? { ...DEFAULT_STATE_RATES, ...data.state_shipping_rates } : prev.stateShippingRates)
            }
            localStorage.setItem('tocos_store_settings', JSON.stringify(merged))
            return merged
          })
        }
      } catch (e) {
        // Table not present in DB, fallback to local storage settings silently
      }
    }

    fetchSettings()
  }, [])

  const updateSettings = async (newSettings) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings }
      localStorage.setItem('tocos_store_settings', JSON.stringify(updated))

      // Async persist to Supabase DB
      supabase.from('store_settings').upsert([{
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
      }]).then(({ error }) => {
        if (error) console.warn('DB settings save notice:', error)
      }).catch(err => {
        console.warn('DB settings save catch:', err)
      })

      return updated
    })
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
