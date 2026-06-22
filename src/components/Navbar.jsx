import {useState} from 'react'
import TocoLogo from "/src/assets/image/tocos-logo.png"
import Container from './common/Container'
import { Link, NavLink } from 'react-router-dom'
import Arrow from "/src/assets/image/icons/arrow.svg"
import Search from "/src/assets/image/icons/search.svg"
import Cart from "/src/assets/image/icons/cart.svg"
import Profile from "/src/assets/image/icons/profile.svg"
import CustomerLogin from '../pages/CustomerLogin'

const menuData = [
    {
        label: "Home",
        href: "/"
    },
    {
        label: "Shop",
        options: [ 
            {
                label: "Isopods",
                subOptions: [ "All Isopods" , "Colony" ]
            },
            {
                label: "Tarantulas",
                subOptions: []
            },
            {
                label: "Tailless Amphibians",
                subOptions: []
            },
            {
                label: "Reptiles",
                subOptions: []
            },
            {
                label: "Live Feeds",
                subOptions: []
            },
         ]
    },
    {
        label: "Enclosue",
        options: [ 
            {
                label: "Acrylic Enclosure",
                subOptions: [ "Full Enclosure in Acrylic", "Acrylic Cribs" ]
            },
            {
                label: "Glass Enclosure",
                subOptions: [ "Full Enclosure in Glass", "Glass Cribs" ]
            },
            {
                label: "Accessories",
                subOptions: [ "", "" ]
            },
         ]
    },
    {
        label: "Beginners",
        href: "/beginner-guide"
    },
    {
        label: "Care Guides",
        href: "/care-guides"
    }
]

const Navbar = () => {

    const [openMenu, setOpenMenu] = useState(null)
    const [activeOption, setActiveOption] = useState(null)

    const [showLogin, setShowLogin] = useState(false)

    const toggleMenu = (m) => {
        const isAlreadyOpen = openMenu === m.label
        setOpenMenu(isAlreadyOpen ? null : m.label)
        setActiveOption(isAlreadyOpen ? null : m.options[0].label)
    }

    const closeMenu = () => {
        setOpenMenu(null)
        setActiveOption(null)
    }

    const openItem = menuData.find((m) => m.label === openMenu)
    const currentOption = openItem?.options.find((o) => o.label === activeOption)

  return (
    <>

    <div className="bg-[#FCF9F8] py-4">

        <Container>

        <div className="flex flex-row items-center justify-between">

        <div className="flex flex-row items-center gap-3">
            <img src={TocoLogo} alt="Toco Logo" className="w-6 h-6 object-contain" />
            <h1 className="text-xl font-sand font-semibold text-[#003710]">
                Toco's Arachnid
            </h1>
        </div>
        
        <div className="flex flex-row items-center gap-4 font-hanken text-base text-[#163422]">
            {menuData.map((m) => {
                if (!m.options) {
                    return (
                        <NavLink
                        key={m.label}
                        to={m.href}
                        className={({ isActive }) => `relative  pb-2 ${isActive ? "after:absolute after:left-0 after:bottom-0 after:w-full after:h-[4px] after:rounded-full after:bg-[#785832]" : "" }` }
                        >
                        {m.label} 
                        </NavLink>
                    )
                }

                const isOpen = openMenu === m.label
                return (
                    <div key={m.label} className="relative">
                        <button 
                        onClick={() => toggleMenu(m)}
                        className="flex flex-row items-center gap-2 cursor-pointer pb-2">
                            {m.label}
                            <img src={Arrow} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                        </button>
                        {isOpen && (
                            <span className="absolute left-0 bottom-0 w-full h-[4px] rounded-full bg-[#785832]" />
                        )}
                    </div>
                )
                })}
        </div>

        <div className="flex flex-row items-center justify-start gap-4 bg-[#F0EDED] border border-[#C2C8C0] p-3 w-[349px] rounded-lg">
            <img src={Search} alt="Search" className="w-6 object-contain" />
            <input 
            type="text" 
            placeholder="Search our collection..."
            className="font-sand text-sm text-[#6B7280] focus:outline-none"
            />
        </div>

        <div className="flex flex-row items-center gap-4">
            <Link
            to="/cart">
                <img src={Cart} alt="Cart" className="w-5 object-contain" />
            </Link>
            <button>
                <img src={Profile} alt="Profile" className="w-5 object-contain" />
            </button>
        </div>

        <button
        onClick={() => setShowLogin(true)}
        className="bg-[#163422] text-white font-sans text-xs py-2 px-6 rounded-md cursor-pointer">
            Sign In
        </button>

        </div>

        </Container>

    </div>

    {openItem && (
                    <div className="absolute bg-white border-t border-[#785832] flex flex-row z-50 w-full">

                        <div className="flex flex-col gap-5 min-w-[244px] p-8">
                            {openItem.options.map((o) => (
                                <button
                                key={o.label}
                                onMouseEnter={() => setActiveOption(o.label)}
                                onClick={() => setActiveOption(o.label)}
                                className="flex flex-row items-center justify-end gap-2 font-hanken text-base font-semibold text-[#163422] cursor-pointer">
                                    {o.label}
                                    <img src={Arrow} className="rotate-270" />
                                </button>
                            ))}
                        </div>

                        <div className="bg-[#FCF9F8] flex flex-col gap-5 w-full p-8">
                            {currentOption?.subOptions.map((sub, i) => (
                                <Link
                                key={i}
                                to="/"
                                onClick={closeMenu}
                                className="font-hanken text-base text-[#424843]">
                                    {sub}
                                </Link>
                            ))}
                        </div>

                    </div>
                )}
        
        {showLogin && (
            <CustomerLogin onClose={() => setShowLogin(false)} />
        )}

    </>
  )
}

export default Navbar
