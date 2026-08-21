import BeginnerTarantula from "/src/assets/image/beginner-tarantula-banner.webp"
import IsopodsCare from "/src/assets/image/isopods-care.webp"
import MillipedeCare from "/src/assets/image/millipede-care.webp"
import BioActiveCare from "/src/assets/image/bioactive-masterclass.webp"

const speciesGuideData = {
  "Tarantulas": {
    introTitle: "Getting Started with Your First Tarantula",
    introText: "Congratulations on choosing to keep one of nature's most fascinating creatures! Tarantulas make incredible pets for those who appreciate their unique beauty and behavior. This guide is designed to provide the foundation for a successful and rewarding experience.",
    speciesHeading: "Choosing the Right Species",
    speciesText: "For your first tarantula, we strongly recommend starting with a New World terrestrial species. These are generally more docile, have less potent venom, and possess urticating hairs rather than aggressive defensive behaviors.",
    recommendationsTitle: "TOP BEGINNER RECOMMENDATIONS:",
    recommendations: [
      { species: "Grammostola pulchripes", commonName: "Chaco Golden Knee" },
      { species: "Grammostola porteri", commonName: "Chilean Rose Hair" },
      { species: "Brachypelma boehmei", commonName: "Mexican Fire Leg" }
    ],
    equipment: [
      { title: "Enclosure", desc: "A glass or acrylic terrarium with more floor space than height. For terrestrial species, provide at least 2x the legspan in width and 1.5x in depth." },
      { title: "Substrate", desc: "Coco fiber, peat moss, or a mix. Depth should be 10-15cm for terrestrial species to allow burrowing and prevent fall injuries." },
      { title: "Water Dish", desc: "Small, shallow dish with fresh water at all times. Deep enough to drink, shallow enough to prevent drowning." },
      { title: "Hide", desc: "A piece of cork bark or a half-log provides security. Every tarantula needs a safe retreat to thrive." }
    ],
    tempHumidityText: "Most beginner species thrive at room temperature (21-27°C). Humidity requirements vary by species but generally fall between 60-70%.",
    optimalTemp: "21°C - 27°C",
    humidityLevel: "60% - 70%"
  },
  "Isopods": {
    introTitle: "Establishing Your First Isopod Colony",
    introText: "Isopods are nature's quiet custodians—fascinating, highly social crustaceans that keep bioactive terrariums clean and thrive in damp, botanical environments.",
    speciesHeading: "Selecting the Best Isopod Species",
    speciesText: "For beginners, hardy Porcellio and Armadillidium species are the gold standard. They reproduce steadily, resist minor moisture shifts, and actively process organic matter.",
    recommendationsTitle: "TOP ISOPOD SPECIES:",
    recommendations: [
      { species: "Armadillidium maculatum", commonName: "Zebra Isopod" },
      { species: "Porcellio laevis", commonName: "Dairy Cow Isopod" },
      { species: "Armadillidium vulgare", commonName: "Magic Potion" }
    ],
    equipment: [
      { title: "Enclosure", desc: "Ventilated plastic tub or acrylic enclosure with a damp-to-dry moisture gradient across the substrate." },
      { title: "Substrate & Leaf Litter", desc: "Rich organic soil, decayed oak leaves, rotten wood, and sphagnum moss on the hydrated side." },
      { title: "Calcium Source", desc: "Cuttlebone pieces or limestone powder essential for exoskeleton growth during molting." },
      { title: "Cork Hide", desc: "Flat pieces of cork bark for shelter, molting security, and communal congregation." }
    ],
    tempHumidityText: "Isopods thrive in warm, humid microclimates with distinct damp and dry zones inside the enclosure.",
    optimalTemp: "22°C - 26°C",
    humidityLevel: "70% - 85%"
  },
  "Millipedes": {
    introTitle: "Housing Giant Invertebrate Gentle Giants",
    introText: "Millipedes are peaceful detritivores that spend their lives burrowing through rich forest soil, converting decaying hardwood and leaves into fertile soil.",
    speciesHeading: "Top Millipede Species for Keepers",
    speciesText: "Species with calm temperaments, impressive size, and straightforward moisture requirements are recommended for beginner and intermediate keepers.",
    recommendationsTitle: "RECOMMENDED MILLIPEDE SPECIES:",
    recommendations: [
      { species: "Archispirostreptus gigas", commonName: "Giant African Millipede" },
      { species: "Narceus americanus", commonName: "American Giant Millipede" },
      { species: "Anadenobolus monilicornis", commonName: "Bumblebee Millipede" }
    ],
    equipment: [
      { title: "Enclosure", desc: "Terrarium depth must equal at least the length of the millipede, with secure ventilation." },
      { title: "Deep Substrate", desc: "Minimum 12-15cm depth of organic soil, decomposed wood, and organic compost for deep burrowing." },
      { title: "Moisture Retention", desc: "Thick layer of damp sphagnum moss misted daily to prevent dehydration." },
      { title: "Rotten Hardwood", desc: "Decaying oak or beech wood serves as both primary food source and structural shelter." }
    ],
    tempHumidityText: "Giant millipedes require a consistently damp substrate and moderate ambient room temperatures.",
    optimalTemp: "23°C - 27°C",
    humidityLevel: "75% - 85%"
  },
  "BioActive": {
    introTitle: "Creating a Self-Sustaining Ecosystem",
    introText: "A bioactive terrarium replicates a living natural ecosystem where microfauna, subterranean detritivores, and living plants collaborate to cycle waste naturally.",
    speciesHeading: "Bioactive Cleanup Crew Selection",
    speciesText: "Combine complementary detritivore species (springtails and isopods) to maintain clean soil, prevent mold outbreaks, and nourish live tropical plants.",
    recommendationsTitle: "ESSENTIAL CLEANUP ORGANISMS:",
    recommendations: [
      { species: "Folsomia candida", commonName: "Tropical White Springtails" },
      { species: "Trichorhina pruinosa", commonName: "Dwarf White Isopods" },
      { species: "Neoregelia bromeliad", commonName: "Bioactive Terrarium Plants" }
    ],
    equipment: [
      { title: "Drainage Layer", desc: "Expanded clay pebbles (Hydroton) separated by mesh to hold excess water and prevent root rot." },
      { title: "ABG Substrate Mix", desc: "Tree fern fiber, peat moss, charcoal, and orchid bark optimized for microfauna colonisation." },
      { title: "Full Spectrum LED", desc: "6500K LED lighting to drive plant photosynthesis and maintain vivarium plant health." },
      { title: "Botanical Litter", desc: "Magnolia leaves, seed pods, and lotusheads for food reserves and micro-shelters." }
    ],
    tempHumidityText: "Bioactive ecosystems perform best with warm ambient conditions, high humidity, and steady airflow.",
    optimalTemp: "22°C - 28°C",
    humidityLevel: "70% - 90%"
  }
}

const GuideModal = ({ guide, onClose }) => {
  const categoryKey = guide.prod || "Tarantulas"
  const activeContent = speciesGuideData[categoryKey] || speciesGuideData["Tarantulas"]
  const imageSource = guide.img || BeginnerTarantula

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121312]/90 backdrop-blur-sm overflow-y-auto">
      {/* Background Backdrop Click */}
      <div onClick={onClose} className="absolute inset-0" />

      {/* Dark Modal Container matching reference screenshot dimensions */}
      <div className="relative w-full max-w-[780px] max-h-[90vh] overflow-y-auto bg-[#212321] border border-[#2D302D] rounded-xl shadow-2xl text-white my-auto p-6 md:p-8 select-text z-10">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 z-30 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer font-sans text-xs opacity-90"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Hero Image Section */}
        <div className="relative w-full h-[240px] md:h-[280px] rounded-lg overflow-hidden mb-6">
          <img src={imageSource} alt={guide.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#212321] via-[#212321]/40 to-transparent"></div>

          <div className="absolute bottom-5 left-5 right-5 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="font-hanken text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-[#1C3325] text-[#549E6B] rounded">
                {guide.prod}
              </span>
              <div className="flex items-center gap-1 text-[11px] text-[#A4AAA4] font-hanken">
                <svg className="w-3.5 h-3.5 text-[#A4AAA4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9"/>
                  <polyline points="12 7 12 12 15 15"/>
                </svg>
                <span>{guide.time} min read</span>
              </div>
            </div>
            <h1 className="font-libre text-3xl md:text-4xl font-bold text-white tracking-tight">
              {guide.title}
            </h1>
          </div>
        </div>

        {/* Section 1: Intro Header & Description (Screenshot 2) */}
        <div className="mb-6">
          <h2 className="font-libre italic text-2xl md:text-3xl text-[#549E6B] mb-2 font-serif">
            {activeContent.introTitle}
          </h2>
          <p className="font-hanken text-xs md:text-sm text-[#A4AAA4] leading-relaxed max-w-[640px]">
            {activeContent.introText}
          </p>
          <div className="h-[1px] bg-[#2C2E2C] my-6 w-full"></div>
        </div>

        {/* Section 2: Choosing the Right Species + Green Callout Box (Screenshots 1 & 3) */}
        <div className="mb-8">
          <h2 className="font-libre text-xl md:text-2xl font-bold text-white mb-2">
            {activeContent.speciesHeading}
          </h2>
          <p className="font-hanken text-xs md:text-sm text-[#A4AAA4] leading-relaxed max-w-[640px] mb-4">
            {activeContent.speciesText}
          </p>

          {/* Green Border Callout Box */}
          <div className="bg-[#282A28] border-l-2 border-[#549E6B] p-4 rounded-r-md flex flex-col gap-2.5 max-w-[520px]">
            <p className="font-hanken text-[10px] font-bold text-[#C48C46] uppercase tracking-widest">
              {activeContent.recommendationsTitle}
            </p>

            <div className="flex flex-col gap-2">
              {activeContent.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[#549E6B] text-xs mt-0.5">◎</span>
                  <div className="flex flex-col">
                    <span className="font-libre text-sm text-[#E0E4E0] font-medium">
                      {rec.species}
                    </span>
                    <span className="font-hanken text-[11px] text-[#7A807A]">
                      ({rec.commonName})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Essential Equipment (2x2 Grid) (Screenshot 4) */}
        <div className="mb-8">
          <h2 className="font-libre text-xl md:text-2xl font-bold text-white mb-3">
            Essential Equipment
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-[640px]">
            {activeContent.equipment.map((eq, i) => (
              <div key={i} className="bg-[#282A28] border border-[#303330] p-4 rounded-md flex flex-col gap-1">
                <h3 className="font-hanken text-xs font-bold text-[#549E6B]">
                  {eq.title}
                </h3>
                <p className="font-hanken text-[11px] md:text-xs text-[#9EA49E] leading-relaxed">
                  {eq.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Temperature and Humidity (Screenshot 5) */}
        <div className="mb-4">
          <div className="bg-[#282A28] border border-[#303330] p-5 rounded-lg max-w-[640px] flex flex-col gap-3">
            <h2 className="font-libre text-xl md:text-2xl font-bold text-white">
              Temperature and Humidity
            </h2>
            <p className="font-hanken text-xs md:text-sm text-[#9EA49E] leading-relaxed">
              {activeContent.tempHumidityText}
            </p>

            <div className="flex flex-wrap gap-3 mt-1">
              {/* Optimal Temp Badge */}
              <div className="bg-[#1B2B21] border border-[#273D30] rounded-md px-3 py-2 flex items-center gap-2.5">
                <div className="w-6 h-6 rounded bg-[#233F2E] flex items-center justify-center text-[#549E6B]">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
                  </svg>
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="font-hanken text-[9px] font-bold text-[#808A80] uppercase tracking-wider">Optimal Temp</span>
                  <span className="font-hanken text-xs font-bold text-white">{activeContent.optimalTemp}</span>
                </div>
              </div>

              {/* Humidity Level Badge */}
              <div className="bg-[#1B2B21] border border-[#273D30] rounded-md px-3 py-2 flex items-center gap-2.5">
                <div className="w-6 h-6 rounded bg-[#233F2E] flex items-center justify-center text-[#549E6B]">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                  </svg>
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="font-hanken text-[9px] font-bold text-[#808A80] uppercase tracking-wider">Humidity Level</span>
                  <span className="font-hanken text-xs font-bold text-white">{activeContent.humidityLevel}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default GuideModal