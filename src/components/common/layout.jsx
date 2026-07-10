import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from "../Navbar"
import Footer from "../Footer"
import { Toaster } from "sonner"

const layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FCF9F8]">
      <Toaster richColors position="top-center" />
      <Navbar />
      <div className="flex-grow">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}

export default layout