import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { signUp, signIn } from "../lib/auth"

const DEFAULT_INDIAN_MALE_AVATAR = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)

    const checkAdminRole = async (currentUser) => {
        if (!currentUser) {
            setIsAdmin(false)
            return false
        }

        // 1. Check user metadata or email fallback
        if (currentUser.user_metadata?.role === 'admin' || currentUser.email === 'admin@tocos.com') {
            setIsAdmin(true)
            return true
        }

        // 2. Check Supabase profiles table
        try {
            const { data } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", currentUser.id)
                .maybeSingle()

            const adminFlag = data?.role === "admin"
            setIsAdmin(adminFlag)
            return adminFlag
        } catch (err) {
            console.error("Profile check error:", err)
            setIsAdmin(false)
            return false
        }
    }

    const setSessionUser = async (sessionUser) => {
        if (!sessionUser) {
            setUser(null)
            setIsAdmin(false)
            return
        }

        const storedAvatar = localStorage.getItem('user_avatar_custom')
        const avatar = storedAvatar || sessionUser.user_metadata?.avatar_url || DEFAULT_INDIAN_MALE_AVATAR
        const userWithAvatar = {
            ...sessionUser,
            user_metadata: {
                ...(sessionUser.user_metadata || {}),
                avatar_url: avatar
            }
        }
        const adminStatus = await checkAdminRole(userWithAvatar)
        setIsAdmin(adminStatus)
        setUser(userWithAvatar)
    }

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                setLoading(true)
                const { data } = await supabase.auth.getUser()
                if (data?.user) {
                    await setSessionUser(data.user)
                } else {
                    setUser(null)
                    setIsAdmin(false)
                }
            } catch (err) {
                console.error("Auth init error:", err)
            } finally {
                setLoading(false)
            }
        }

        initializeAuth()

        const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                await setSessionUser(session.user)
            } else {
                setUser(null)
                setIsAdmin(false)
            }
            setLoading(false)
        })

        return () => listener.subscription.unsubscribe()
    }, [])

    const updateUserAvatar = async (newAvatarUrl) => {
        try {
            localStorage.setItem('user_avatar_custom', newAvatarUrl)
            if (user) {
                const updatedUser = {
                    ...user,
                    user_metadata: {
                        ...(user.user_metadata || {}),
                        avatar_url: newAvatarUrl
                    }
                }
                setUser(updatedUser)
                await supabase.auth.updateUser({
                    data: { avatar_url: newAvatarUrl }
                })
            }
        } catch (e) {
            console.error("Failed to update avatar:", e)
        }
    }

    const signOut = async () => {
        try {
            await supabase.auth.signOut()
            localStorage.removeItem('user_avatar_custom')
            setUser(null)
            setIsAdmin(false)
        } catch (err) {
            console.error("SignOut error:", err)
            setUser(null)
            setIsAdmin(false)
        }
    }

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signUp, signIn, signOut, updateUserAvatar, checkAdminRole, setSessionUser }}>
        {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)