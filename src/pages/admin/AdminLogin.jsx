import { signIn } from '../../lib/auth'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'sonner'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const AdminLogin = () => {
    const navigate = useNavigate()
    const { setSessionUser } = useAuth()
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        const email = e.target.email.value
        const password = e.target.password.value

        try {
            setLoading(true)
            const { user } = await signIn(email, password)

            if (!user) {
                toast.error('Failed to sign in')
                return
            }

            const { isAdmin: isRoleAdmin } = setSessionUser ? await setSessionUser(user) : { isAdmin: false }

            if (!isRoleAdmin) {
                toast.error('You are not authorized as an admin')
                await supabase.auth.signOut()
                return
            }

            toast.success('Admin signed in successfully!')
            navigate('/admin', { replace: true })
        } catch (err) {
            toast.error(err.message || 'Failed to sign in as admin')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm">
            <h2 className="text-2xl font-medium">Admin Login</h2>
            <input name="email" type="email" placeholder="Email" className="border rounded-md px-4 py-2" />
            <div className="relative flex items-center">
                <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full border rounded-md pl-4 pr-10 py-2"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-[#6E756F] hover:text-[#163422] focus:outline-none transition cursor-pointer p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                    ) : (
                        <Eye className="w-4 h-4" />
                    )}
                </button>
            </div>
            <button type="submit" disabled={loading} className="bg-[#163422] text-white rounded-md py-2 disabled:opacity-50">
                {loading ? 'Signing In...' : 'Sign In as Admin'}
            </button>
        </form>
    )
}

export default AdminLogin