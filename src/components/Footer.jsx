import React from 'react'
import Container from './common/Container'
import { Link } from 'react-router-dom'

const QuickLinks = [
  { name: "Shop All", path: "/" },
  { name: "New Arrivals", path: "/" },
  { name: "Arboreal Species", path: "/" },
  { name: "Terrestrial Species", path: "/" }
]

const Support = [
  { name: "Terms & Conditions", path: "/" },
  { name: "Privacy Policy", path: "/" },
  { name: "Shopping Info", path: "/" },
  { name: "Care Guides", path: "/" }
]

const Footer = () => {
  return (

        <div className="bg-[#163422] py-10">

            <Container>
            
            <div className="flex flex-row justify-center items-start gap-20">

            <div className="flex flex-col gap-4">
                <h1 className="text-[#C8EBD0] text-2xl font-semibold font-libre">
                    Toco's Arachnid
                </h1>
                <p className="text-white text-sm font-hanken max-w-60">
                    Ethical experts in premium exotic arachnids. We believe in providing the best care and species for every level of keeping
                </p>
            </div>

            <div className="flex flex-col gap-4">
                <h2 className="text-[#FFDDB9] text-base font-medium font-hanken">
                    Quick Links
                </h2>
                <div className="flex flex-col gap-4">
                    {QuickLinks.map((l) => (
                        <Link to={l.path} className="text-white text-xs font-hanken">
                            {l.name}
                        </Link>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <h2 className="text-[#FFDDB9] text-base font-medium font-hanken">
                    Support
                </h2>
                <div className="flex flex-col gap-4">
                    {Support.map((s) => (
                        <Link to={s.path} className="text-white text-xs font-hanken">
                            {s.name}
                        </Link>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <h2 className="text-[#FFDDB9] text-base font-medium font-hanken">
                    Contact Us
                </h2>
                <p className="text-white/40 text-xs font-hanken">
                    Expert support via WhatsApp 24/7
                </p>
                <a 
                target="_blank"
                href="https://wa.me/918870150575" 
                className="text-white text-xs font-hanken">
                    +91 8870150575
                </a>
                <a
                href="https://wa.me/918870150575"
                target="_blank"
                className="bg-[#785832] font-semibold font-hanken text-white text-xs p-4 rounded-md flex items-center justify-center">
                    Chat with Expert
                </a>
            </div>

            </div>

            <div className="bg-[#FFFFFF33] h-px w-full mt-10"/>

            <p className="font-hanken text-[#FFFFFF80] text-center text-xs mt-8">
                © 2026 Toco's Arachnids. Ethics first, experts always. All rights reserved.
            </p>

            </Container>

        </div>

  )
}

export default Footer