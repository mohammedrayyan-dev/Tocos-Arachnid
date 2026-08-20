import CareGuideBanner from "/src/assets/image/care-guides.webp"
import Container from "/src/components/common/Container.jsx"
import Divider from "/src/assets/image/icons/divider.svg"
import BeginnerTarantula from "/src/assets/image/beginner-tarantula-care.webp"
import IsopodsCare from "/src/assets/image/isopods-care.webp"
import MillipedeCare from "/src/assets/image/millipede-care.webp"
import BioActiveCare from "/src/assets/image/bioactive-masterclass.webp"
import Time from "/src/assets/image/icons/time.svg"
import Arrow from "/src/assets/image/icons/arrow-green.svg"
import { useState } from "react"
import GuideModal from "../../components/modals/GuideModal"
import Button from "../../components/common/Button"

const options = [
  {
    id: 1,
    option: "All Species"
  },
  {
    id: 2,
    option: "Tarantulas"
  },
  {
    id: 3,
    option: "Isopods"
  },
  {
    id: 4,
    option: "Millipedes"
  },
]

const guides = [
  {
    id: 1,
    img: BeginnerTarantula,
    prod: "Tarantulas",
    time: 8,
    title: "Beginner Tarantula Care",
    desc: "Everything you need to know before bringing home your first tarantula. From…"
  },
  {
    id: 2,
    img: IsopodsCare,
    prod: "Isopods",
    time: 6,
    title: "Isopod Care Guide",
    desc: "Complete guide to keeping isopods as pets—from establishing your first bioactive…"
  },
  {
    id: 3,
    img: MillipedeCare,
    prod: "Millipedes",
    time: 5,
    title: "Millipede Care Guide",
    desc: "Housing and caring for giant millipedes—the gentle giants of the invertebrate world.…"
  },
  {
    id: 4,
    img: BioActiveCare,
    prod: "BioActive",
    time: 12,
    title: "The Bioactive Masterclass",
    desc: "Learn how to create a self-sustaining ecosystem that reduces maintenance and…"
  },
]

const CareGuides = () => {

  const[activeOption, setActiveOption] = useState("All Species")
  const[selectedGuides, setSelectedGuides] = useState(null)

  const visibleGuides = guides.filter((g) => {
    if (activeOption === "All Species") return true
    return g.prod === activeOption
  })

  return (
    <div className="flex flex-col justify-center items-center gap-10 pb-20">

      <div className="relative w-full min-h-[320px] sm:min-h-[420px] lg:min-h-[500px] flex items-center justify-center overflow-hidden">
        <img src={CareGuideBanner} alt="Care Guide" className="absolute inset-0 w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-black/50 z-10" />

        <div className="relative z-20 flex flex-col gap-4 sm:gap-6 items-center justify-center text-center px-4 py-12">
          <h1 className="font-libre font-bold text-3xl sm:text-4xl lg:text-5xl text-white">
            Care Guides
          </h1>
          <p className="font-hanken text-sm sm:text-base lg:text-lg text-white/90 text-center max-w-2xl">
            Expert knowledge for every keeper, from beginner to advanced. Cultivating excellence in invertebrate care through science and empathy.
          </p>
          <div className="flex flex-row items-center gap-3 sm:gap-6">
            <img src={Divider} alt="Divider" className="w-8 sm:w-10 object-contain" />
            <p className="font-hanken text-xs sm:text-base text-[#E9BF90] uppercase tracking-wider">
              The naturalist's library
            </p>
            <img src={Divider} alt="Divider" className="w-8 sm:w-10 object-contain" />
          </div>
        </div>
      </div>

      <Container>

        <div className="flex flex-col">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-6 sm:py-12">
          <h2 className="font-libre font-bold text-2xl sm:text-3xl text-[#163422]">
            Essential Expertise
          </h2>
          <div className="flex flex-wrap gap-2">
            {options.map((o) => (
            <Button 
            key={o.id}
            onClick={() => setActiveOption(o.option)}
            variant="none"
            className={`py-2 px-4 rounded-full text-xs font-semibold cursor-pointer
            ${activeOption === o.option ? "bg-[#163422] text-white" : "border border-[#727972] text-[#424843]" }`}>
              {o.option}
            </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleGuides.map((g) => (
          <div 
          key={g.id}
          className="flex flex-col w-full border border-[#42484340] rounded-sm overflow-hidden bg-white">
            <div className="w-full h-52 sm:h-60 overflow-hidden">
              <img src={g.img} alt={g.title} className="w-full h-full object-cover" />
            </div>

            <div className="flex flex-col p-5 sm:p-6 gap-3">

            <div className="flex flex-row items-center gap-2">
              <span className="font-hanken text-[10px] sm:text-xs text-[#E9BF90] bg-[#2D4B37] flex items-center justify-center py-1 px-2 rounded-sm uppercase font-bold">
                {g.prod}
              </span>
              <div className="flex flex-row items-center gap-1">
              <img src={Time} alt="Time" className="w-3.5 h-3.5 object-contain"/>
              <p className="font-hanken text-xs text-[#424843]">
                {g.time} min read
              </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <p className="font-libre font-bold text-xl sm:text-2xl text-[#163422]">
                {g.title}
              </p>
              <p className="font-hanken text-xs sm:text-sm text-[#424843]">
                {g.desc}
              </p>
              <button
              onClick={() => setSelectedGuides(g)}
              className="flex flex-row font-hanken font-semibold text-xs sm:text-sm text-[#163422] gap-2 items-center cursor-pointer mt-1 hover:underline">
                Read Guide
                <img src={Arrow} alt="Arrow" className="w-3 object-contain" />
              </button>
            </div>

            </div>

          </div>
          ))}
        </div>

        </div>


      </Container>

      {selectedGuides && (
        <GuideModal 
        guide={selectedGuides} 
        onClose={() => setSelectedGuides(false)}/>
        )}

    </div>
  )
}

export default CareGuides