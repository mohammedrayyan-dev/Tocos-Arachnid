import { Plus } from 'lucide-react'

const AddSpecimenCard = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="border-2 border-dashed border-[#C2C8C0] bg-[#FAF8F5]/60 hover:bg-[#EAF5ED]/40 hover:border-[#163422] rounded-xl min-h-85 h-full flex flex-col items-center justify-center text-center p-6 cursor-pointer transition duration-200 group"
    >
      <div className="w-12 h-12 rounded-xl bg-[#E5E2DC]/60 group-hover:bg-[#163422] group-hover:text-white flex items-center justify-center text-[#163422] mb-3 transition shadow-2xs">
        <Plus className="w-6 h-6" />
      </div>

      <h3 className="font-libre font-bold text-xl text-[#163422] mb-1">
        Add New Specimen
      </h3>

      <p className="font-hanken text-xs text-[#6E756F]">
        Click to enter curator mode
      </p>
    </div>
  )
}

export default AddSpecimenCard
