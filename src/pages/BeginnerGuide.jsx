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

          <div className="relative min-h-[744px]">
            <img src={Beginner} alt="Beginner Guide" className="w-full h-full" />

            <div className="absolute inset-0 bg-black/40"/>

          <Container>

          <div className="absolute inset-1 flex flex-col items-center justify-center gap-4">
            <h1 className="font-libre font-bold text-white text-5xl">
              The Beginner's Journey
            </h1>
            <p className="font-hanken text-white text-lg">
              Expert knowledge for every keeper, from the first enclosure to a thriving collection.
            </p>
          </div>

          </Container>

          </div>

          <Container>

          <p className="font-hanken text-base text-center text-[#424843] py-12">
            "Owning an invertebrate is more than just keeping a pet it's a window into an ancient, miniature world."
          </p>

          <div className="flex flex-col gap-6">
            <div className="flex flex-row items-center gap-4">
              <img src={Bug} className="w-6 object-contain" />
              <h2 className="font-libre font-bold text-3xl text-[#163422]">
                Choosing Your First Species
              </h2>
            </div>

            <p className="font-hanken text-base text-[#1C1B1B] max-w-3xl">
              For newcomers, we recommend "New World" terrestrial species. They are generally slower, possess milder venom, and have straightforward habitat requirements.
            </p>

            <div className="flex flex-row justify-between gap-6">
              {firstSpecies.map((f) => (
              <div className="bg-white border border-[#C2C8C0] p-5 flex flex-col gap-3">
                <img src={f.img} className="w-[474px] object-contain"/>
                <p className="font-libre font-bold text-2xl text-[#163422]">
                  {f.name}
                </p>
                <div className="flex flex-row gap-2">
                  {f.kind.map((k) => (
                  <span className="bg-[#F0EDED] font-hanken font-bold text-[#424843] text-xs uppercase p-2 rounded-sm">
                    {k}
                  </span>
                  ))}
                </div>
                <p className="font-hanken text-base text-[#424843] max-w-xs">
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
              <h3 className="font-libre font-bold text-3xl text-[#163422]">
                Essential Equipments
              </h3>
            </div>

            <p className="font-hanken text-base text-[#1C1B1B] max-w-3xl">
              Setting up your first habitat requires precision. Your arachnid's health depends on the micro-climate you create.
            </p>

            <div className="flex flex-col gap-18">
              {essentials.map((e) => (
              <div 
              key={e.id}
              className="flex flex-row items-start gap-6">
                <span className="font-libre font-bold text-2xl text-white bg-[#163422] py-2 px-5 rounded-lg">
                  {e.id}
                </span>
                <div className="flex flex-col gap-2">
                  <p className="font-libre font-bold text-2xl text-[#163422]">
                    {e.title}
                  </p>
                  <p className="font-hanken text-regular text-[#424843] max-w-3xl">
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
              <h4 className="font-libre font-bold text-3xl text-[#163422]">
                Common Mistakes to Avoid
              </h4>
            </div>

            <div className="flex flex-row gap-6">
              {warnings.map((w) => (
              <div className="bg-[#F6F3F2] border-l-3 border-[#BA1A1A] min-w-[342px] p-5 flex flex-col gap-2 rounded-sm">
                <p className="font-haken font-semibold text-sm text-[#163422] uppercase">
                  {w.title}
                </p>
                <p className="font-hanken text-sm text-[#424843] max-w-[200px]">
                  {w.desc}
                </p>
              </div>
              ))}
            </div>
          </div>

          <div className="bg-[#2D4B37] my-10 p-6 flex flex-col items-center justify-center gap-4  rounded-md">
            <p className="font-libre font-bold text-2xl text-[#99BAA1]">
              Ready to choose your first companion?
            </p>
            <p className="font-hanken text-base text-[#99BAA1]">
              Browse our ethically sourced beginner-friendly species, curated by experts.
            </p>
          </div>

          </Container>

        </div>
  )
}

export default BeginnerGuide