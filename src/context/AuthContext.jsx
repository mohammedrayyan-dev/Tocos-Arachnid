import { createContext, useContext, useEffect, useState, useRef } from "react"
import { supabase } from "../lib/supabase"
import { signUp, signIn } from "../lib/auth"

const DEFAULT_INDIAN_MALE_AVATAR = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)

    // In-memory cache and in-flight request deduplication to prevent redundant DB calls
    const roleCache = useRef(new Map())
    const pendingRoleChecks = useRef(new Map())

    const checkAdminRole = async (currentUser) => {
        if (!currentUser?.id) {
            setIsAdmin(false)
            return false
        }

        const metaRole = currentUser.user_metadata?.role || currentUser.app_metadata?.role

        // 1. Fast-path check: metadata explicitly says admin or hardcoded admin email
        if (metaRole === 'admin' || currentUser.email === 'admin@tocos.com' || currentUser.email === 'mohammed@example.com') {
            roleCache.current.set(currentUser.id, true)
            setIsAdmin(true)
            return true
        }

        // 2. Return cached role if available
        if (roleCache.current.has(currentUser.id)) {
            const cachedRole = roleCache.current.get(currentUser.id)
            setIsAdmin(cachedRole)
            return cachedRole
        }

        // 3. Deduplicate in-flight requests for the same user ID
        if (pendingRoleChecks.current.has(currentUser.id)) {
            const adminFlag = await pendingRoleChecks.current.get(currentUser.id)
            setIsAdmin(adminFlag)
            return adminFlag
        }

        // 4. Primary Source of Truth: Query Supabase public.profiles table
        const checkPromise = (async () => {
            try {
                const queryPromise = supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", currentUser.id)
                    .maybeSingle()

                const timeoutPromise = new Promise((resolve) =>
                    setTimeout(() => resolve({ data: null, timedOut: true }), 2500)
                )
                const res = await Promise.race([queryPromise, timeoutPromise])

                const dbRole = res?.data?.role
                const adminFlag = dbRole === "admin" || (res?.timedOut && metaRole === "admin")
                
                if (!res?.timedOut) {
                    roleCache.current.set(currentUser.id, adminFlag)
                }
                return adminFlag
            } catch (err) {
                console.error("Profile check notice:", err)
                return metaRole === 'admin'
            } finally {
                pendingRoleChecks.current.delete(currentUser.id)
            }
        })()

        pendingRoleChecks.current.set(currentUser.id, checkPromise)
        const adminFlag = await checkPromise
        setIsAdmin(adminFlag)
        return adminFlag
    }

    const syncedUserIds = useRef(new Set())
    const activeUserIdRef = useRef(null)

    const setSessionUser = async (sessionUser) => {
        if (!sessionUser) {
            activeUserIdRef.current = null
            setUser(null)
            setIsAdmin(false)
            return { user: null, isAdmin: false }
        }

        // Clear roleCache for user switch or fresh login
        if (activeUserIdRef.current !== sessionUser.id) {
            roleCache.current.delete(sessionUser.id)
        }

        // 1. Immediately set user state synchronously so avatar renders instantly (0ms delay)
        const storedAvatar = localStorage.getItem('user_avatar_custom')
        const initialAvatar = storedAvatar || sessionUser.user_metadata?.avatar_url || DEFAULT_INDIAN_MALE_AVATAR
        const initialName = sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name || (sessionUser.email ? sessionUser.email.split('@')[0] : '')
        const initialRole = sessionUser.user_metadata?.role || sessionUser.app_metadata?.role || (sessionUser.email === 'admin@tocos.com' ? 'admin' : 'customer')

        const immediateUser = {
            ...sessionUser,
            role: initialRole,
            user_metadata: {
                ...(sessionUser.user_metadata || {}),
                full_name: initialName,
                name: initialName,
                avatar_url: initialAvatar,
                role: initialRole
            }
        }

        activeUserIdRef.current = sessionUser.id
        setUser(immediateUser)
        setIsAdmin(initialRole === 'admin')

        // 2. Hydrate authoritative full_name, phone, avatar_url, role from public.profiles DB table asynchronously in background
        (async () => {
            try {
                if (sessionUser?.id || sessionUser?.email) {
                    let query = supabase.from('profiles').select('*')
                    if (sessionUser.id && sessionUser.email) {
                        query = query.or(`id.eq.${sessionUser.id},email.ilike.${sessionUser.email}`)
                    } else if (sessionUser.id) {
                        query = query.eq('id', sessionUser.id)
                    } else if (sessionUser.email) {
                        query = query.ilike('email', sessionUser.email)
                    }
                    const { data: dbProfile } = await query.maybeSingle()
                    
                    if (dbProfile) {
                        const avatar = storedAvatar || dbProfile.avatar_url || sessionUser.user_metadata?.avatar_url || DEFAULT_INDIAN_MALE_AVATAR
                        const fullName = dbProfile.full_name || sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name || initialName
                        const phone = dbProfile.phone || sessionUser.user_metadata?.phone || ''
                        const userRole = dbProfile.role || initialRole

                        const updatedUser = {
                            ...sessionUser,
                            phone: phone,
                            role: userRole,
                            user_metadata: {
                                ...(sessionUser.user_metadata || {}),
                                full_name: fullName,
                                name: fullName,
                                phone: phone,
                                avatar_url: avatar,
                                role: userRole
                            }
                        }
                        setUser(updatedUser)
                        checkAdminRole(updatedUser)
                    }
                }
            } catch (e) {}
        })()
        return { user: immediateUser, isAdmin: initialRole === 'admin' }
    }

    const clearSupabaseAuthStorage = () => {
        try {
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i)
                if (key && (key.startsWith('sb-') || key.includes('supabase') || key.includes('auth-token'))) {
                    localStorage.removeItem(key)
                }
            }
            for (let i = sessionStorage.length - 1; i >= 0; i--) {
                const key = sessionStorage.key(i)
                if (key && (key.startsWith('sb-') || key.includes('supabase') || key.includes('auth-token'))) {
                    sessionStorage.removeItem(key)
                }
            }
            localStorage.removeItem('user_avatar_custom')
            localStorage.removeItem('tocos_local_cart')
        } catch (e) {
            console.error("Storage clear error:", e)
        }
    }

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                setLoading(true)
                const { data: sessionData } = await supabase.auth.getSession()
                
                // Self-healing: if auth session user_metadata contains base64 image, clean it to prevent HTTP 431
                if (sessionData?.session?.user?.user_metadata?.avatar_url?.startsWith('data:image/')) {
                    try {
                        await supabase.auth.updateUser({
                            data: { avatar_url: null }
                        })
                    } catch (e) {}
                }

                if (sessionData?.session?.user) {
                    await setSessionUser(sessionData.session.user)
                } else {
                    const { data: userData } = await supabase.auth.getUser()
                    if (userData?.user) {
                        await setSessionUser(userData.user)
                    } else {
                        setUser(null)
                        setIsAdmin(false)
                    }
                }
            } catch (err) {
                console.error("Auth init error:", err)
            } finally {
                setLoading(false)
            }
        }

        initializeAuth()

        const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') {
                setUser(null)
                setIsAdmin(false)
                roleCache.current.clear()
                pendingRoleChecks.current.clear()
                setLoading(false)
                return
            }

            if (session?.user) {
                await setSessionUser(session.user)
            } else if (event !== 'INITIAL_SESSION') {
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
                
                // Never push massive base64 image strings into Supabase Auth JWT token (causes HTTP 431)
                try {
                    const isBase64 = typeof newAvatarUrl === 'string' && newAvatarUrl.startsWith('data:image/')
                    if (!isBase64) {
                        await supabase.auth.updateUser({
                            data: { avatar_url: newAvatarUrl }
                        })
                    } else {
                        await supabase.auth.updateUser({
                            data: { avatar_url: null }
                        })
                    }
                } catch (e) {}
            }
        } catch (e) {
            console.error("Failed to update avatar:", e)
        }
    }

    const signOut = async () => {
        try {
            await supabase.auth.signOut({ scope: 'global' }).catch(async () => {
                await supabase.auth.signOut({ scope: 'local' }).catch(() => {})
            })
        } catch (err) {
            console.error("SignOut error:", err)
        } finally {
            clearSupabaseAuthStorage()
            roleCache.current.clear()
            pendingRoleChecks.current.clear()
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