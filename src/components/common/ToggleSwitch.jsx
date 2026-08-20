import React from 'react'

const ToggleSwitch = ({ checked, onChange, label, description }) => {
  return (
    <div 
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between p-4 bg-[#FAF8F5] border border-[#E5E2DC] hover:border-[#163422] rounded-xl transition cursor-pointer group shadow-2xs"
    >
      <div className="flex flex-col pr-4">
        {label && (
          <span className="font-hanken font-bold text-xs sm:text-sm text-[#1C1B1B] group-hover:text-[#163422] transition">
            {label}
          </span>
        )}
        {description && (
          <span className="font-hanken text-xs text-[#6E756F] mt-0.5 leading-relaxed">
            {description}
          </span>
        )}
      </div>

      {/* Pill Toggle Switch */}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={(e) => {
          e.stopPropagation()
          onChange(!checked)
        }}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          checked ? 'bg-[#10B981]' : 'bg-[#D1D5DB]'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

export default ToggleSwitch
