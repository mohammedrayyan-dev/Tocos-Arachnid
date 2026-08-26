import { useEffect, useState, useRef } from "react"
import TocoLogo from "/src/assets/image/tocos-logo.png"
import Container from "./common/Container"
import { Link, NavLink, useNavigate } from "react-router-dom"
import Arrow from "/src/assets/image/icons/arrow.svg"
import Search from "/src/assets/image/icons/search.svg"
import Cart from "/src/assets/image/icons/cart.svg"
import Profile from "/src/assets/image/icons/profile.svg"
import { searchProducts } from "../data/productService"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"
import { useStoreSettings } from "../context/StoreSettingsContext"
import { toast } from "sonner"
import { Menu, X, ChevronDown, User, LogOut, ShoppingBag } from 'lucide-react'
import beginnerTarantula from "../assets/image/beginner-tarantula-care.webp"

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
                subOptions: ["New World", "Old World"]
            },
            {
                label: "Tailless Amphibians",
                subOptions: ["Pacman", "Tree Frog"]
            },
            {
                label: "Reptiles",
                subOptions: ["Snakes", "Lizards"]
            },
            {
                label: "Live Feeds",
                subOptions: ["Worms", "Roaches"]
            },
        ]
    },
    {
        label: "Enclosure",
        options: [
            {
                label: "Acrylic Enclosure",
                subOptions: ["Full Enclosure in Acrylic", "Acrylic Cribs"]
            },
            {
                label: "Glass Enclosure",
                subOptions: ["Full Enclosure in Glass", "Glass Cribs"]
            },
            {
                label: "Accessories",
                subOptions: ["Lights", "Substrates"]
            },
        ]
    },
    {
        label: "Care Guides",
        href: "/care-guides"
    }
]

const userOption = [
    { option: "My Profile", link: "/profile" },
    { option: "Order History", link: "/orders" },
]

const Navbar = () => {
    const { user, signOut } = useAuth()
    const { settings } = useStoreSettings()
    const { cartItems } = useCart()

    const [openMenu, setOpenMenu] = useState(null)
    const [activeOption, setActiveOption] = useState(null)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [expandedMobileCategory, setExpandedMobileCategory] = useState(null)

    const [searchTerm, setSearchTerm] = useState("")
    const [searchResults, setSearchResults] = useState([])
    const [searchLoading, setSearchLoading] = useState(false)
    const [userOptions, setUserOptions] = useState(false)

    const dropdownRef = useRef(null)
    const navigate = useNavigate()

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setUserOptions(false)
            }
        }
        if (userOptions) {
            document.addEventListener("mousedown", handleClickOutside)
            document.addEventListener("touchstart", handleClickOutside)
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            document.removeEventListener("touchstart", handleClickOutside)
        }
    }, [userOptions])

    const handleUserOptions = () => {
        if (!user) {
            navigate('/sign-up')
        } else {
            setUserOptions(!userOptions)
        }
    }

    const handleCartClick = () => {
        if (!user) {
            navigate('/sign-up')
        } else {
            navigate("/cart")
        }
    }

    const handleSignOut = async () => {
        try {
            await signOut()
            setUserOptions(false)
            setMobileMenuOpen(false)
            navigate("/")
            toast.success("Logged out successfully!")
        } catch (error) {
            toast.error(error.message || "An error occurred! Please try again")
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
        const timeout = setTimeout(async () => {
            const results = await searchProducts(searchTerm)
            setSearchResults(results)
            setSearchLoading(false)
        }, 300)

        return () => clearTimeout(timeout)
    }, [searchTerm])

    return (
        <div className="bg-[#FCF9F8] py-3 lg:py-4 relative z-50 border-b border-[#E5E2DC]">
            <Container>
                <div className="flex flex-row items-center justify-between gap-3 lg:gap-6 w-full relative">

                    {/* Mobile Hamburger Toggle Button (Left side on mobile/tablet) */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden p-2 rounded-lg text-[#163422] hover:bg-black/5 cursor-pointer shrink-0 z-10"
                        aria-label="Toggle Navigation Menu"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>

                    {/* Brand Logo & Name (Centered on mobile/tablet, Left-aligned on desktop) */}
                    <Link
                        to="/"
                        className="flex flex-row items-center gap-2 sm:gap-3 shrink-0 absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 z-10"
                    >
                        <img src={TocoLogo} alt="Toco Logo" className="w-6 h-6 sm:w-7 sm:h-7 object-contain" />
                        <h1 className="text-lg sm:text-xl font-sand font-bold text-[#003710] whitespace-nowrap">
                            {settings?.storeName || "Toco's Arachnid"}
                        </h1>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className="hidden lg:flex flex-row items-center gap-6 font-hanken text-base text-[#163422] whitespace-nowrap shrink-0">
                        {menuData.map((m) => {
                            if (!m.options) {
                                return (
                                    <NavLink
                                        key={m.label}
                                        to={m.href}
                                        className={({ isActive }) => `relative pb-1 font-semibold ${isActive ? "after:absolute after:left-0 after:bottom-0 after:w-full after:h-0.75 after:rounded-full after:bg-[#785832]" : ""}`}
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
                                        className="flex flex-row items-center gap-1.5 cursor-pointer pb-1 font-semibold whitespace-nowrap"
                                    >
                                        {m.label}
                                        <img src={Arrow} className={`transition-all duration-300 ${isOpen ? "rotate-180" : ""}`} alt="" />
                                    </button>
                                    {isOpen && (
                                        <span className="absolute left-0 bottom-0 w-full h-0.75 rounded-full bg-[#785832]" />
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Desktop Search Bar (Only on Desktop >= 1024px) */}
                    <div className="hidden lg:block relative flex-1 max-w-70 lg:max-w-80">
                        <div className="flex flex-row items-center justify-start gap-2.5 bg-[#F0EDED] border border-[#C2C8C0] p-2 px-3 rounded-lg w-full">
                            <img src={Search} alt="Search" className="w-4 h-4 object-contain shrink-0 opacity-70" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search species..."
                                className="font-sand text-xs sm:text-sm text-[#1C1B1B] focus:outline-none w-full bg-transparent pr-2"
                            />
                            {searchTerm.trim() !== "" && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchTerm("")
                                        setSearchResults([])
                                    }}
                                    className="p-0.5 text-[#6E756F] hover:text-[#163422] cursor-pointer rounded-full shrink-0"
                                    title="Clear search"
                                    aria-label="Clear search"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Search Results Dropdown */}
                        {searchTerm.trim() !== "" && (
                            <div className="absolute top-full left-0 mt-2 w-full bg-white border border-[#CFD3D4] rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
                                {searchLoading && (
                                    <p className="px-4 py-3 text-xs text-[#6B7280]">Searching...</p>
                                )}

                                {!searchLoading && searchResults.length === 0 && (
                                    <p className="px-4 py-3 text-xs text-[#6B7280]">No products found.</p>
                                )}

                                {!searchLoading && searchResults.map((product) => (
                                    <Link
                                        key={product.id}
                                        to={`/${toSlug(product.category || 'shop')}/${toSlug(product.sub_category || 'item')}/${product.slug || product.id}`}
                                        onClick={() => setSearchTerm("")}
                                        className="flex flex-row items-center gap-3 px-4 py-2.5 hover:bg-[#F0EDED] border-b border-gray-100 last:border-0"
                                    >
                                        <img
                                            src={product.thumbnail || product.image}
                                            alt={product.name}
                                            className="w-9 h-9 object-cover rounded shrink-0 border border-[#E5E2DC]"
                                            onError={(e) => {
                                                e.currentTarget.src = beginnerTarantula
                                            }}
                                        />
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs font-bold text-[#163422] truncate">{product.name}</span>
                                            <span className="text-[11px] text-[#6B7280]">₹{Number(product.price).toFixed(2)}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right User & Cart Section */}
                    <div className="flex flex-row items-center gap-2 sm:gap-4 shrink-0 relative z-50">
                        {/* Cart Button */}
                        <button
                            onClick={handleCartClick}
                            className="relative cursor-pointer p-2 rounded-lg hover:bg-black/5 transition"
                            aria-label="Cart"
                        >
                            <img src={Cart} alt="Cart" className="w-5 h-5 object-contain" />
                            {cartItems?.length > 0 && (
                                <span className="absolute -bottom-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#163422] text-[10px] font-bold text-white px-1 leading-none shadow-xs border border-white">
                                    {cartItems.length}
                                </span>
                            )}
                        </button>

                        <div className="hidden lg:block h-6 w-px bg-[#C2C8C0]"></div>

                        {/* Profile Avatar Button & Popover Menu (Mobile, Tablet, Desktop) */}
                        <div className="relative z-50" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={handleUserOptions}
                                className="flex flex-row items-center gap-2 cursor-pointer text-left focus:outline-none p-1 sm:p-1.5 rounded-lg hover:bg-black/5 transition"
                                aria-label="User profile"
                            >
                                <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center overflow-hidden rounded-lg border border-[#C2C8C0] bg-[#F3F0EE] shrink-0">
                                    {!user ? (
                                        <img src={Profile} alt="Profile" className="w-4 h-4 object-contain" />
                                    ) : (
                                        <img
                                            src={user.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80"}
                                            alt="Profile avatar"
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80"
                                            }}
                                        />
                                    )}
                                </div>

                                {user ? (
                                    <div className="hidden lg:flex flex-col leading-tight text-left">
                                        <span className="font-hanken font-bold text-xs text-[#1C1B1B] truncate max-w-28 whitespace-nowrap">
                                            {user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || "Account"}
                                        </span>
                                        <span className="font-hanken text-[10px] text-[#6B7280] truncate max-w-28 whitespace-nowrap">
                                            {user.email}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="hidden lg:flex flex-col leading-tight text-left">
                                        <span className="font-hanken font-bold text-xs text-[#1C1B1B] whitespace-nowrap">
                                            Sign In
                                        </span>
                                    </div>
                                )}
                            </button>

                            {/* User Account Popover Dropdown - 100% Opaque Solid White & Staked Above Everything */}
                            {userOptions && user && (
                                <div className="absolute right-0 top-full mt-2 bg-[#FFFFFF] opacity-100 border border-[#C2C8C0] shadow-2xl z-9999 isolate p-3 rounded-xl w-44 sm:w-48 font-hanken animate-in fade-in zoom-in-95 duration-150">
                                    <div className="flex flex-col gap-1">
                                        {userOption.map((u) => (
                                            <button
                                                key={u.option}
                                                onClick={() => {
                                                    navigate(u.link)
                                                    setUserOptions(false)
                                                }}
                                                className="font-hanken text-xs sm:text-sm text-left text-[#424843] hover:text-[#163422] font-semibold cursor-pointer py-2 px-2.5 rounded-lg hover:bg-[#FAF8F5] transition flex items-center gap-2.5"
                                            >
                                                {u.option === "My Profile" && <User className="w-4 h-4 text-[#163422]" />}
                                                {u.option === "Order History" && <ShoppingBag className="w-4 h-4 text-[#163422]" />}
                                                <span>{u.option}</span>
                                            </button>
                                        ))}
                                        <div className="h-px bg-[#E5E2DC] my-1" />
                                        <button
                                            onClick={handleSignOut}
                                            className="font-hanken text-xs sm:text-sm text-left font-bold text-[#991B1B] hover:text-red-700 cursor-pointer py-2 px-2.5 rounded-lg hover:bg-red-50 transition flex items-center gap-2.5"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </Container>

            {/* Desktop Submenu Mega-Dropdown */}
            {openItem && (
                <div className="hidden lg:flex absolute top-full bg-white border-t border-[#785832] flex-row z-50 w-full shadow-xl">
                    <div className="flex flex-col gap-4 min-w-60 p-6 border-r border-[#E5E2DC]">
                        {openItem.options.map((o) => (
                            <button
                                key={o.label}
                                onMouseEnter={() => setActiveOption(o.label)}
                                onClick={() => setActiveOption(o.label)}
                                className={`flex flex-row items-center justify-between gap-2 font-hanken text-sm font-semibold text-left cursor-pointer transition ${activeOption === o.label ? "text-[#785832]" : "text-[#163422] hover:text-[#785832]"}`}
                            >
                                <span>{o.label}</span>
                                <img src={Arrow} className="-rotate-90 w-3 h-3 opacity-60" alt="" />
                            </button>
                        ))}
                    </div>

                    <div className="bg-[#FCF9F8] flex flex-col gap-3.5 w-full p-6">
                        {currentOption?.subOptions.map((sub, i) => (
                            <Link
                                key={i}
                                to={`/${toSlug(currentOption.label)}/${toSlug(sub)}`}
                                onClick={closeMenu}
                                className="font-hanken text-sm text-[#424843] hover:text-[#163422] hover:font-bold transition"
                            >
                                {sub}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Mobile Navigation Drawer */}
            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 top-15 bg-black/60 z-50 backdrop-blur-xs flex flex-col animate-in fade-in duration-200">
                    <div className="bg-white w-full max-h-[85vh] overflow-y-auto p-5 shadow-2xl flex flex-col gap-4 font-hanken">

                        {/* Mobile Search Input */}
                        <div className="relative w-full mb-2">
                            <div className="flex flex-row items-center gap-2.5 bg-[#F0EDED] border border-[#C2C8C0] p-2.5 px-3 rounded-lg w-full relative">
                                <img src={Search} alt="Search" className="w-4 h-4 object-contain opacity-70 shrink-0" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search products..."
                                    className="font-sand text-sm text-[#1C1B1B] focus:outline-none w-full bg-transparent pr-6"
                                />
                                {searchTerm.trim() !== "" && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchTerm("")
                                            setSearchResults([])
                                        }}
                                        className="p-1 text-[#6E756F] hover:text-[#163422] cursor-pointer rounded-full hover:bg-black/5 shrink-0 transition"
                                        title="Clear search"
                                        aria-label="Clear search"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Floating Overlay Search Dropdown (Does not push layout down) */}
                            {searchTerm.trim() !== "" && (
                                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#CFD3D4] rounded-lg shadow-2xl z-50 max-h-60 overflow-y-auto">
                                    {searchLoading && (
                                        <p className="px-4 py-3 text-xs text-[#6B7280]">Searching products...</p>
                                    )}

                                    {!searchLoading && searchResults.length === 0 && (
                                        <p className="px-4 py-3 text-xs text-[#6B7280]">No products found.</p>
                                    )}

                                    {!searchLoading && searchResults.map((product) => (
                                        <Link
                                            key={product.id}
                                            to={`/${toSlug(product.category || 'shop')}/${toSlug(product.sub_category || 'item')}/${product.slug || product.id}`}
                                            onClick={() => {
                                                setSearchTerm("")
                                                setSearchResults([])
                                                setMobileMenuOpen(false)
                                            }}
                                            className="flex items-center gap-3 p-3 hover:bg-[#FAF8F5] border-b border-gray-100 last:border-0"
                                        >
                                            <img
                                                src={product.thumbnail || product.image}
                                                alt={product.name}
                                                className="w-9 h-9 rounded object-cover shrink-0 border border-[#E5E2DC]"
                                                onError={(e) => {
                                                    e.currentTarget.src = beginnerTarantula
                                                }}
                                            />
                                            <div className="flex flex-col min-w-0 flex-1">
                                                <p className="text-xs font-bold text-[#163422] truncate">{product.name}</p>
                                                <p className="text-[11px] text-[#6E756F] truncate">₹{Number(product.price).toLocaleString('en-IN')}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Navigation Links List */}
                        <div className="flex flex-col divide-y divide-gray-100">
                            {menuData.map((m) => {
                                if (!m.options) {
                                    return (
                                        <NavLink
                                            key={m.label}
                                            to={m.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="py-3 font-bold text-base text-[#163422]"
                                        >
                                            {m.label}
                                        </NavLink>
                                    )
                                }

                                const isExpanded = expandedMobileCategory === m.label

                                return (
                                    <div key={m.label} className="py-2">
                                        <button
                                            onClick={() => setExpandedMobileCategory(isExpanded ? null : m.label)}
                                            className="w-full flex items-center justify-between py-2 font-bold text-base text-[#163422]"
                                        >
                                            <span>{m.label}</span>
                                            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                        </button>

                                        {isExpanded && (
                                            <div className="pl-4 pt-2 pb-3 space-y-3 bg-[#FAF8F5] rounded-lg mt-1">
                                                {m.options.map((opt) => (
                                                    <div key={opt.label} className="space-y-1.5">
                                                        <p className="text-xs font-bold uppercase tracking-wider text-[#785832]">
                                                            {opt.label}
                                                        </p>
                                                        <div className="pl-2 space-y-1">
                                                            {opt.subOptions.map((sub, idx) => (
                                                                <Link
                                                                    key={idx}
                                                                    to={`/${toSlug(opt.label)}/${toSlug(sub)}`}
                                                                    onClick={() => setMobileMenuOpen(false)}
                                                                    className="block text-sm text-[#424843] py-1 hover:text-[#163422]"
                                                                >
                                                                    {sub}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        {/* Mobile User Profile Links */}
                        <div className="pt-4 border-t border-[#E5E2DC] flex flex-col gap-3">
                            {user ? (
                                <>
                                    <div className="flex items-center gap-3 bg-[#FAF8F5] p-3 rounded-lg border border-[#E5E2DC]">
                                        <User className="w-5 h-5 text-[#163422] shrink-0" />
                                        <div className="flex flex-col min-w-0">
                                            <p className="text-xs font-bold text-[#1C1B1B] truncate">{user.user_metadata?.full_name || user.email}</p>
                                            <p className="text-[10px] text-[#6E756F] truncate">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <button
                                            onClick={() => { navigate('/profile'); setMobileMenuOpen(false) }}
                                            className="px-4 py-2.5 border border-[#163422] rounded-md font-bold text-xs text-[#163422] text-center"
                                        >
                                            My Profile
                                        </button>
                                        <button
                                            onClick={() => { navigate('/orders'); setMobileMenuOpen(false) }}
                                            className="px-4 py-2.5 bg-[#163422] text-white rounded-md font-bold text-xs text-center"
                                        >
                                            Order History
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full py-2.5 text-center font-bold text-xs text-[#991B1B] hover:bg-red-50 rounded-md transition mt-1"
                                    >
                                        Sign Out Account
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => { navigate('/sign-up'); setMobileMenuOpen(false) }}
                                    className="w-full py-3 bg-[#163422] text-white rounded-md font-bold text-sm text-center"
                                >
                                    Sign In / Register Account
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            )}
        </div>
    )
}

export default Navbar
