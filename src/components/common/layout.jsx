import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from "../Navbar"
import Footer from "../Footer"

const layout = () => {
  return (
    <div className="min-h-screen bg-[#FCF9F8]">
        <Navbar />
        <div>
            <Outlet />
        </div>
        <Footer />
    </div>
  )
}

export default layout