import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { signUp } from '../../lib/auth'
import { useNavigate, useLocation } from 'react-router-dom'
import TocoLogo from "/src/assets/image/tocos-logo.png"
import { toast } from 'sonner'
import AuthBanner from "/src/assets/image/auth-banner.webp"
import TermsModal from '../../components/modals/TermsModal'

import { supabase } from '../../lib/supabase'

const SignUp = () => {
  const { signUp, setSessionUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const isFormValid = formData.fullName?.trim() && formData.email?.trim() && formData.password?.length >= 6 && agreed

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.fullName?.trim()) {
      toast.error('Please enter your full name')
      return
    }

    if (!formData.email?.trim()) {
      toast.error('Please enter your email address')
      return
    }

    if (!formData.password || formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    if (!agreed) {
      toast.error('You must check and agree to the Terms of Service to create an account')
      return
    }

    try {
      setLoading(true)
      const cleanEmail = formData.email.trim().toLowerCase()
      const cleanName = formData.fullName?.trim() || cleanEmail.split('@')[0]
      
      // Check if user account already exists by attempting sign up or sign in
      const res = await signUp(cleanEmail, formData.password, cleanName)
      const createdUser = res?.user || res?.data?.user

      // Supabase returns identities: [] if user already exists
      const isAlreadyRegistered = createdUser && createdUser.identities && createdUser.identities.length === 0

      if (isAlreadyRegistered) {
        // Attempt to log into existing account with the provided password
        const { data: signData, error: signError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: formData.password
        })

        if (signError) {
          toast.error('An account with this email already exists. Please sign in with your password.')
          navigate('/sign-in', { state: { email: cleanEmail } })
          return
        }

        if (signData?.user) {
          if (setSessionUser) await setSessionUser(signData.user)
          toast.success('Welcome back! Signed into your existing account.')
          const returnPath = location.state?.returnTo || '/'
          navigate(returnPath, { replace: true })
          return
        }
      }

      // Guarantee immediate login session for newly created user
      let activeUser = createdUser
      try {
        const signRes = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: formData.password
        })
        if (signRes?.data?.user) {
          activeUser = signRes.data.user
        }
      } catch (signInErr) {
        console.warn('Auto sign-in notice (email confirm setting):', signInErr?.message)
      }
      
      if (activeUser) {
        // Upsert into public.profiles table
        await supabase
          .from('profiles')
          .upsert([
            {
              id: activeUser.id,
              full_name: cleanName,
              email: cleanEmail,
              role: 'customer'
            }
          ], { onConflict: 'id' })

        // Also update auth user metadata
        try {
          await supabase.auth.updateUser({
            data: { full_name: cleanName, name: cleanName }
          })
          activeUser.user_metadata = {
            ...(activeUser.user_metadata || {}),
            full_name: cleanName,
            name: cleanName
          }
        } catch (e) {}

        if (setSessionUser) await setSessionUser(activeUser)
      }
      
      toast.success('Account created and logged in successfully!')
      const returnPath = location.state?.returnTo || '/'
      navigate(returnPath, { replace: true })
    } catch (error) {
      if (error.message?.toLowerCase().includes('already registered') || error.message?.toLowerCase().includes('already exists')) {
        try {
          const { data: signData, error: signError } = await supabase.auth.signInWithPassword({
            email: formData.email.trim(),
            password: formData.password
          })
          if (!signError && signData?.user) {
            if (setSessionUser) await setSessionUser(signData.user)
            toast.success('Welcome back! Signed into your existing account.')
            navigate(location.state?.returnTo || '/', { replace: true })
            return
          }
        } catch (e) {}
        toast.error('An account with this email already exists. Please sign in.')
        navigate('/sign-in', { state: { email: formData.email } })
      } else if (error.message?.toLowerCase().includes('email not confirmed')) {
        toast.error('Supabase Email Confirmation active. Run the auto-confirm SQL snippet in Supabase SQL Editor!')
      } else {
        toast.error(error.message || 'Failed to create account')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    if (!agreed) {
      toast.error('Please agree to the Terms of Service before continuing with Google')
      return
    }

    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      })
      if (error) throw error
    } catch (error) {
      toast.error(error.message || 'Google Sign-Up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Column - Image & Overlay */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#163422] flex-col justify-end p-12 overflow-hidden">
        <img
          src={AuthBanner}
          alt="Spider"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="relative z-10 text-white max-w-lg mb-4">
          <h1 className="text-3xl lg:text-4xl font-libre font-bold mb-2 leading-tight">
            Curating Excellence
          </h1>
          <p className="text-sm font-hanken text-gray-200 leading-relaxed opacity-90">
            Curating nature's rarest masterpieces for your home.
          </p>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-20 py-12 bg-white">
        <div className="max-w-md mx-auto w-full">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <img src={TocoLogo} alt="Toco Logo" className="w-6 h-6 object-contain" />
            <span className="text-base font-sand font-semibold text-[#163422]">
              Toco's Arachnid
            </span>
          </div>

          {/* Header */}
          <h2 className="text-3xl lg:text-4xl font-libre font-bold text-[#163422] mb-1.5">
            Begin Your Journey
          </h2>
          <p className="text-[#525B54] font-hanken text-xs mb-8">
            Access our exclusive boutique and expert journals.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-hanken font-medium text-[#525B54] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                placeholder="Mohammed Rayyan"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#E5E2DC] rounded-md font-hanken text-xs text-[#1C1B1B] focus:outline-none focus:border-[#163422] transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-hanken font-medium text-[#525B54] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="rayyan@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#E5E2DC] rounded-md font-hanken text-xs text-[#1C1B1B] focus:outline-none focus:border-[#163422] transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-hanken font-medium text-[#525B54] mb-1.5">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#E5E2DC] rounded-md font-hanken text-xs text-[#1C1B1B] focus:outline-none focus:border-[#163422] transition"
              />
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-center gap-2 pt-1 pb-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="accent-[#163422] w-3.5 h-3.5 cursor-pointer rounded-xs"
              />
              <label htmlFor="terms" className="font-hanken text-xs text-[#525B54] cursor-pointer">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    setShowTermsModal(true)
                  }}
                  className="underline font-semibold text-[#163422] hover:text-black cursor-pointer"
                >
                  Terms of Service
                </button>
              </label>
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={!isFormValid || loading}
              title={!isFormValid ? "Please fill in all details and accept Terms of Service to enable Sign Up" : "Create Account"}
              className="w-full py-3.5 bg-[#163422] hover:bg-[#0D2316] text-white font-hanken font-bold text-xs rounded-md transition cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-[#E5E2DC]"></div>
            <span className="flex-shrink mx-4 text-xs font-hanken text-[#6E756F]">Or continue with</span>
            <div className="flex-grow border-t border-[#E5E2DC]"></div>
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            className="w-full py-3 bg-[#FAF8F5] border border-[#E5E2DC] rounded-md font-hanken text-xs font-bold text-[#1C1B1B] hover:bg-gray-50 transition flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Sign In Link */}
          <p className="text-center font-hanken text-xs text-[#6E756F] mt-8">
            Existing member?{' '}
            <button
              onClick={() => navigate('/sign-in')}
              className="text-[#163422] font-semibold hover:underline cursor-pointer"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>

      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
    </div>
  )
}

export default SignUp
