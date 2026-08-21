import Container from "../../components/common/Container"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { supabase } from "../../lib/supabase"
import { useAuth } from "../../context/AuthContext"

const standards = [
  "Minimum 6 characters",
  "One uppercase letter",
  "One lowercase letter",
  "One number",
  "One special character"
]

const ResetPassword = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [loading, setLoading] = useState(false)

  // Strict session security verification
  useEffect(() => {
    const verifyUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session && !user) {
        toast.error("Security Check: You must be signed in to modify account settings.")
        navigate("/sign-in", { replace: true })
      }
    }
    verifyUserSession()
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const newPassword = e.target["newPassword"].value
    const confirmPassword = e.target["confirmPassword"].value

    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in both password fields.")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.")
      return
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.")
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error

      toast.success("Password updated successfully!")
      navigate("/reset-password/success")
    } catch (err) {
      toast.error(err.message || "Failed to update password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white min-h-screen py-10">
      <Container>
        <div className="flex flex-col items-center justify-center mt-4">
          <h1 className="font-libre font-bold text-2xl text-[#163422] mb-6">
            Toco's Arachnid
          </h1>

          <div className="bg-white border border-[#E5E2DC] rounded-md p-8 md:p-10 max-w-lg w-full flex flex-col justify-center items-center shadow-xs gap-5">
            
            <div className="flex flex-col gap-1.5 text-center w-full">
              <h2 className="font-libre font-bold text-3xl text-[#1C1B1B]">
                Create New Password
              </h2>
              <p className="font-hanken text-sm text-[#525B54]">
                Create a strong password to secure your account.
              </p>

              {/* Active Account Badge */}
              <div className="mt-3 bg-[#FAF8F5] border border-[#E5E2DC] p-3 rounded-md flex items-center justify-between text-left">
                <span className="font-hanken text-xs font-bold text-[#163422] uppercase tracking-wider">
                  Target Account:
                </span>
                <span className="font-hanken text-xs font-semibold text-[#1C1B1B] truncate ml-2">
                  {user?.email || "rayyan@example.com"}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col w-full gap-5 mt-2">
              <div className="flex flex-col w-full gap-1.5">
                <label className="font-hanken font-semibold text-xs text-[#525B54] uppercase tracking-wider">
                  New Password
                </label>
                <input
                  name="newPassword"
                  type="password"
                  placeholder="••••••••••••"
                  className="font-hanken text-sm text-[#1C1B1B] p-3 border border-[#E5E2DC] rounded-md focus:outline-none focus:border-[#163422]"
                />
              </div>

              <div className="flex flex-col w-full gap-1.5">
                <label className="font-hanken font-semibold text-xs text-[#525B54] uppercase tracking-wider">
                  Confirm Password
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••••••"
                  className="font-hanken text-sm text-[#1C1B1B] p-3 border border-[#E5E2DC] rounded-md focus:outline-none focus:border-[#163422]"
                />
              </div>

              <div className="bg-[#FAF8F5] border-l-2 border-[#163422] p-4 flex flex-col gap-1.5 rounded-r-md">
                <p className="font-hanken font-bold text-xs text-[#163422] uppercase tracking-wider">
                  Security Standards
                </p>
                {standards.map((s, idx) => (
                  <p key={idx} className="font-hanken text-xs text-[#525B54]">
                    • {s}
                  </p>
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#163422] hover:bg-[#0D2316] text-white font-hanken font-bold text-xs uppercase tracking-widest rounded-md transition cursor-pointer shadow-xs disabled:opacity-50 mt-2"
              >
                {loading ? "Updating Password..." : "Update Password"}
              </button>
            </form>

            <button
              onClick={() => navigate("/profile")}
              className="font-hanken text-xs text-[#525B54] hover:text-[#163422] underline cursor-pointer mt-2"
            >
              Return to Profile
            </button>

          </div>
        </div>
      </Container>
    </div>
  )
}

export default ResetPassword