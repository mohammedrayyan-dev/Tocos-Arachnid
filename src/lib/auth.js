import { supabase } from "./supabase";

export const signUp = async (email, password, fullName = '') => {
    const { data, error } = await supabase.auth.signUp({
        email,
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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
}

export const signOut = async () => {
    await supabase.auth.signOut()
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