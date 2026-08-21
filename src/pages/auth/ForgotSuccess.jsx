import Container from "../../components/common/Container"
import Mail from "/src/assets/image/icons/mail.svg"
import GreyArrow from "/src/assets/image/icons/grey-arrow.svg"
import { resetPassword } from "../../lib/auth"
import { toast } from "sonner"
import { useState } from "react"
import { useLocation } from "react-router-dom"
import Button from "../../components/common/Button"

const lists = [
    {
        id: 1,
        desc: "Check your spam folder"
     },
    {
        id: 2,
        desc: "Wait a few minutes"
    },
    {
        id: 3,
        desc: "Request another reset link"
    }
]

const ForgotSuccess = () => {

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
                    <img src={Mail} alt="Mail" className="w-7 object-contain" />
                </div>
                <h1 className="font-libre font-bold text-3xl text-[#163422] text-center">
                    Check Your Email
                </h1>
                <p className="font-hanken text-base text-[#424843] text-center max-w-sm">
                    If an account exists for this email, we've sent a password reset link.
                </p>
                <Button
                href="https://mail.google.com"
                target= "_blank"
                rel= "noopener noreferrer"
                variant="brandb"
                className="p-4 w-full rounded-sm">
                    Open Email
                </Button>
                <Button
                name="email"
                type="submit"
                onClick={handleResend}
                disabled={resending}
                variant="outline"
                className="p-4 w-full rounded-sm">
                    { resending ? "Resending..." : "Resend Email" }
                </Button>
                <div className="border border-[#C2C8C030] w-full my-3"/>
                <div className="flex flex-col items-start text-left w-full">
                    <p className="font-hanken font-semibold text-sm text-[#163422]">
                        Didn't receive the email?
                    </p>
                    <ul className="list-disc flex flex-col gap-1 text-[#785832]">
                        {lists.map((l) => (
                        <li 
                        key={l.id}
                        className="font-hanken font-semibold text-sm text-[#424843] mt-2 ml-3">
                            {l.desc}
                        </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    </Container>

    </>
  )
}

export default ForgotSuccess