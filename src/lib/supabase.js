import { createClient } from '@supabase/supabase-js'

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabaseUrl = rawSupabaseUrl

// Self-healing: Immediately purge any bloated auth session tokens (>2KB or containing base64 images) from LocalStorage
if (typeof window !== 'undefined' && window.localStorage) {
    try {
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && (key.startsWith('sb-') || key.includes('auth-token') || key.includes('tocos_'))) {
                const val = localStorage.getItem(key)
                if (val && (val.includes('data:image/') || val.length > 2048)) {
                    keysToRemove.push(key)
                }
            }
        }
        keysToRemove.forEach(k => {
            console.warn("Purging bloated session token from localStorage to prevent ERR_HTTP2_PROTOCOL_ERROR:", k)
            try {
                const val = localStorage.getItem(k)
                const parsed = JSON.parse(val)
                if (parsed?.user?.user_metadata) parsed.user.user_metadata.avatar_url = null
                if (parsed?.currentSession?.user?.user_metadata) parsed.currentSession.user.user_metadata.avatar_url = null
                localStorage.setItem(k, JSON.stringify(parsed))
            } catch (e) {
                localStorage.removeItem(k)
            }
        })
    } catch (e) {}
}

const sanitizeHeaders = (headers = {}) => {
    const clean = { ...headers }
    clean.apikey = clean.apikey || supabaseAnonKey
    const authHeader = clean.Authorization || clean.authorization
    if (!authHeader) {
        clean.Authorization = `Bearer ${supabaseAnonKey}`
    } else if (typeof authHeader === 'string' && authHeader.length > 2048) {
        console.warn("Intercepted & sanitized bloated Authorization header (>2KB)")
        clean.Authorization = `Bearer ${supabaseAnonKey}`
        if (clean.authorization) clean.authorization = `Bearer ${supabaseAnonKey}`
    }
    return clean
}

const customFetch = async (input, init = {}) => {
    const sanitizedInit = {
        ...init,
        headers: sanitizeHeaders(init.headers),
        cache: 'no-store',
        keepalive: false
    }

    try {
        return await fetch(input, sanitizedInit)
    } catch (err) {
        try {
            await new Promise(r => setTimeout(r, 200))
            return await fetch(input, sanitizedInit)
        } catch (firstRetryErr) {
            const headers = sanitizeHeaders(init.headers)
            headers.apikey = supabaseAnonKey
            headers.Authorization = `Bearer ${supabaseAnonKey}`
            try {
                return await fetch(input, { ...sanitizedInit, headers })
            } catch (publicErr) {
                throw firstRetryErr
            }
        }
    }
}

if (!globalThis.__supabaseInstance) {
    globalThis.__supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        },
        global: {
            fetch: customFetch
        }
    })
}

export const supabase = globalThis.__supabaseInstance