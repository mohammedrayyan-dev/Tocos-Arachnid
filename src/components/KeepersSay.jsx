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

    <div className="bg-[#F6F3F2] w-full  py-20">

        <Container>

            <div className="flex flex-col items-center justify-center gap-15">

            <div className="flex flex-col items-center justify-center gap-5">
            <h1 className="font-libre text-5xl font-semibold text-[#163422]">
                What our keepers say
            </h1>
            <p className="text-[#163422] font-hanken text-base font-semibold">
                Trusted by collectors across the nation.
            </p>
            </div>

            <div className="flex flex-row justify-around gap-10">
                {keepers.map((k) => (
                <div className="bg-[#FCF9F8] border border-[#C2C8C0] w-[368px] h-[287px] p-10 flex flex-col gap-4 rounded-lg">

                    <div className="flex flex-row gap-2">
                    {Array.from({ length: 5}).map((_, i) => (
                    <img key={i} src={Stars} alt="Stars" className="w-4 object-contain" />
                    ))}
                    </div>

                    <div className="flex flex-col items-center"> 

                    <p className="text-[#424843] font-hanken text-base text-center">
                        "{k.feedback}"
                    </p>

                    </div>

                    <div className="flex flex-row items-center gap-4">
                    <p className="bg-[#C8EBD0] w-[40px] h-[40px] flex items-center font-hanken justify-center rounded-xl ">
                        {k.initial}
                    </p>

                    

                    <div className="flex flex-col">
                    <h2 className="font-libre text-xl text-[#1C1B1B]">
                        {k.name}
                    </h2>
                    <p className="text-[#424843] font-hanken text-xs uppercase">
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