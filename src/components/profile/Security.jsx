import { useNavigate } from 'react-router-dom'

const formatPasswordDate = (dateStr) => {
  if (!dateStr) return 'Last updated recently'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return 'Last updated recently'
    const now = new Date()
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Updated today'
    if (diffDays === 1) return 'Updated yesterday'
    if (diffDays < 30) return `Updated ${diffDays} days ago`
    if (diffDays < 60) return 'Updated 1 month ago'
    return `Last updated on ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  } catch (e) {
    return 'Last updated recently'
  }
}

const Security = ({ user }) => {
  const navigate = useNavigate()
  
  const customSavedDate = user?.id ? localStorage.getItem(`user_password_updated_${user.id}`) : null
  const passwordUpdatedDate = customSavedDate || user?.user_metadata?.password_updated_at || user?.updated_at || null
  const lastUpdatedText = formatPasswordDate(passwordUpdatedDate)

  return (
    <div className="bg-white border border-[#E5E2DC] rounded-md p-5 flex flex-col justify-between h-full shadow-xs">
      <div>
        <h2 className="font-sand text-2xl font-bold text-[#1C1B1B] mb-4">
          Security
        </h2>

        <div className="bg-[#FAF8F5] border border-[#E5E2DC] p-5 rounded-md flex flex-row items-center justify-between mt-2">
          <div>
            <p className="font-hanken font-bold text-sm text-[#1C1B1B]">Password</p>
            <p className="text-xs text-[#6E756F] font-hanken mt-1">{lastUpdatedText}</p>
          </div>
          <button
            onClick={() => navigate('/reset-password')}
            className="px-4 py-2 border border-[#163422] bg-white rounded-md font-hanken font-semibold text-xs text-[#163422] hover:bg-[#163422] hover:text-white transition cursor-pointer"
          >
            Change
          </button>
        </div>
      </div>
    </div>
  )
}

export default Security
