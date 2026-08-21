const TermsModal = ({ isOpen, onClose }) => {
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
            Terms & Conditions
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-1 cursor-pointer"
            aria-label="Close Terms & Conditions Modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-4 font-hanken text-sm text-[#424843] leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
          <p>
            Welcome to Toco's Arachnids. By accessing our website, you agree to comply with and be bound by the following terms and conditions of use, which together with our privacy policy govern our relationship with you in relation to this website.
          </p>

          <p>
            The term 'Toco's Arachnids' or 'us' or 'we' refers to the owner of the website. The term 'you' refers to the user or viewer of our website.
          </p>

          <ul className="space-y-2.5 pt-1 list-disc pl-5 text-[#525B54]">
            <li>
              The content of the pages of this website is for your general information and use only. It is subject to change without notice.
            </li>
            <li>
              Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness or suitability of the information and materials found or offered on this website for any particular purpose.
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default TermsModal
