import Beginner from "/src/assets/image/beginner-banner.webp"
import Brazilian from "/src/assets/image/brazilian-black.webp"
import Mexican from "/src/assets/image/mexican-red-knee.webp"
import Container from "/src/components/common/Container.jsx"
import Bug from "/src/assets/image/icons/bug.svg"
import Equipment from "/src/assets/image/icons/equipment.svg"
import Warning from "/src/assets/image/icons/warning.svg"

const firstSpecies = [
  {
    img: Mexican,
    name: "Mexican Red Knee",
    kind: [ "Docile", "Terrestrial" ],
    desc: "The quintessential beginner spider Extremely hardy, slow-moving, and boasts a stunning orange-and-black aesthetic that matures over several years."
  },
  {
    img: Brazilian,
    name: "Brazilian Black",
    kind: [ "The Lab", "Solid Black" ],
    desc: "Often called the 'Black Labrador' of the tarantula world. Known for its calm temperament and magnificent solid jet-black velvet appearance."
  },

]

const essentials = [
  {
    id: 1,
    title: "Enclosure Selection",
    desc: "Choose a container with cross-ventilation. For terrestrial species, the height should not exceed 1.5 times the spider's leg span to prevent injury from falls." 
  },
  {
    id: 2,
    title: "Substrate & Hydration",
    desc: "Use a mix of coconut fiber and peat moss. Provide a shallow water dish at all times. Contrary to popular belief, most beginners' species prefer dry substrate with a full water dish." 
  },
  {
    id: 3,
    title: "Temperature Control",
    desc: "'If you're comfortable, they're comfortable.' Aim for 72-78°F. Avoid direct sunlight or placed heat mats directly under the enclosure, which can dehydrate your pet." 
  }
]

const warnings = [
  {
    id: 1,
    title: "OVER-FEEDING",
    desc: "Feeding too often can lead to an abdomen that is too large, increasing the risk of fatal ruptures during a fall."
  },
  {
    id: 2,
    title: "MISTAKING MOLTING",
    desc: "If your spider is on its back, it is likely molting. NEVER touch or flip it over, as this is a delicate and critical biological process."
  },
  {
    id: 3,
    title: "POOR VENTILATION",
    desc: "Stagnant air is a silent killer. Ensure there is adequate airflow to prevent mold and bacterial growth within the enclosure."
  }
]

const BeginnerGuide = () => {
  return (
        <div className="flex flex-col justify-center items-center gap-10">

          <div className="relative w-full min-h-[320px] sm:min-h-[450px] lg:min-h-175 flex items-center justify-center overflow-hidden">
            <img src={Beginner} alt="Beginner Guide" className="absolute inset-0 w-full h-full object-cover object-center" />

            <div className="absolute inset-0 bg-black/50 z-10"/>

            <Container className="relative z-20 w-full">
              <div className="flex flex-col items-center justify-center gap-4 text-center px-4 py-16">
                <h1 className="font-libre font-bold text-white text-3xl sm:text-4xl lg:text-5xl">
                  The Beginner's Journey
                </h1>
                <p className="font-hanken text-white text-sm sm:text-base lg:text-lg max-w-xl">
                  Expert knowledge for every keeper, from the first enclosure to a thriving collection.
                </p>
              </div>
            </Container>

          </div>

          <Container>

          <p className="font-hanken text-sm sm:text-base text-center text-[#424843] py-8 sm:py-12">
            "Owning an invertebrate is more than just keeping a pet it's a window into an ancient, miniature world."
          </p>

          <div className="flex flex-col gap-6">
            <div className="flex flex-row items-center gap-4">
              <img src={Bug} className="w-6 object-contain" />
              <h2 className="font-libre font-bold text-2xl sm:text-3xl text-[#163422]">
                Choosing Your First Species
              </h2>
            </div>

            <p className="font-hanken text-sm sm:text-base text-[#1C1B1B] max-w-3xl">
              For newcomers, we recommend "New World" terrestrial species. They are generally slower, possess milder venom, and have straightforward habitat requirements.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {firstSpecies.map((f) => (
              <div key={f.name} className="bg-white border border-[#C2C8C0] p-5 flex flex-col gap-3">
                <img src={f.img} className="w-full h-64 sm:h-80 md:h-72 lg:h-80 object-cover rounded-xs"/>
                <p className="font-libre font-bold text-2xl text-[#163422]">
                  {f.name}
                </p>
                <div className="flex flex-row flex-wrap gap-2">
                  {f.kind.map((k) => (
                  <span key={k} className="bg-[#F0EDED] font-hanken font-bold text-[#424843] text-xs uppercase p-2 rounded-sm">
                    {k}
                  </span>
                  ))}
                </div>
                <p className="font-hanken text-sm sm:text-base text-[#424843]">
                  {f.desc}
                </p>
              </div>
              ))}
            </div>

          </div>

          <div className="border border-[#C2C8C0] w-full my-10" />

          <div className="flex flex-col gap-5">
            <div className="flex flex-row items-center gap-4">
              <img src={Equipment} alt="Equipment" className="object-contain" />
              <h3 className="font-libre font-bold text-2xl sm:text-3xl text-[#163422]">
                Essential Equipments
              </h3>
            </div>

            <p className="font-hanken text-sm sm:text-base text-[#1C1B1B] max-w-3xl">
              Setting up your first habitat requires precision. Your arachnid's health depends on the micro-climate you create.
            </p>

            <div className="flex flex-col gap-8 sm:gap-14">
              {essentials.map((e) => (
              <div 
              key={e.id}
              className="flex flex-row items-start gap-4 sm:gap-6">
                <span className="font-libre font-bold text-xl sm:text-2xl text-white bg-[#163422] py-2 px-4 sm:px-5 rounded-lg shrink-0">
                  {e.id}
                </span>
                <div className="flex flex-col gap-2">
                  <p className="font-libre font-bold text-xl sm:text-2xl text-[#163422]">
                    {e.title}
                  </p>
                  <p className="font-hanken text-xs sm:text-base text-[#424843] max-w-3xl">
                    {e.desc}
                  </p>
                </div>
              </div>
              ))}
            </div>
          </div>

          <div className="border border-[#C2C8C0] w-full my-10" />

          <div className="flex flex-col gap-6">
            <div className="flex flex-row items-center gap-4">
              <img src={Warning} alt="Warning" className="object-contain"/>
              <h4 className="font-libre font-bold text-2xl sm:text-3xl text-[#163422]">
                Common Mistakes to Avoid
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {warnings.map((w) => (
              <div key={w.id} className="bg-[#F6F3F2] border-l-3 border-[#BA1A1A] p-5 flex flex-col gap-2 rounded-sm w-full">
                <p className="font-hanken font-semibold text-sm text-[#163422] uppercase">
                  {w.title}
                </p>
                <p className="font-hanken text-xs sm:text-sm text-[#424843]">
                  {w.desc}
                </p>
              </div>
              ))}
            </div>
          </div>

          <div className="bg-[#2D4B37] mt-10 mb-16 p-6 sm:p-8 flex flex-col items-center justify-center gap-4 rounded-md text-center">
            <p className="font-libre font-bold text-xl sm:text-2xl text-[#99BAA1]">
              Ready to choose your first companion?
            </p>
            <p className="font-hanken text-xs sm:text-base text-[#99BAA1]">
              Browse our ethically sourced beginner-friendly species, curated by experts.
            </p>
          </div>

          </Container>

        </div>
  )
}

export default BeginnerGuide