import HeroSection from "../components/HeroSection"
import FeaturedSection from "../components/FeaturedSection"
import Adoption from "../components/Adoption"
import RawBeauty from "../components/RawBeauty"
import KeepersSay from "../components/KeepersSay"

const Home = () => {
  return (
    <>
        <HeroSection />

        <FeaturedSection
        type="Recommended Beginner"
        title="Recommended for Beginners"
        description="Docile, hardy, and stunningly beautiful starter species." 
        />

        <Adoption />

        <RawBeauty />

        <FeaturedSection
        type="Collectors Choice"
        title="Collectors Choice: Best Sellers"
        description="Rare and remarkable species for the serious keeper." 
        />

        <KeepersSay />
    </>
  )
}

export default Home