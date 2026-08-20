import React from 'react'
import RawBeautys from "../assets/image/raw-beauty-banner.webp"
import Container from "./common/Container"
import Button from "./common/Button"

const RawBeauty = () => {
  return (
    <div className="relative min-h-90 sm:min-h-110 flex items-center justify-center overflow-hidden">
      <img 
        src={RawBeautys} 
        alt="Raw Beauty" 
        className="absolute inset-0 w-full h-full object-cover object-center" 
      />
      <div className="absolute inset-0 bg-black/60" />

      <Container className="relative z-10 py-12 sm:py-16 text-center">
        <div className="flex flex-col justify-center items-center gap-4 max-w-2xl mx-auto">
          <h1 className="font-libre text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight">
            Respect the Raw Beauty
          </h1>
          <p className="font-hanken text-white/90 text-xs sm:text-sm md:text-base leading-relaxed px-2 sm:px-4">
            Join a community of enthusiasts who value ethics, expertise, and the preservation of these misunderstood masterpieces of evolution.
          </p>
          <Button
            to="/featured/new-arrivals"
            variant="secondary"
            className="h-11 sm:h-12 md:h-13 px-6 sm:px-8 md:px-10 text-xs sm:text-sm font-bold mt-2 rounded-md"
          >
            View New Arrivals
          </Button>
        </div>
      </Container>
    </div>
  )
}

export default RawBeauty