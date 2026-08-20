import { Link } from "react-router-dom"

const Button = ({ variant = "brand", to, href, children, className, ...props }) => {

    const baseStyles = "flex flex-row items-center justify-center text-sm cursor-pointer transition-all duration-300"

    const variantStyles = {
        brand: "bg-[#163422] font-hanken text-white",
        brandb: "bg-[#163422] font-sans font-semibold text-white",
        brandr: "bg-[#163422] font-sans text-white rounded-sm",
        secondary: "bg-[#785832] font-hanken text-white rounded-sm",
        secondaryb: "bg-[#785832] font-hanken font-semibold text-white rounded-sm",
        outline: "border border-[#163422] font-hanken font-semibold text-[#163422] rounded-sm",
        blur: "",
        none: "font-hanken"
    }

    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${className || ""}`

    if (to) {
      return (
        <Link to={to} className={combinedClassName} {...props}>
          {children}
        </Link>
      )
    }

    if (href) {
      return (
        <a href={href} className={combinedClassName} {...props}>
          {children}
        </a>
      )
    }

  return (
    <button className={combinedClassName} {...props}>
        {children}
    </button>
  )
}

export default Button