import Container from "../../components/common/Container"
import Reset from "/src/assets/image/icons/reset.svg"
import Security from "/src/assets/image/icons/security.svg"
import RightArrow from "/src/assets/image/icons/right-arrow.svg"
import GreyArrow from "/src/assets/image/icons/grey-arrow.svg"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { resetPassword } from "../../lib/auth"
import { toast } from "sonner"
import Button from "../../components/common/Button"

const ForgotPassword = () => {

    const navigate = useNavigate()

    const [showLogin, setShowLogin] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        const email = e.target.email.value

        try {
            await resetPassword(email)
            navigate("/forgot-password/success", { state: { email } })
        } catch (err) {
            if (err.status === 429) {
                toast.error("Too many attempts. Please wait a few minutes and try again.")
            } else {
                toast.error(err.message || "Something went wrong please try again")
            }
        } finally {
            setLoading(false)
        }
    }

  return (
    <>

    <Container>

        <div className="flex flex-col items-center justify-center mt-8">
            <h1 className="font-libre font-bold text-2xl text-[#163422]">
                Toco's Arachnid
            </h1>

            <div className="bg-white border border-[#C2C8C030] rounded-sm p-10 mt-14 flex flex-col justify-center items-center shadow-sm gap-5">
                <div className="flex items-center justify-center bg-[#2D4B3710] p-4 rounded-lg ">
                    <img src={Reset} alt="Reset" className="w-7 object-contain" />
                </div>
                <h1 className="font-libre font-bold text-3xl text-[#163422]">
                    Forgot Password?
                </h1>
                <p className="font-hanken text-base text-[#424843] text-center max-w-70">
                    Enter your email below and we'll send you a link to reset your account access.
                </p>
                <div className="bg-[#F6F3F2] border-l-2 border-[#163422] p-5 flex flex-row items-start gap-4">
                    <img src={Security} alt="Security" className="w-3 object-contain"/>
                    <p className="font-hanken text-xs text-[#424843] max-w-72.5">
                        Your security is our priority. We treat your data with the same care we give to our rarest specimens.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col w-full gap-6">
                <div className="flex flex-col w-full gap-3">
                <label
                className="font-hanken font-medium text-xs text-[#1C1B1B] uppercase"
                > Email Address </label>
                <input 
                name="email"
                type="email"
                placeholder="curator@arachnefern.com"
                className="font-hanken text-base text-[#424843] p-4 border border-[#C2C8C0] rounded-sm focus:outline-none" />
                </div>
                <Button
                type="submit"
                disabled={loading}
                variant="brandb"
                className="p-4 w-full rounded-sm gap-2">
                    {loading ? "Sending..." : "Send Reset Link"}
                <img src={RightArrow} alt="Right Arrow" className="w-3 object-contain"/>
                </Button>
                </form>

                <Button
                onClick={() => navigate('/sign-in')}
                variant="none"
                className="font-semibold text-sm text-[#424843] gap-2">
                <img src={GreyArrow} alt="Right Arrow" className="w-4 object-contain"/>
                Back to Login
                </Button>
            </div>
        </div>
    </Container>
    </>
  )
}

export default ForgotPassword