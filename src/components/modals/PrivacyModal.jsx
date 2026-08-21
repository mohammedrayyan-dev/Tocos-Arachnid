const PrivacyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div 
        className="relative bg-white rounded-lg max-w-xl w-full p-6 md:p-8 shadow-2xl border border-[#E5E2DC] animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E2DC] mb-5">
          <h2 className="font-libre text-2xl md:text-3xl font-bold text-[#163422]">
            Privacy Policy
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-1 cursor-pointer"
            aria-label="Close Privacy Policy Modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-4 font-hanken text-sm text-[#424843] leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
          <p>
            Your privacy is important to us. It is Toco's Arachnids' policy to respect your privacy regarding any information we may collect from you across our website.
          </p>

          <p>
            We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we're collecting it and how it will be used.
          </p>

          <p>
            We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we'll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.
          </p>
        </div>
      </div>
    </div>
  )
}

export default PrivacyModal
