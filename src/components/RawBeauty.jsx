import RawBeautys from "../assets/image/raw-beauty-banner.webp"
import Container from "./common/Container"

const RawBeauty = () => {
  return (
    <div className="relative">
        <img src={RawBeautys} alt="Raw Beauty" className=" w-full h-full" />

        <div className="absolute inset-0 bg-black/60" />

        <Container>
            <div className="absolute inset-1 flex flex-col justify-center items-center gap-5">
                <h1 className="font-libre text-white text-5xl font-semibold">
                    Respect the Raw Beauty
                </h1>
                <p className="font-hanken text-white text-base max-w-2xl text-center">
                    Join a community of enthusiasts who value ethics, expertise, and the preservation of these misunderstood masterpieces of evolution.
                </p>
                <button
                className="bg-[#785832] text-white text-xs py-4 px-15 rounded-sm cursor-pointer"
                >
                    View New Arrivals
                </button>
            </div>
        </Container>

    </div>
  )
}

export default RawBeauty