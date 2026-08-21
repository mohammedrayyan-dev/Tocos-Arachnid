import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Container from '../../components/common/Container'
import PersonalDetails from '../../components/profile/PersonalDetails'
import Security from '../../components/profile/Security'
import SavedAddresses from '../../components/profile/SavedAddresses'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabase'

const DEFAULT_INDIAN_MALE_AVATAR = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80"

const Profile = () => {
  const { user, updateUserAvatar, setSessionUser } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [ordersCount, setOrdersCount] = useState(0)

  useEffect(() => {
    const fetchUserOrders = async () => {
      let dbCount = 0
      let localCount = 0

      if (user?.id || user?.email) {
        try {
          const userKey = user.id ? `user_orders_${user.id}` : `user_orders_${user.email}`
          const saved = localStorage.getItem(userKey)
          if (saved) {
            const arr = JSON.parse(saved)
            localCount = arr.length
          }
        } catch (e) {}

        try {
          let query = supabase.from('orders').select('*', { count: 'exact', head: true })
          if (user?.id) query = query.eq('user_id', user.id)

          const { count, error } = await query
          if (!error && count !== null) {
            dbCount = count
          }
        } catch (e) {
          console.warn('Orders count fetch notice:', e)
        }

        const safeDbCount = typeof dbCount === 'number' && !isNaN(dbCount) ? dbCount : 0
        const safeLocalCount = typeof localCount === 'number' && !isNaN(localCount) ? localCount : 0
        setOrdersCount(Math.max(safeDbCount, safeLocalCount))
      }
    }
    fetchUserOrders()
  }, [user])

  // Safely guard against missing user (handled by ProtectedRoute)
  if (!user) {
    return null
  }

  const avatarUrl = user?.user_metadata?.avatar_url || DEFAULT_INDIAN_MALE_AVATAR
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || (user?.email ? user.email.split('@')[0] : 'Member')

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result
        updateUserAvatar(base64String)
        toast.success('Profile picture updated successfully!')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEditPersonalDetails = async (formData) => {
    try {
      if (user?.id) {
        // 1. Immediately cache updated profile locally for 0ms instant persistence
        try {
          const profileCacheKey = `tocos_user_profile_${user.id}`
          localStorage.setItem(profileCacheKey, JSON.stringify({
            full_name: formData.fullName,
            phone: formData.phone,
            email: user.email
          }))
        } catch (e) {}

        // 2. Update Supabase public.profiles table
        try {
          const { error: updateErr } = await supabase
            .from('profiles')
            .update({
              full_name: formData.fullName,
              phone: formData.phone
            })
            .eq('id', user.id)

          if (updateErr) {
            console.warn("Profiles table update notice:", updateErr.message)
            // Fallback to upsert
            await supabase
              .from('profiles')
              .upsert({
                id: user.id,
                email: user.email,
                full_name: formData.fullName,
                phone: formData.phone
              }, { onConflict: 'id' })
          }
        } catch (dbErr) {
          console.warn("Profiles DB update exception:", dbErr)
        }

        // 3. Update Supabase Auth user metadata
        try {
          await supabase.auth.updateUser({
            data: {
              full_name: formData.fullName,
              name: formData.fullName,
              phone: formData.phone
            }
          })
        } catch (authErr) {}

        // 4. Instantly update active React user session state
        const updatedUser = {
          ...user,
          phone: formData.phone,
          user_metadata: {
            ...(user.user_metadata || {}),
            full_name: formData.fullName,
            name: formData.fullName,
            phone: formData.phone
          }
        }

        if (setSessionUser) {
          await setSessionUser(updatedUser)
        }
      }
      toast.success('Personal details updated & synced to database!')
    } catch (e) {
      console.error("Error updating details:", e)
      toast.error(e.message || 'Failed to update personal details')
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 font-hanken">
      <Container>
        {/* Profile Header */}
        <div className="bg-white border border-[#E5E2DC] rounded-md p-4 sm:p-6 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto min-w-0">
            {/* Avatar Container with Upload Overlay */}
            <div className="relative group cursor-pointer shrink-0" onClick={handleImageClick}>
              <img
                src={avatarUrl}
                alt="Profile"
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-cover border border-[#E5E2DC] shadow-xs shrink-0 transition group-hover:opacity-85"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_INDIAN_MALE_AVATAR
                }}
              />
              <div className="absolute inset-0 bg-black/40 rounded-xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition duration-200">
                <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-[10px] font-hanken font-bold uppercase tracking-wider">Upload</span>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="flex flex-col justify-center min-w-0">
              <h1 className="font-libre text-xl sm:text-2xl md:text-3xl font-bold text-[#1C1B1B] tracking-tight truncate">
                {displayName}
              </h1>
              <p className="font-hanken text-xs sm:text-sm text-[#525B54] mt-0.5 truncate">
                {user?.email}
              </p>
              <button
                onClick={handleImageClick}
                className="text-left text-xs font-hanken font-semibold text-[#163422] underline hover:text-black mt-1 cursor-pointer"
              >
                Change Profile Photo
              </button>
            </div>
          </div>

          {/* Orders Count Box */}
          <button
            onClick={() => navigate('/orders')}
            className="border border-[#E5E2DC] rounded-md px-5 py-3 text-center bg-[#FAF8F5] hover:bg-[#F4F2EE] transition cursor-pointer min-w-25 w-full sm:w-auto shrink-0 flex sm:flex-col items-center justify-between sm:justify-center gap-2"
            title="View Order History"
          >
            <p className="font-hanken text-[10px] font-bold text-[#6E756F] tracking-[0.18em] uppercase sm:hidden">TOTAL ORDERS</p>
            <p className="font-libre text-2xl sm:text-3xl font-bold text-[#163422]">{Number(ordersCount) || 0}</p>
            <p className="font-hanken text-[10px] font-bold text-[#6E756F] tracking-[0.18em] uppercase hidden sm:block mt-0.5">ORDERS</p>
          </button>
        </div>

        {/* Personal Details & Security Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 items-stretch">
          <PersonalDetails user={user} onEdit={handleEditPersonalDetails} />
          <Security />
        </div>

        {/* Saved Addresses */}
        <SavedAddresses user={user} />
      </Container>
    </div>
  )
}

export default Profile
