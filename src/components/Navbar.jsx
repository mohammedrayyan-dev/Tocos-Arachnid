import {useEffect, useState} from "react"
import TocoLogo from "/src/assets/image/tocos-logo.png"
import Container from "./common/Container"
import { Link, NavLink, useNavigate } from "react-router-dom"
import Arrow from "/src/assets/image/icons/arrow.svg"
import Search from "/src/assets/image/icons/search.svg"
import Cart from "/src/assets/image/icons/cart.svg"
import Profile from "/src/assets/image/icons/profile.svg"
import SpiderProfile from "/src/assets/image/icons/spider-profile.svg"
import CustomerLogin from "../pages/CustomerLogin"
import { searchProducts } from "../data/productService"
import { useAuth } from "../context/AuthContext"
import { supabase } from "../lib/supabase"
import { toast } from "sonner"
import { signOut } from "../lib/auth"

const menuData = [
    {
        label: "Home",
        href: "/"
    },
    {
        label: "Shop",
        options: [ 
            {
                label: "Tarantulas",
                subOptions: [ "New World", "Old World" ]
            },
            {
                label: "Tailless Amphibians",
                subOptions: [ "Pacman", "Tree Frog" ]
            },
            {
                label: "Reptiles",
                subOptions: [ "Snakes", "Lizards" ]
            },
            {
                label: "Live Feeds",
                subOptions: [ "Worms", "Roaches" ]
            },
         ]
    },
    {
        label: "Enclosure",
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
                subOptions: [ "Lights", "Substrates" ]
            },
         ]
    },
    {
        label: "Care Guides",
        href: "/care-guides"
    }
]

const userOption = [
    { option: "Order History", link: "" },
    { option: "Accessories", link: "" },
]

const Navbar = () => {

    const { user } = useAuth()

    const [openMenu, setOpenMenu] = useState(null)
    const [activeOption, setActiveOption] = useState(null)

    const [showLogin, setShowLogin] = useState(false)

    const [searchTerm, setSearchTerm] = useState("")
    const [searchResults, setSearchResults] = useState([])
    const [searchLoading, setSearchLoading] = useState(false)
    const [userOptions, setUserOptions] = useState(false)

    const navigate = useNavigate()

    const handleUserOptions = () => {
        if (!user) {
            setShowLogin(true)
            toast.info("Please log in to access your account.")
        } else {
            setUserOptions(!userOptions)
        }
    }

    const handleCartClick = () => {
        if (!user) {
            setShowLogin(true)
            toast.info("Please log in to access your cart.")
        } else {
            navigate("/cart")
        }
    }

    const handleSignOut = async () => {
        try {
            await signOut()
            setUserOptions(false)
            toast.success("Logged out successfully!")
        } catch (error) {
            toast.error(error.message || "An error occured! please try again")
        }
    }

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

    const toSlug = (str) => str.toLowerCase().replace(/\s+/g, "-")

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setSearchResults([])
            return
        }

        setSearchLoading(true)
        const timeout = setTimeout(async() => {
            const results = await searchProducts(searchTerm)
            setSearchResults(results)
            setSearchLoading(false)
        }, 300)

        return () => clearTimeout(timeout)
    }, [searchTerm])

  return (
    <>

    <div className="bg-[#FCF9F8] py-4 relative">

        <Container>

        <div className="flex flex-row items-center justify-center gap-10">

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

    <div className="relative">
    <div className="flex flex-row items-center justify-start gap-4 bg-[#F0EDED] border border-[#C2C8C0] p-3 w-[349px] rounded-lg">
        <img src={Search} alt="Search" className="w-6 object-contain" />
        <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search our collection..."
            className="font-sand text-sm text-[#6B7280] focus:outline-none w-full bg-transparent"
        />
    </div>

    {searchTerm.trim() !== "" && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white border border-[#CFD3D4] rounded-lg shadow-sm z-50 max-h-80 overflow-y-auto">
            {searchLoading && (
                <p className="px-4 py-3 text-sm text-[#6B7280]">Searching...</p>
            )}

            {!searchLoading && searchResults.length === 0 && (
                <p className="px-4 py-3 text-sm text-[#6B7280]">No products found.</p>
            )}

            {!searchLoading && searchResults.map((product) => {
                const toSlug = (str) => str.toLowerCase().replace(/\s+/g, "-")
                return (
                    <Link
                        key={product.id}
                        to={`/${toSlug(product.category)}/${toSlug(product.sub_category)}}/${product.slug}`}
                        onClick={() => setSearchTerm("")}
                        className="flex flex-row items-center gap-3 px-4 py-2 hover:bg-[#F0EDED]"
                    >
                        <img
                            src={product.thumbnail}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded"
                        />
                        <div className="flex flex-col">
                            <span className="text-sm text-[#163422]">{product.name}</span>
                            <span className="text-xs text-[#6B7280]">₹{Number(product.price).toFixed(2)}</span>
                        </div>
                    </Link>
                )
            })}
        </div>
    )}
</div>  

        <div className="flex flex-row items-center gap-4">
            <button
            onClick={handleCartClick}
            className="cursor-pointer">
                <img src={Cart} alt="Cart" className="w-5 object-contain" />
            </button>
            <button
            onClick={handleUserOptions} 
            className="relative cursor-pointer">
                {!user ? 
                <img src={Profile} alt="Profile" className="w-5 object-contain" /> :
                <img src={SpiderProfile} alt="Spider Profile" className="w-8 object-contain" />
                }
            </button>
        </div>

        {!user && (
        <button
        onClick={() => setShowLogin(true)}
        className="bg-[#163422] text-white font-sans text-xs py-2 px-6 rounded-md cursor-pointer">
            Sign In
        </button>
        )}

        </div>

        </Container>

            {openItem && (
                    <div className="absolute top-full bg-white border-t border-[#785832] flex flex-row z-50 w-full">

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
                                to={`/${toSlug(currentOption.label)}/${toSlug(sub)}`}
                                onClick={closeMenu}
                                className="font-hanken text-base text-[#424843]">
                                    {sub}
                                </Link>
                            ))}
                        </div>

                    </div>
                )}
            
            {userOptions && (

            <div className="absolute right-25 bg-white border border-[#C2C8C0] shadow-xl z-50 p-6">
                <div className="flex flex-col gap-3 text-right">
                    {userOption.map((u) => (
                        <Link 
                        to={u.link} 
                        className="font-hanken text-base text-regular hover:text-semibold text-[#424843] hover:text-[#163422]">
                            {u.option}
                        </Link>
                    ))}
                    <button
                    onClick={handleSignOut}
                    className="font-hanken text-base text-regular hover:text-semibold text-[#424843] hover:text-[#163422] text-right cursor-pointer">
                        Logout
                    </button>
                </div>
            </div>

            )}

    </div>


        
        {showLogin && (
            <CustomerLogin onClose={() => setShowLogin(false)} />
        )}

    </>
  )
}

export default Navbar
