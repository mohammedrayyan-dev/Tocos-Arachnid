import React from 'react'
import Hero from "/src/assets/image/hero-image.webp"
import Container from "./common/Container"
import RightArrow from "/src/assets/image/icons/right-arrow.svg"
import { Link } from 'react-router-dom'

const HeroSection = () => {
  return (
        <div className="relative min-h-[744px]">
            <img src={Hero} alt="Hero" className="w-full h-full" />

        <div className="absolute inset-0 bg-black/30" />

        <Container>

        <div className="absolute inset-1 flex flex-col py-60 px-20 gap-5">
          <h1 className="font-libre text-white text-5xl font-semibold max-w-lg">
            Exotic Arachnids for the 
            <span className="ml-3 text-[#C8EBD0]">Modern Keeper</span>
          </h1>
          <p className="text-xl text-white font-hanken max-w-3xl">
            Discover a curated collection of rare, ethically-raised tarantulas. From vibrant New World species to legendary Old World masters, we bring the wild's raw beauty into your home.
          </p>
          <div className="flex flex-row gap-6">
            <Link 
            to="/shop-all"
            className="bg-[#163422] py-4 px-8 text-white text-xs font-hanken rounded-md cursor-pointer flex flex-row items-center gap-2">
              Explore Collection
              <img src={RightArrow} alt="Right Arrow" className="object-contain" />
            </Link>
            <Link
            to="/beginner-guide"
            className="bg-white/10 py-4 px-6 text-white text-xs font-hanken rounded-md border border-white/40 backdrop-blur-xs cursor-pointer">
              Beginner Guide
            </Link>
          </div>
        </div>

        </Container>

        </div>
  )
}

export default HeroSection