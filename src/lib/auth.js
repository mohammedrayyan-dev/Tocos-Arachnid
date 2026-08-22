import { supabase } from "./supabase";

export const signUp = async (email, password, fullName = '') => {
    const cleanEmail = (email || '').trim().toLowerCase()
    const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
            data: {
                full_name: fullName,
                name: fullName
            }
        }
    })
    if (error) throw error
    return data
}

export const signup = signUp

export const signIn = async (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase()
    const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password })
    if (error) throw error
    return data
}

export const signOut = async () => {
    try {
        await supabase.auth.signOut({ scope: 'global' }).catch(async () => {
            await supabase.auth.signOut({ scope: 'local' }).catch(() => {})
        })
    } catch (e) {
        console.error("SignOut error:", e)
    } finally {
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
        } catch (e) {}
    }
}

export const getCurrentUser = async () => {
    const { data } = await supabase.auth.getUser()
    return data.user
}

export const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail( email, {
        redirectTo: `${window.location.origin}/reset-password`
     })
    if (error) throw error
    return data
}