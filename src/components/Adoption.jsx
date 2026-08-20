import React from 'react'
import Container from './common/Container'
import Species from "/src/assets/image/icons/species-vector.svg"
import WhatsApp from "/src/assets/image/icons/whatsapp-pay-vector.svg"
import Shipping from "/src/assets/image/icons/shipping-vector.svg"

const adopt = [
    {
        id: 1,
        title: "Select your species",
        description: "Browse our curated gallery of ethically raised arachnids. Use our filters to find the perfect match for your experience level.",
        image: Species
    },
    {
        id: 2,
        title: "Direct QR Pay",
        description: "Complete your order with a single click. We use direct QR payment for a personalized, secure, and expert-guided checkout.",
        image: WhatsApp
    },
    {
        id: 3,
        title: "Specialized Shipping",
        description: "Your new companion is packed with extreme care and climate control, ensuring a safe arrival at your doorstep within 48 hours.",
        image: Shipping
    },
]

const Adoption = () => {
  return (
    <div className="bg-[#F6F3F2] w-full py-12 sm:py-16 lg:py-20">
        <Container>
            <div className="flex flex-col items-center justify-center gap-6 sm:gap-10">
                <h1 className="font-libre text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-[#163422] text-center">
                    Effortless Adoption
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 w-full">
                    {adopt.map((a) => (
                        <div 
                            key={a.id} 
                            className="bg-[#FCF9F8] border border-[#C2C8C0] p-5 sm:p-6 lg:p-8 flex flex-col items-center gap-3.5 sm:gap-4 rounded-xl shadow-2xs hover:shadow-xs transition"
                        >
                            <div className="bg-[#C8EBD0] w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-xl shrink-0">
                                <img src={a.image} alt={a.title} className="w-6 h-6 sm:w-7 sm:h-7 object-contain" />
                            </div>
                            <h2 className="font-libre text-base sm:text-lg md:text-xl text-[#163422] font-bold text-center">
                                {a.id}. {a.title}
                            </h2>
                            <p className="text-[#424843] font-hanken text-xs sm:text-sm md:text-base text-center leading-relaxed">
                                {a.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </Container>
    </div>
  )
}

export default Adoption