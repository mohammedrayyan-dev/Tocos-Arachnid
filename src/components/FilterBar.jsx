const FilterBar = ({ selected, onSelect, filters }) => {
  return (
        <div className="bg-[#F0EDED] border border-[#C2C8C0] p-6">
            <div className="flex flex-row gap-10">
            {filters.map((f) => (
                <div 
                key={f.key} 
                className="flex flex-col gap-2">
                <p className="font-hanken text-base text-[#424843] uppercase">
                    {f.label}
                </p>
                <select 
                key={f.key}
                value={selected[f.key] || ""}
                onChange={(e) => onSelect(f.key, e.target.value)}
                className="p-2 bg-[#FCF9F8] border border-[#C2C8C0] focus:outline-none cursor-pointer">
                    <option value="" className="font-hanken text-sm text-[#1C1B1B]">
                        {f.options[0]}
                    </option>
                    {f.options.slice(1).map((opt) => (
                    <option key={opt} value={opt} className="font-hanken text-sm text-[#1C1B1B]">
                        {opt}
                    </option>
                    ))}
                </select>
                </div>
            ))}
            </div>
        </div>
  )
}

export default FilterBar