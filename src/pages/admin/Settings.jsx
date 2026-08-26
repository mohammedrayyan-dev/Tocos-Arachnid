import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { Save, ShieldCheck, Truck, CreditCard, Building, Search, RotateCcw, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useStoreSettings } from '../../context/StoreSettingsContext'
import ToggleSwitch from '../../components/common/ToggleSwitch'

const ALL_INDIAN_STATES = [
  "Tamil Nadu",
  "Kerala",
  "Karnataka",
  "Andhra Pradesh",
  "Telangana",
  "Maharashtra",
  "Delhi",
  "Gujarat",
  "West Bengal",
  "Puducherry",
  "Goa",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Madhya Pradesh",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep"
]

const Settings = () => {
  const { settings, updateSettings } = useStoreSettings()
  const [activeTab, setActiveTab] = useState('General')

  const [formData, setFormData] = useState(settings)
  const [isTouched, setIsTouched] = useState(false)
  const [stateSearch, setStateSearch] = useState('')

  // Sync settings when initially loaded from DB if user hasn't edited fields
  useEffect(() => {
    if (!isTouched && settings) {
      setFormData(settings)
    }
  }, [settings, isTouched])

  // Security Email Toggles matching Supabase Dashboard 1-to-1
  const [securityToggles, setSecurityToggles] = useState({
    passwordChanged: true,
    emailChanged: true,
    phoneChanged: true,
    signInLinked: false,
    signInRemoved: false,
    mfaAdded: false,
    mfaRemoved: false
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setIsTouched(true)
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleStateRateChange = (stateName, field, value) => {
    setIsTouched(true)
    setFormData(prev => {
      const currentRates = prev.stateShippingRates || {}
      const stateRates = currentRates[stateName] || {
        standard: Number(prev.standardShippingFee || 150),
        express: Number(prev.expressShippingFee || 250)
      }

      return {
        ...prev,
        stateShippingRates: {
          ...currentRates,
          [stateName]: {
            ...stateRates,
            [field]: Number(value) || 0
          }
        }
      }
    })
  }

  const handleApplyBaseToAll = () => {
    setIsTouched(true)
    const baseStd = Number(formData.standardShippingFee || 150)
    const baseExp = Number(formData.expressShippingFee || 250)

    const updatedRates = {}
    ALL_INDIAN_STATES.forEach(st => {
      updatedRates[st] = { standard: baseStd, express: baseExp }
    })

    setFormData(prev => ({
      ...prev,
      stateShippingRates: updatedRates
    }))
    toast.success('Applied base rates to all 36 Indian States & UTs!')
  }

  const handleToggleChange = (key, val) => {
    setSecurityToggles(prev => ({ ...prev, [key]: val }))
    toast.success('Successfully updated security settings')
  }

  const handleSave = (e) => {
    if (e) e.preventDefault()
    updateSettings(formData)
    setIsTouched(false)
    toast.success('Admin store settings saved successfully!')
  }

  const filteredStates = ALL_INDIAN_STATES.filter(st =>
    st.toLowerCase().includes(stateSearch.trim().toLowerCase())
  )

  return (
    <div className="flex flex-row w-full min-h-screen bg-[#FCF9F8]">
      <AdminSidebar currentPage="Settings" />

      <div className="ml-0 lg:ml-64 flex-1 p-4 sm:p-6 lg:p-10 pt-24 sm:pt-28 lg:pt-10 bg-[#FCF9F8] w-full min-w-0 font-hanken">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-[#E5E2DC]">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-libre font-bold text-[#163422] tracking-tight">
              Store Settings
            </h1>
            <p className="font-hanken text-xs font-semibold text-[#525B54] mt-1.5">
              Manage Conservatory Preferences, Payment Channels, State Rates & Security Toggles
            </p>
          </div>

          <button
            onClick={handleSave}
            className="px-6 py-3 bg-[#163422] hover:bg-[#0D2316] text-white rounded-md font-hanken font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-xs flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>SAVE CHANGES</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 lg:flex lg:flex-wrap items-center gap-2.5 mb-8 border-b border-[#E5E2DC] pb-4 font-hanken text-xs">
          {[
            { id: 'General', label: 'General Info', icon: Building },
            { id: 'Payment', label: 'Payment & UPI', icon: CreditCard },
            { id: 'Shipping', label: 'Shipping & Logistics', icon: Truck },
            { id: 'Security', label: 'Security & Email', icon: ShieldCheck }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2.5 rounded-md transition cursor-pointer text-center sm:text-left focus:outline-none outline-none select-none ${
                  activeTab === tab.id
                    ? 'bg-[#163422] text-white font-bold shadow-2xs'
                    : 'text-[#525B54] hover:text-[#163422] font-semibold bg-white sm:bg-transparent hover:bg-white border border-[#E5E2DC] sm:border-transparent'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Settings Form Body */}
        <div className="bg-white border border-[#E5E2DC] rounded-xl p-6 sm:p-8 shadow-xs max-w-5xl font-hanken">
          <form onSubmit={handleSave} className="space-y-6">
            {activeTab === 'General' && (
              <div className="space-y-5">
                <h3 className="font-libre text-2xl font-bold text-[#163422] mb-4">
                  General Conservatory Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold text-[#6E756F] uppercase tracking-[0.16em] mb-1.5">
                      CONSERVATORY NAME
                    </label>
                    <input
                      type="text"
                      name="storeName"
                      value={formData.storeName || ''}
                      onChange={handleChange}
                      className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded-md px-3.5 py-2.5 text-xs font-bold text-[#1C1B1B] focus:outline-none focus:border-[#163422]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#6E756F] uppercase tracking-[0.16em] mb-1.5">
                      CURRENCY
                    </label>
                    <input
                      type="text"
                      name="currency"
                      value={formData.currency || ''}
                      onChange={handleChange}
                      className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded-md px-3.5 py-2.5 text-xs text-[#1C1B1B] focus:outline-none focus:border-[#163422]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold text-[#6E756F] uppercase tracking-[0.16em] mb-1.5">
                      SUPPORT EMAIL
                    </label>
                    <input
                      type="email"
                      name="supportEmail"
                      value={formData.supportEmail || ''}
                      onChange={handleChange}
                      className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded-md px-3.5 py-2.5 text-xs text-[#1C1B1B] focus:outline-none focus:border-[#163422]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#6E756F] uppercase tracking-[0.16em] mb-1.5">
                      CONCIERGE WHATSAPP NUMBER
                    </label>
                    <input
                      type="text"
                      name="whatsappNumber"
                      value={formData.whatsappNumber || ''}
                      onChange={handleChange}
                      className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded-md px-3.5 py-2.5 text-xs text-[#1C1B1B] focus:outline-none focus:border-[#163422]"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Payment' && (
              <div className="space-y-5">
                <h3 className="font-libre text-2xl font-bold text-[#163422] mb-4">
                  Payment & UPI Gateway Config
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold text-[#6E756F] uppercase tracking-[0.16em] mb-1.5">
                      RECEIVING UPI VPA ID
                    </label>
                    <input
                      type="text"
                      name="upiId"
                      value={formData.upiId || ''}
                      onChange={handleChange}
                      placeholder="e.g. storename@okicici, 9876543210@ybl"
                      className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded-md px-3.5 py-2.5 text-xs font-bold text-[#1C1B1B] focus:outline-none focus:border-[#163422]"
                    />
                    <p className="text-[10px] text-[#6E756F] mt-1 font-medium">
                      Must be a valid bank UPI VPA (e.g. <code className="font-mono">name@okicici</code>, <code className="font-mono">number@ybl</code>).
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#6E756F] uppercase tracking-[0.16em] mb-1.5">
                      PAYEE MERCHANT NAME
                    </label>
                    <input
                      type="text"
                      name="payeeName"
                      value={formData.payeeName || ''}
                      onChange={handleChange}
                      placeholder="e.g. Tocos Arachnid"
                      className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded-md px-3.5 py-2.5 text-xs text-[#1C1B1B] focus:outline-none focus:border-[#163422]"
                    />
                    <p className="text-[10px] text-[#6E756F] mt-1 font-medium">
                      Merchant/Business name shown on customer payment screen.
                    </p>
                  </div>
                </div>

                {/* Custom Google Pay / PhonePe Static QR Code Image Upload/URL */}
                <div className="pt-4 border-t border-[#E5E2DC]">
                  <label className="block text-[10px] font-bold text-[#6E756F] uppercase tracking-[0.16em] mb-1.5">
                    OFFICIAL GOOGLE PAY / PHONEPE QR CODE IMAGE (URL OR UPLOAD)
                  </label>
                  <p className="text-xs text-[#525B54] mb-3">
                    Upload or paste your official QR Code image from your Google Pay, PhonePe, or Paytm Business app. Scanning your official QR guarantees 100% scan success across all Indian UPI banking apps!
                  </p>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <input
                      type="text"
                      name="qrCodeImage"
                      value={formData.qrCodeImage || ''}
                      onChange={handleChange}
                      placeholder="Paste Image URL or upload file below"
                      className="flex-1 bg-[#FAF8F5] border border-[#E5E2DC] rounded-md px-3.5 py-2.5 text-xs text-[#1C1B1B] focus:outline-none focus:border-[#163422]"
                    />

                    <label className="px-4 py-2.5 bg-[#163422] hover:bg-[#0D2316] text-white rounded-md text-xs font-bold transition cursor-pointer shrink-0">
                      Upload QR Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onload = (event) => {
                              setIsTouched(true)
                              setFormData(prev => ({ ...prev, qrCodeImage: event.target.result }))
                              toast.success('Official QR Code image loaded!')
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                      />
                    </label>
                  </div>

                  {formData.qrCodeImage && (
                    <div className="mt-3 p-3 bg-[#FAF8F5] border border-[#E5E2DC] rounded-lg inline-flex items-center gap-3">
                      <img src={formData.qrCodeImage} alt="QR Code Preview" className="w-20 h-20 object-contain rounded border border-[#E5E2DC]" />
                      <div>
                        <p className="text-xs font-bold text-[#163422]">Official QR Active</p>
                        <p className="text-[11px] text-[#525B54]">Customers will scan this exact QR at checkout.</p>
                        <button
                          type="button"
                          onClick={() => {
                            setIsTouched(true)
                            setFormData(prev => ({ ...prev, qrCodeImage: '' }))
                          }}
                          className="text-[10px] text-red-600 font-bold hover:underline mt-1 cursor-pointer"
                        >
                          Remove QR Image
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SHIPPING & LOGISTICS TAB WITH THRESHOLD HERO ON TOP & STATE-WISE RATES TABLE */}
            {activeTab === 'Shipping' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-libre text-2xl font-bold text-[#163422]">
                    Climate-Controlled Shipping Rules
                  </h3>
                  <p className="text-xs text-[#525B54] mt-1">
                    Set global threshold and state-specific climate-controlled courier rates across all Indian States & Union Territories.
                  </p>
                </div>

                {/* Free Shipping Threshold Hero Card on Top */}
                <div className="bg-[#EAF5ED] border border-[#C6E6CE] p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
                  <div>
                    <label className="block text-[11px] font-bold text-[#163422] uppercase tracking-wider mb-1">
                      FREE SHIPPING THRESHOLD (₹)
                    </label>
                    <p className="text-xs text-[#525B54]">
                      Orders equal to or exceeding this total subtotal receive free climate-controlled shipping.
                    </p>
                  </div>

                  <div className="w-full sm:w-48 shrink-0">
                    <input
                      type="text"
                      name="freeShippingThreshold"
                      value={formData.freeShippingThreshold || ''}
                      onChange={handleChange}
                      placeholder="5000"
                      className="w-full bg-white border border-[#163422] rounded-md px-4 py-2.5 text-base font-bold text-[#163422] focus:outline-none focus:ring-2 focus:ring-[#163422]/20"
                    />
                  </div>
                </div>

                {/* Base Shipping Rates & Bulk Apply Section */}
                <div className="bg-[#FAF8F5] border border-[#E5E2DC] p-4 rounded-xl space-y-4">
                  <h4 className="text-xs font-bold text-[#163422] uppercase tracking-wider">
                    Base All-India Shipping Rates
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#6E756F] uppercase tracking-wider mb-1">
                        DEFAULT STANDARD SHIPPING FEE (₹)
                      </label>
                      <input
                        type="text"
                        name="standardShippingFee"
                        value={formData.standardShippingFee || ''}
                        onChange={handleChange}
                        placeholder="150"
                        className="w-full bg-white border border-[#E5E2DC] rounded-md px-3.5 py-2 text-xs font-bold text-[#1C1B1B] focus:outline-none focus:border-[#163422]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#6E756F] uppercase tracking-wider mb-1">
                        DEFAULT EXPRESS SHIPPING FEE (₹)
                      </label>
                      <input
                        type="text"
                        name="expressShippingFee"
                        value={formData.expressShippingFee || ''}
                        onChange={handleChange}
                        placeholder="250"
                        className="w-full bg-white border border-[#E5E2DC] rounded-md px-3.5 py-2 text-xs font-bold text-[#1C1B1B] focus:outline-none focus:border-[#163422]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleApplyBaseToAll}
                      className="px-4 py-2 bg-white border border-[#163422] text-[#163422] hover:bg-[#163422] hover:text-white rounded-md text-xs font-bold transition cursor-pointer flex items-center gap-2 shadow-2xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Apply Base Rates to All 36 States</span>
                    </button>
                  </div>
                </div>

                {/* State-Wise Shipping Rates Grid / Table */}
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <h4 className="text-xs font-bold text-[#163422] uppercase tracking-wider">
                      State-Specific Shipping Rate Rules ({ALL_INDIAN_STATES.length} States & UTs)
                    </h4>

                    {/* Search State Filter */}
                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6E756F]" />
                      <input
                        type="text"
                        value={stateSearch}
                        onChange={(e) => setStateSearch(e.target.value)}
                        placeholder="Search state or UT..."
                        className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded-md pl-8 pr-3 py-1.5 text-xs text-[#1C1B1B] focus:outline-none focus:border-[#163422]"
                      />
                    </div>
                  </div>

                  <div className="border border-[#E5E2DC] rounded-xl overflow-hidden shadow-2xs bg-white max-h-96 overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-[#FAF8F5] border-b border-[#E5E2DC] text-[#6E756F] uppercase tracking-wider font-bold text-[10px] sticky top-0 z-10">
                        <tr>
                          <th className="py-3 px-4">State / Territory</th>
                          <th className="py-3 px-4">Standard Rate (₹)</th>
                          <th className="py-3 px-4">Express Rate (₹)</th>
                          <th className="py-3 px-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E2DC]">
                        {filteredStates.map((st) => {
                          const stateConfig = formData.stateShippingRates?.[st]
                          const stdFee = stateConfig?.standard !== undefined ? stateConfig.standard : (formData.standardShippingFee || 150)
                          const expFee = stateConfig?.express !== undefined ? stateConfig.express : (formData.expressShippingFee || 250)
                          const isCustom = stateConfig?.standard !== undefined || stateConfig?.express !== undefined

                          return (
                            <tr key={st} className="hover:bg-[#FAF8F5]/60 transition">
                              <td className="py-2.5 px-4 font-bold text-[#163422]">
                                {st}
                              </td>
                              <td className="py-2 px-4">
                                <input
                                  type="text"
                                  value={stdFee}
                                  onChange={(e) => handleStateRateChange(st, 'standard', e.target.value)}
                                  className="w-24 bg-[#FAF8F5] border border-[#E5E2DC] rounded-md px-2.5 py-1 text-xs font-semibold text-[#1C1B1B] focus:outline-none focus:border-[#163422]"
                                />
                              </td>
                              <td className="py-2 px-4">
                                <input
                                  type="text"
                                  value={expFee}
                                  onChange={(e) => handleStateRateChange(st, 'express', e.target.value)}
                                  className="w-24 bg-[#FAF8F5] border border-[#E5E2DC] rounded-md px-2.5 py-1 text-xs font-semibold text-[#1C1B1B] focus:outline-none focus:border-[#163422]"
                                />
                              </td>
                              <td className="py-2.5 px-4 text-right">
                                {isCustom ? (
                                  <span className="inline-flex items-center gap-1 bg-[#EAF5ED] text-[#163422] font-bold text-[10px] px-2 py-0.5 rounded-full border border-[#C6E6CE]">
                                    <Check className="w-3 h-3" /> Custom
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-[#6E756F] font-semibold">
                                    Default
                                  </span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY TOGGLES MATCHING SUPABASE DASHBOARD 1-TO-1 */}
            {activeTab === 'Security' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5E2DC]">
                  <div>
                    <h3 className="font-libre text-2xl font-bold text-[#163422]">
                      Security & Notification Rules
                    </h3>
                    <p className="text-xs text-[#525B54] mt-1">
                      Toggle email notification triggers for user authentication events
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <ToggleSwitch
                    label="Password changed"
                    description="Notify users when their password has been changed"
                    checked={securityToggles.passwordChanged}
                    onChange={(val) => handleToggleChange('passwordChanged', val)}
                  />

                  <ToggleSwitch
                    label="Email address changed"
                    description="Notify users when their email address has been changed"
                    checked={securityToggles.emailChanged}
                    onChange={(val) => handleToggleChange('emailChanged', val)}
                  />

                  <ToggleSwitch
                    label="Phone number changed"
                    description="Notify users when their phone number has been changed"
                    checked={securityToggles.phoneChanged}
                    onChange={(val) => handleToggleChange('phoneChanged', val)}
                  />

                  <ToggleSwitch
                    label="Sign-in method linked"
                    description="Notify users when a sign-in method has been linked to their account"
                    checked={securityToggles.signInLinked}
                    onChange={(val) => handleToggleChange('signInLinked', val)}
                  />

                  <ToggleSwitch
                    label="Sign-in method removed"
                    description="Notify users when a sign-in method has been removed from their account"
                    checked={securityToggles.signInRemoved}
                    onChange={(val) => handleToggleChange('signInRemoved', val)}
                  />

                  <ToggleSwitch
                    label="MFA method added"
                    description="Notify users when an MFA method has been added to their account"
                    checked={securityToggles.mfaAdded}
                    onChange={(val) => handleToggleChange('mfaAdded', val)}
                  />

                  <ToggleSwitch
                    label="MFA method removed"
                    description="Notify users when an MFA method has been removed from their account"
                    checked={securityToggles.mfaRemoved}
                    onChange={(val) => handleToggleChange('mfaRemoved', val)}
                  />
                </div>
              </div>
            )}

          </form>
        </div>
      </div>
    </div>
  )
}

export default Settings
