import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from "../Navbar"
import Footer from "../Footer"

const layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FCF9F8]">
      <Navbar />
      <div className="flex-grow">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}

export default layout