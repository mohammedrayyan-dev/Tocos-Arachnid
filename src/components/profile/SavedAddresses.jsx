import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { MapPin, Plus } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const SavedAddresses = ({ user }) => {
  const [addresses, setAddresses] = useState(user?.user_metadata?.addresses || [])

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        if (user?.id) {
          if (user.user_metadata?.addresses && Array.isArray(user.user_metadata.addresses)) {
            setAddresses(user.user_metadata.addresses)
          } else {
            const { data: prof } = await supabase.from('profiles').select('addresses').eq('id', user.id).maybeSingle()
            if (prof?.addresses && Array.isArray(prof.addresses)) {
              setAddresses(prof.addresses)
            }
          }
        }
      } catch (e) {}
    }
    loadAddresses()
  }, [user])

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    type: 'Home',
    street: '',
    area: '',
    zipCode: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const saveAddressesToStorage = async (newList) => {
    setAddresses(newList)
    if (user?.id) {
      try {
        await supabase.from('profiles').upsert([{ id: user.id, email: user.email, addresses: newList }], { onConflict: 'id' })
        await supabase.auth.updateUser({ data: { addresses: newList } })
      } catch (e) {
        console.warn("Supabase address save notice:", e)
      }
    }
  }

  const handleAddAddress = (e) => {
    e.preventDefault()
    if (!formData.street || !formData.area || !formData.zipCode) {
      toast.error('Please fill in all fields')
      return
    }

    if (editingId) {
      const updated = addresses.map(addr => 
        addr.id === editingId ? { ...addr, ...formData } : addr
      )
      saveAddressesToStorage(updated)
      toast.success('Address updated successfully!')
    } else {
      const newAddress = {
        id: Date.now(),
        ...formData,
        isDefault: addresses.length === 0
      }
      const updated = [...addresses, newAddress]
      saveAddressesToStorage(updated)
      toast.success('Address added successfully!')
    }

    setFormData({ type: 'Home', street: '', area: '', zipCode: '' })
    setShowAddModal(false)
    setEditingId(null)
  }

  const handleDeleteAddress = (id) => {
    const updated = addresses.filter(a => a.id !== id)
    if (updated.length > 0 && !updated.some(a => a.isDefault)) {
      updated[0].isDefault = true
    }
    saveAddressesToStorage(updated)
    toast.success('Address removed')
  }

  const handleSetDefault = (id) => {
    const updated = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    }))
    saveAddressesToStorage(updated)
    toast.success('Default shipping address updated!')
  }

  const handleEdit = (address) => {
    setFormData({
      type: address.type,
      street: address.street,
      area: address.area,
      zipCode: address.zipCode
    })
    setEditingId(address.id)
    setShowAddModal(true)
  }

  return (
    <div className="bg-white border border-[#E5E2DC] rounded-md p-5 flex flex-col gap-4 shadow-xs mt-4 font-hanken">
      <div className="flex justify-between items-center">
        <h2 className="font-libre text-2xl font-bold text-[#1C1B1B]">
          Saved Shipping Addresses
        </h2>
        <button
          onClick={() => {
            setFormData({ type: 'Home', street: '', area: '', zipCode: '' })
            setEditingId(null)
            setShowAddModal(true)
          }}
          className="font-hanken text-xs font-semibold text-[#163422] underline hover:text-black cursor-pointer flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5 text-[#163422]" />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Addresses Grid or Empty State */}
      {addresses.length === 0 ? (
        <div className="bg-[#FAF8F5] border border-dashed border-[#E5E2DC] rounded-md p-8 text-center flex flex-col items-center justify-center gap-2">
          <MapPin className="w-8 h-8 text-[#6E756F]" />
          <p className="font-hanken font-bold text-sm text-[#1C1B1B]">
            No Saved Shipping Addresses
          </p>
          <p className="font-hanken text-xs text-[#6E756F] max-w-sm">
            Add a shipping address to enable fast 1-click checkout for your orders.
          </p>
          <button
            onClick={() => {
              setFormData({ type: 'Home', street: '', area: '', zipCode: '' })
              setEditingId(null)
              setShowAddModal(true)
            }}
            className="mt-2 px-4 py-2 bg-[#163422] text-white font-bold text-xs rounded-md hover:bg-[#0d2316] transition cursor-pointer"
          >
            + Add Shipping Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`rounded-md p-4 flex flex-col justify-between min-h-37.5 ${
                address.isDefault 
                  ? 'border-2 border-[#163422] bg-white' 
                  : 'border border-[#E5E2DC] bg-[#FAF8F5]'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-hanken font-bold text-sm text-[#163422]">
                    {address.type}
                  </h3>
                  {address.isDefault && (
                    <span className="bg-[#163422] text-white px-2 py-0.5 rounded text-[10px] font-hanken font-bold uppercase tracking-wider">
                      DEFAULT
                    </span>
                  )}
                </div>

                <div className="text-[#525B54] font-hanken text-xs space-y-0.5 leading-relaxed">
                  <p>{address.street}</p>
                  <p>{address.area}</p>
                  <p>{address.zipCode}</p>
                </div>
              </div>

              <div className="flex gap-4 pt-3 mt-2">
                <button
                  onClick={() => handleEdit(address)}
                  className="font-hanken text-xs font-semibold text-[#163422] underline cursor-pointer hover:text-black"
                >
                  Edit
                </button>
                {address.isDefault ? (
                  <button
                    onClick={() => handleDeleteAddress(address.id)}
                    className="font-hanken text-xs font-semibold text-[#991B1B] underline cursor-pointer hover:text-red-700"
                  >
                    Delete
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="font-hanken text-xs font-semibold text-[#163422] underline cursor-pointer hover:text-black"
                    >
                      Set as Default
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      className="font-hanken text-xs font-semibold text-[#991B1B] underline cursor-pointer hover:text-red-700"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Address Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-libre font-bold text-[#163422] mb-4">
              {editingId ? 'Edit Address' : 'Add New Address'}
            </h3>

            <form onSubmit={handleAddAddress} className="space-y-4">
              {/* Address Type */}
              <div>
                <label className="block text-xs font-hanken font-bold text-[#6E756F] uppercase tracking-wider mb-1.5">
                  Address Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 border border-[#E5E2DC] rounded-md font-hanken text-xs font-semibold text-[#1C1B1B] focus:outline-none focus:border-[#163422]"
                >
                  <option>Home</option>
                  <option>Office</option>
                  <option>Other</option>
                </select>
              </div>

              {/* Street */}
              <div>
                <label className="block text-xs font-hanken font-bold text-[#6E756F] uppercase tracking-wider mb-1.5">
                  Street Address
                </label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 border border-[#E5E2DC] rounded-md font-hanken text-xs text-[#1C1B1B] focus:outline-none focus:border-[#163422]"
                  placeholder="Street address (e.g. Flat 402, Green Valley)"
                  required
                />
              </div>

              {/* Area */}
              <div>
                <label className="block text-xs font-hanken font-bold text-[#6E756F] uppercase tracking-wider mb-1.5">
                  Area / City
                </label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 border border-[#E5E2DC] rounded-md font-hanken text-xs text-[#1C1B1B] focus:outline-none focus:border-[#163422]"
                  placeholder="Area or city (e.g. Indiranagar, Bengaluru)"
                  required
                />
              </div>

              {/* Zip Code */}
              <div>
                <label className="block text-xs font-hanken font-bold text-[#6E756F] uppercase tracking-wider mb-1.5">
                  State, Zip Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 border border-[#E5E2DC] rounded-md font-hanken text-xs text-[#1C1B1B] focus:outline-none focus:border-[#163422]"
                  placeholder="State, Zip Code (e.g. Karnataka, 560038)"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t border-[#E5E2DC]">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingId(null)
                  }}
                  className="flex-1 px-4 py-2 border border-[#E5E2DC] rounded-md font-hanken font-bold text-xs uppercase hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#163422] text-white rounded-md font-hanken font-bold text-xs uppercase hover:bg-[#0d2316] transition cursor-pointer"
                >
                  {editingId ? 'Update Address' : 'Add Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SavedAddresses
