import { signIn } from '../../lib/auth'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'sonner'
import { useState } from 'react'

const AdminLogin = () => {
    const navigate = useNavigate()
    const { setSessionUser } = useAuth()
    const [loading, setLoading] = useState(false)

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
            <input name="password" type="password" placeholder="Password" className="border rounded-md px-4 py-2" />
            <button type="submit" className="bg-[#163422] text-white rounded-md py-2">
                Sign In as Admin
            </button>
        </form>
    )
}

export default AdminLogin