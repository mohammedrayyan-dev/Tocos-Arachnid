import { useState, useEffect } from 'react'

const PersonalDetails = ({ user, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || user?.user_metadata?.name || (user?.email ? user.email.split('@')[0] : ''),
    email: user?.email || '',
    phone: user?.user_metadata?.phone || user?.phone || ''
  })

  useEffect(() => {
    if (user && !isEditing) {
      setFormData({
        fullName: user?.user_metadata?.full_name || user?.user_metadata?.name || (user?.email ? user.email.split('@')[0] : ''),
        email: user?.email || '',
        phone: user?.user_metadata?.phone || user?.phone || ''
      })
    }
  }, [user, isEditing])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await onEdit(formData)
    } finally {
      setSaving(false)
      setIsEditing(false)
    }
  }

  return (
    <div className="bg-white border border-[#E5E2DC] rounded-md p-5 flex flex-col justify-between h-full shadow-xs font-hanken">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-libre text-2xl font-bold text-[#1C1B1B]">
            Personal Details
          </h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="font-hanken text-xs font-semibold text-[#163422] underline hover:text-black cursor-pointer"
            >
              Edit
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-hanken font-semibold text-[#6E756F] uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              disabled={!isEditing}
              className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E5E2DC] rounded-md font-hanken text-sm text-[#1C1B1B] focus:outline-none focus:border-[#163422] disabled:opacity-90"
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-hanken font-semibold text-[#6E756F] uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={true}
              className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E5E2DC] rounded-md font-hanken text-sm text-[#1C1B1B] disabled:opacity-75 cursor-not-allowed"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-hanken font-semibold text-[#6E756F] uppercase tracking-wider mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Add phone number"
              disabled={!isEditing}
              className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E5E2DC] rounded-md font-hanken text-sm text-[#1C1B1B] focus:outline-none focus:border-[#163422] disabled:opacity-90"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      {isEditing && (
        <div className="flex gap-4 pt-4 mt-4">
          <button
            onClick={() => setIsEditing(false)}
            className="flex-1 px-4 py-2.5 border border-[#E5E2DC] rounded-md font-hanken font-semibold text-xs text-[#525B54] hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2.5 bg-[#163422] text-white rounded-md font-hanken font-semibold text-xs hover:bg-[#0d2316] transition cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  )
}

export default PersonalDetails
