import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { Save, ShieldCheck, Truck, CreditCard, Building, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { useStoreSettings } from '../../context/StoreSettingsContext'
import ToggleSwitch from '../../components/common/ToggleSwitch'

const Settings = () => {
  const { settings, updateSettings } = useStoreSettings()
  const [activeTab, setActiveTab] = useState('General')

  const [formData, setFormData] = useState(settings)

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

  useEffect(() => {
    setFormData(settings)
  }, [settings])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleToggleChange = (key, val) => {
    setSecurityToggles(prev => ({ ...prev, [key]: val }))
    toast.success('Successfully updated security settings')
  }

  const handleSave = (e) => {
    e.preventDefault()
    updateSettings(formData)
    toast.success('Admin store settings updated successfully!')
  }

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
              Manage Conservatory Preferences, Payment Channels & Security Toggles
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
        <div className="bg-white border border-[#E5E2DC] rounded-xl p-6 sm:p-8 shadow-xs max-w-4xl font-hanken">
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
                      value={formData.storeName}
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
                      value={formData.currency}
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
                      value={formData.supportEmail}
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
                      value={formData.whatsappNumber}
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
                      value={formData.upiId}
                      onChange={handleChange}
                      className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded-md px-3.5 py-2.5 text-xs font-bold text-[#1C1B1B] focus:outline-none focus:border-[#163422]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#6E756F] uppercase tracking-[0.16em] mb-1.5">
                      PAYEE MERCHANT NAME
                    </label>
                    <input
                      type="text"
                      name="payeeName"
                      value={formData.payeeName}
                      onChange={handleChange}
                      className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded-md px-3.5 py-2.5 text-xs text-[#1C1B1B] focus:outline-none focus:border-[#163422]"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Shipping' && (
              <div className="space-y-5">
                <h3 className="font-libre text-2xl font-bold text-[#163422] mb-4">
                  Climate-Controlled Shipping Rules
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold text-[#6E756F] uppercase tracking-[0.16em] mb-1.5">
                      STANDARD SHIPPING FEE (₹)
                    </label>
                    <input
                      type="number"
                      name="standardShippingFee"
                      value={formData.standardShippingFee || 150}
                      onChange={handleChange}
                      className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded-md px-3.5 py-2.5 text-xs font-bold text-[#1C1B1B] focus:outline-none focus:border-[#163422]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#6E756F] uppercase tracking-[0.16em] mb-1.5">
                      EXPRESS SHIPPING FEE (₹)
                    </label>
                    <input
                      type="number"
                      name="expressShippingFee"
                      value={formData.expressShippingFee || 250}
                      onChange={handleChange}
                      className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded-md px-3.5 py-2.5 text-xs font-bold text-[#1C1B1B] focus:outline-none focus:border-[#163422]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#6E756F] uppercase tracking-[0.16em] mb-1.5">
                      FREE SHIPPING THRESHOLD (₹)
                    </label>
                    <input
                      type="number"
                      name="freeShippingThreshold"
                      value={formData.freeShippingThreshold || 5000}
                      onChange={handleChange}
                      className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded-md px-3.5 py-2.5 text-xs font-bold text-[#1C1B1B] focus:outline-none focus:border-[#163422]"
                    />
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

            <div className="pt-6 border-t border-[#E5E2DC] flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-[#163422] hover:bg-[#0D2316] text-white rounded-md font-hanken font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-xs flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>SAVE CHANGES</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Settings
