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

    <div className="bg-[#F6F3F2] w-full  py-20">

        <Container>

            <div className="flex flex-col items-center justify-center gap-15">

            <h1 className="font-libre text-5xl font-semibold text-[#163422]">
                Effortless Adoption
            </h1>

            <div className="flex flex-row justify-around gap-10">
                {adopt.map((a) => (
                <div className="bg-[#FCF9F8] border border-[#C2C8C0] w-[368px] h-[287px] p-10 flex flex-col items-center gap-4 rounded-lg">
                    <div className="bg-[#C8EBD0] w-[64px] min-h-[64px] flex items-center justify-center rounded-xl ">
                        <img src={a.image} alt={a.title} />
                    </div>
                    <h2 className="font-libre text-xl">
                        {a.id}. {a.title}
                    </h2>
                    <p className="text-[#424843] font-hanken text-base text-center">
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