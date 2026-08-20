import React, { useState } from 'react'
import Container from './common/Container'
import { Link } from 'react-router-dom'
import TermsModal from './modals/TermsModal'
import PrivacyModal from './modals/PrivacyModal'
import { useStoreSettings } from '../context/StoreSettingsContext'

const QuickLinks = [
    { name: "Shop All", path: "/shop-all" },
    { name: "New Arrivals", path: "/featured/new-arrivals" },
    { name: "Arboreal Species", path: "/tarantulas/arboreal" },
    { name: "Terrestrial Species", path: "/tarantulas/terrestrial" }
]

const Footer = () => {
    const { settings } = useStoreSettings()
    const [showTermsModal, setShowTermsModal] = useState(false)
    const [showPrivacyModal, setShowPrivacyModal] = useState(false)

    const whatsappNum = settings.whatsappNumber || "+91 9876543210"
    const cleanPhone = whatsappNum.replace(/[^\d+]/g, '')

    return (
        <>
            <footer className="bg-[#142E1F] text-white py-12 lg:py-16 font-hanken w-full">
                <Container>
                    {/* Perfectly Centered Flex Row of 4 Column Boxes */}
                    <div className="flex flex-col sm:flex-row flex-wrap items-start justify-center gap-10 sm:gap-12 lg:gap-16 max-w-275 mx-auto">

                        {/* Column 1: Store Brand & Bio */}
                        <div className="flex flex-col gap-4 max-w-70">
                            <h1 className="text-[#D8F3DC] text-3xl font-libre font-bold tracking-tight">
                                {settings.storeName || "Toco's Arachnid"}
                            </h1>
                            <p className="text-white/80 text-xs sm:text-sm font-hanken leading-relaxed">
                                Ethical experts in premium exotic arachnids. We believe in providing the best care and species for every level of keeping.
                            </p>
                        </div>

                        {/* Column 2: Quick Links */}
                        <div className="flex flex-col gap-4 min-w-32.5">
                            <h2 className="text-[#FFDDB9] text-base font-semibold font-hanken">
                                Quick Links
                            </h2>
                            <div className="flex flex-col gap-3">
                                {QuickLinks.map((l, idx) => (
                                    <Link
                                        key={idx}
                                        to={l.path}
                                        className="text-white/80 hover:text-white text-xs sm:text-sm font-hanken transition whitespace-nowrap"
                                    >
                                        {l.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Column 3: Support */}
                        <div className="flex flex-col gap-4 min-w-32.5">
                            <h2 className="text-[#FFDDB9] text-base font-semibold font-hanken">
                                Support
                            </h2>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => setShowTermsModal(true)}
                                    className="text-white/80 hover:text-white text-xs sm:text-sm font-hanken text-left hover:underline cursor-pointer transition whitespace-nowrap"
                                >
                                    Terms & Conditions
                                </button>
                                <button
                                    onClick={() => setShowPrivacyModal(true)}
                                    className="text-white/80 hover:text-white text-xs sm:text-sm font-hanken text-left hover:underline cursor-pointer transition whitespace-nowrap"
                                >
                                    Privacy Policy
                                </button>
                                <Link
                                    to="/care-guides"
                                    className="text-white/80 hover:text-white text-xs sm:text-sm font-hanken transition whitespace-nowrap"
                                >
                                    Care Guides
                                </Link>
                            </div>
                        </div>

                        {/* Column 4: Contact Us */}
                        <div className="flex flex-col gap-3 max-w-60">
                            <h2 className="text-[#FFDDB9] text-base font-semibold font-hanken">
                                Contact Us
                            </h2>
                            <p className="text-white/60 text-xs font-hanken leading-relaxed">
                                Expert support via WhatsApp 24/7
                            </p>
                            <a
                                href={`https://wa.me/${cleanPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 bg-[#82552B] hover:bg-[#6D4521] text-white text-xs font-bold font-hanken px-6 py-3 rounded-md transition duration-200 text-center inline-block shadow-md w-full"
                            >
                                Chat with Expert
                            </a>
                        </div>

                    </div>

                    {/* Thin Horizontal Divider Line Centered */}
                    <div className="max-w-275 mx-auto border-t border-white/20 w-full mt-12 mb-8" />

                    {/* Bottom Copyright Credit Centered */}
                    <p className="font-hanken text-white/60 text-center text-xs">
                        © 2026 {settings.storeName || "Toco's Arachnids"}. Ethics first, experts always. All rights reserved.
                    </p>
                </Container>
            </footer>

            <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
            <PrivacyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
        </>
    )
}

export default Footer