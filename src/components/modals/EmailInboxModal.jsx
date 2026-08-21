import React, { useState } from 'react'
import { X, Copy, Check, Mail, ShieldCheck, ExternalLink } from 'lucide-react'
import TocoLogo from "/src/assets/image/tocos-logo.png"
import { toast } from 'sonner'

const EmailInboxModal = ({ isOpen, onClose, email, code, onCopyAndFill }) => {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success(`Verification code "${code}" copied to clipboard!`)
    if (onCopyAndFill) {
      onCopyAndFill(code)
    }
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-hanken animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-[#E5E2DC] flex flex-col max-h-[90vh]">
        
        {/* Browser / Email Client Header Bar */}
        <div className="bg-[#FAF8F5] border-b border-[#E5E2DC] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="font-mono text-xs text-[#6E756F] ml-2 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#163422]" />
              <span>Inbox Preview • verify@tocosarachnid.com</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-[#6E756F] hover:text-black rounded-lg hover:bg-gray-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* Email Envelope Info Box */}
          <div className="bg-[#FAF8F5] border border-[#E5E2DC] p-4 rounded-xl space-y-1.5 text-xs text-[#525B54]">
            <div className="flex justify-between items-center">
              <span className="font-bold text-[#1C1B1B]">From:</span>
              <span className="font-mono text-[11px] text-[#163422]">Toco's Arachnid Security &lt;verify@tocosarachnid.com&gt;</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-[#1C1B1B]">To:</span>
              <span className="font-mono text-[11px] text-[#163422]">{email || 'user@example.com'}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-[#E5E2DC]">
              <span className="font-bold text-[#1C1B1B]">Subject:</span>
              <span className="font-semibold text-[#163422]">Your 6-Digit Email Verification Code</span>
            </div>
          </div>

          {/* Styled Email Layout */}
          <div className="border border-[#163422]/20 rounded-xl overflow-hidden shadow-2xs bg-white">
            <div className="bg-[#163422] p-6 text-white text-center flex flex-col items-center gap-2">
              <img src={TocoLogo} alt="Logo" className="w-8 h-8 object-contain" />
              <h2 className="font-libre text-xl font-bold tracking-wide text-[#C8EBD0]">
                Toco's Arachnid
              </h2>
              <p className="text-[11px] text-gray-300 font-medium uppercase tracking-wider">
                Account Verification Code
              </p>
            </div>

            <div className="p-6 text-center space-y-5">
              <p className="text-xs text-[#525B54] leading-relaxed">
                Thank you for beginning your journey with Toco's Arachnid. Please use the security code below to complete your registration:
              </p>

              {/* Code Box Display */}
              <div className="bg-[#FAF8F5] border-2 border-dashed border-[#163422] p-5 rounded-xl flex items-center justify-center gap-3">
                <span className="font-mono text-3xl font-extrabold tracking-[0.35em] text-[#163422] select-all">
                  {code}
                </span>
              </div>

              {/* Copy Code Action Button */}
              <button
                onClick={handleCopy}
                className="w-full py-3.5 bg-[#163422] hover:bg-[#0D2316] text-white font-bold text-xs rounded-lg transition cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-300" />
                    <span>Copied to Clipboard & Auto-Filled!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Code & Auto-Fill Form</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-[#6E756F]">
                This code will expire in 10 minutes. If you did not request this code, please ignore this email.
              </p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-[#FAF8F5] border-t border-[#E5E2DC] px-6 py-3.5 flex items-center justify-between text-xs">
          <span className="text-[#6E756F]">Simulated Email Client Preview</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-[#E5E2DC] text-[#163422] font-bold rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmailInboxModal
