import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const Security = () => {
  const navigate = useNavigate()

  return (
    <div className="bg-white border border-[#E5E2DC] rounded-md p-5 flex flex-col justify-between h-full shadow-xs">
      <div>
        <h2 className="font-sand text-2xl font-bold text-[#1C1B1B] mb-4">
          Security
        </h2>

        <div className="bg-[#FAF8F5] border border-[#E5E2DC] p-5 rounded-md flex flex-row items-center justify-between mt-2">
          <div>
            <p className="font-hanken font-bold text-sm text-[#1C1B1B]">Password</p>
            <p className="text-xs text-[#6E756F] font-hanken mt-1">Last updated 3 months ago</p>
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
