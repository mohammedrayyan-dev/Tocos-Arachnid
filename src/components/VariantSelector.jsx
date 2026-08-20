const VariantSelector = ({ variants, selected, onSelect, inStock }) => {
    if (!variants) return null

    const { unit, options } = variants

    return (
        <div className="flex flex-col gap-2">
            <h2 className="font-libre text-2xl text-[#785832]">
                {variants.type === "life_stage" ? "Stage" : "Size"}
            </h2>

            <div className="grid grid-cols-2">
                {options.map((opt) => (
                    <label key={opt.id} className="flex items-center cursor-pointer">
                        <input
                            disabled={!inStock}
                            type="checkbox"
                            checked={selected === opt.id}
                            onChange={() => onSelect(opt.id)}
                            className="hidden"
                        />
                        <span
                            className={`min-w-[20px] min-h-[20px] w-5 h-5 rounded-full border bg-white flex items-center justify-center transition-all duration-200 ${
                                selected === opt.id ? "border-[#163422]" : "border-[#667085]"
                            } ${!inStock ? "opacity-40" : ""}`}
                        >
                            {selected === opt.id && (
                                <span className="w-2.5 h-2.5 rounded-full bg-[#163422] flex-shrink-0" />
                            )}
                        </span>

                        <p className="font-hanken text-[#1C1B1B] text-base ml-2">
                            {opt.value} {unit ? unit : ""}
                        </p>
                    </label>
                ))}
            </div>
        </div>
    )
}

export default VariantSelector