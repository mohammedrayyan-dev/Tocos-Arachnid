import Container from "../../components/common/Container"
import Tick from "/src/assets/image/icons/circle-tick.svg"
import { toast } from "sonner"
import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import Button from "../../components/common/Button"

const ResetSuccess = () => {

    const navigate = useNavigate()
    const location = useLocation()
    const email = location.state?.email

    const [resending, setResending] = useState(false)

    const handleResend = async () => {
        setResending(true)
        try {
            await resetPassword(email)
            toast.success("Reset link sent again!")
        } catch (err) {
            toast.error (err.message || "Something went wrong")
        } finally {
            setResending(false)
        }
    }

  return (
    <>

    <Container>

        <div className="flex flex-col items-center justify-center mt-8">
            <h1 className="font-libre font-bold text-2xl text-[#163422]">
                Toco's Arachnid
            </h1>

            <div className="bg-white border border-[#C2C8C030] rounded-sm p-10 mt-14 flex flex-col items-center shadow-sm gap-5">
                <div className="flex items-center justify-center bg-[#2D4B3710] p-4 rounded-lg ">
                    <img src={Tick} alt="Tick" className="w-7 object-contain" />
                </div>
                <h1 className="font-libre font-bold text-3xl text-[#163422] text-center">
                    Password Updated
                </h1>
                <p className="font-hanken text-base text-[#424843] text-center max-w-87.5">
                    Your password has been changed successfully. You can now sign in using your new password. For security reasons, any previous reset links are now invalid.
                </p>
                <Button
                type="submit"
                onClick={() => navigate('/sign-in')}
                variant="brandb"
                className="py-4 w-full my-7">
                    Back to Login
                </Button>
            </div>
        </div>
    </Container>
    </>
  )
}

export default ResetSuccess