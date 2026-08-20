import React from 'react'
import Container from './common/Container'
import Stars from "/src/assets/image/icons/star.svg"

const keepers = [
    {
        initial: "YS",
        name: "Yaashar S U",
        feedback: "Recently bought a GBB and I couldn't be happier! The packaging was professional and the spider arrived active and healthy. Toco really knows his stuff and provided great advice.",
        role: "Verified Collector"
    },
    {
        initial: "DW",
        name: "Derek W",
        feedback: "The best place for arachnids in India. The ethics and care they put into every specimen is evident. My Chilean Rose arrived in perfect condition and is doing great.",
        role: "New Collector"
    },
    {
        initial: "MR",
        name: "Mohammed Rayyan",
        feedback: "Fast delivery and amazing customer support. I was nervous about my first tarantula but they guided me through everything. Highly recommended!",
        role: "Advance Collector"
    },
]

const KeepersSay = () => {
  return (
    <div className="bg-[#F6F3F2] w-full py-12 sm:py-16 lg:py-20">
        <Container>
            <div className="flex flex-col items-center justify-center gap-8 sm:gap-12">
                <div className="flex flex-col items-center justify-center gap-3 text-center">
                    <h1 className="font-libre text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#163422]">
                        What our keepers say
                    </h1>
                    <p className="text-[#163422] font-hanken text-xs sm:text-sm font-semibold">
                        Trusted by collectors across the nation.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full">
                    {keepers.map((k, idx) => (
                        <div 
                            key={idx} 
                            className="bg-[#FCF9F8] border border-[#C2C8C0] p-6 sm:p-8 flex flex-col justify-between gap-4 rounded-xl shadow-2xs hover:shadow-xs transition min-h-60"
                        >
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-row gap-1">
                                    {Array.from({ length: 5}).map((_, i) => (
                                        <img key={i} src={Stars} alt="Stars" className="w-3.5 h-3.5 object-contain" />
                                    ))}
                                </div>
                                <p className="text-[#424843] font-hanken text-xs sm:text-sm leading-relaxed italic">
                                    "{k.feedback}"
                                </p>
                            </div>

                            <div className="flex flex-row items-center gap-3 pt-2 border-t border-[#E5E2DC]">
                                <p className="bg-[#C8EBD0] w-9 h-9 flex items-center font-hanken font-bold text-xs justify-center rounded-xl shrink-0 text-[#163422]">
                                    {k.initial}
                                </p>
                                <div className="flex flex-col min-w-0">
                                    <h2 className="font-libre text-sm sm:text-base font-bold text-[#1C1B1B] truncate">
                                        {k.name}
                                    </h2>
                                    <p className="text-[#6E756F] font-hanken text-[10px] font-bold uppercase tracking-wider">
                                        {k.role}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Container>
    </div>
  )
}

export default KeepersSay