import React from 'react'
import Hero from "/src/assets/image/hero-image.webp"
import Container from "./common/Container"
import RightArrow from "/src/assets/image/icons/right-arrow.svg"
import { Link } from 'react-router-dom'
import Button from './common/Button'

const HeroSection = () => {
  return (
    <div className="relative min-h-95 sm:min-h-120 lg:min-h-175 flex items-center overflow-hidden">
      {/* Background Image */}
      <img 
        src={Hero} 
        alt="Hero" 
        className="absolute inset-0 w-full h-full object-cover object-center" 
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40 z-10" />

      {/* Text Content Overlay */}
      <Container className="relative z-20 w-full">
        <div className="flex flex-col py-10 sm:py-16 md:py-24 lg:py-32 gap-4 sm:gap-5 max-w-3xl">
          <h1 className="font-libre text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight drop-shadow-md">
            Exotic Arachnids for the 
            <span className="block sm:inline sm:ml-3 text-[#C8EBD0]">Modern Keeper</span>
          </h1>
          
          <p className="text-xs sm:text-base md:text-lg lg:text-xl text-white font-hanken leading-relaxed max-w-2xl drop-shadow-xs">
            Discover a curated collection of rare, ethically-raised tarantulas. From vibrant New World species to legendary Old World masters, we bring the wild's raw beauty into your home.
          </p>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
            <Button 
              to="/shop-all"
              variant="brandr"
              className="h-11 sm:h-12 md:h-13 px-5 sm:px-6 md:px-8 gap-2.5 text-xs sm:text-sm font-bold flex items-center justify-center cursor-pointer shadow-md rounded-md bg-[#163422] hover:bg-[#0D2316] text-white"
            >
              <span>Explore Collection</span>
              <img src={RightArrow} alt="Right Arrow" className="w-4 h-4 object-contain shrink-0" />
            </Button>
            
            <Link
              to="/beginner-guide"
              className="h-11 sm:h-12 md:h-13 px-5 sm:px-6 md:px-8 text-xs sm:text-sm font-bold text-white rounded-md border border-white/40 bg-white/15 hover:bg-white/25 backdrop-blur-xs transition cursor-pointer text-center flex items-center justify-center"
            >
              Beginner Guide
            </Link>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default HeroSection