import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import TocoLogo from "/src/assets/image/tocos-logo.png"
import { signIn } from '../../lib/auth'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'sonner'
import AuthBanner from "/src/assets/image/auth-banner.webp"
import { AlertCircle, Eye, EyeOff } from 'lucide-react'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const SignIn = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAdmin, setSessionUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    password: ''
  })
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  })
  const [touched, setTouched] = useState({
    email: false,
    password: false
  })

  // If already logged in or when auth state updates, redirect immediately
  useEffect(() => {
    if (user) {
      if (isAdmin) {
        navigate('/admin', { replace: true })
      } else {
        const returnPath = location.state?.returnTo || '/'
        navigate(returnPath, { replace: true })
      }
    }
  }, [user, isAdmin, navigate, location.state])

  const validateField = (name, value) => {
    let errorMsg = ''
    if (name === 'email') {
      const cleanEmail = value?.trim()
      if (!cleanEmail) {
        errorMsg = 'Email address is required'
      } else if (!EMAIL_REGEX.test(cleanEmail)) {
        errorMsg = 'Please enter a valid email address'
      }
    } else if (name === 'password') {
      if (!value) {
        errorMsg = 'Password is required'
      }
    }
    return errorMsg
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setGeneralError('')

    if (touched[name]) {
      const errorMsg = validateField(name, value)
      setErrors(prev => ({
        ...prev,
        [name]: errorMsg
      }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched(prev => ({
      ...prev,
      [name]: true
    }))
    const errorMsg = validateField(name, value)
    setErrors(prev => ({
      ...prev,
      [name]: errorMsg
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGeneralError('')

    const emailErr = validateField('email', formData.email)
    const passwordErr = validateField('password', formData.password)

    setTouched({ email: true, password: true })
    setErrors({ email: emailErr, password: passwordErr })

    if (emailErr || passwordErr) {
      toast.error('Please fix the validation errors before submitting')
      return
    }

    const cleanEmail = formData.email.trim().toLowerCase()
    const password = formData.password

    try {
      setLoading(true)
      const res = await signIn(cleanEmail, password)
      const loggedUser = res?.user || res?.data?.user

      if (loggedUser) {
        toast.success('Signed in successfully!')
        const { isAdmin: isRoleAdmin } = setSessionUser ? await setSessionUser(loggedUser) : { isAdmin: false }
        if (isRoleAdmin) {
          navigate('/admin', { replace: true })
        } else {
          const returnPath = location.state?.returnTo || '/'
          navigate(returnPath, { replace: true })
        }
      } else {
        toast.success('Signed in successfully!')
        navigate('/', { replace: true })
      }
    } catch (error) {
      console.error('Sign-in error:', error)
      let errMsg = error.message || 'Failed to sign in'
      const lowerErr = (error.message || '').toLowerCase()
      if (lowerErr.includes('invalid login credentials')) {
        errMsg = 'Invalid email or password. If you registered via Google ("Continue with Google"), please sign in using Google.'
      } else if (lowerErr.includes('email not confirmed')) {
        errMsg = 'Your email address is not confirmed yet. Please check your inbox for the confirmation email.'
      }
      setGeneralError(errMsg)
      toast.error(errMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      setGeneralError('')
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      })
      if (error) throw error
    } catch (error) {
      setGeneralError(error.message || 'Google Sign-In failed')
      toast.error(error.message || 'Google Sign-In failed. Ensure Google Provider is enabled in Supabase.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = () => {
    navigate('/forgot-password')
  }

  return (
    <div className="min-h-screen flex bg-white font-hanken">
      {/* Left Column - Image & Overlay */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#163422] flex-col justify-end p-12 overflow-hidden">
        <img
          src={AuthBanner}
          alt="Spider"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
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
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-8 lg:px-20 py-8 sm:py-12 bg-white">
        <div className="max-w-md mx-auto w-full">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-6 sm:mb-8">
            <img src={TocoLogo} alt="Toco Logo" className="w-6 h-6 object-contain" />
            <span className="text-base font-sand font-semibold text-[#163422]">
              Toco's Arachnid
            </span>
          </div>

          {/* Header */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-libre font-bold text-[#163422] mb-1.5">
            Welcome Back
          </h2>
          <p className="text-[#525B54] font-hanken text-xs mb-6">
            Sign in to access your account and continue your journey.
          </p>

          {/* General Banner Error */}
          {generalError && (
            <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-md flex flex-col gap-2 text-red-700 animate-in fade-in duration-200">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p className="text-xs font-hanken font-medium leading-relaxed">
                  {generalError}
                </p>
              </div>
              {generalError.includes('Google') && (
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-red-200/80 mt-1">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="text-xs font-bold text-[#163422] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>👉 Sign in with Google now</span>
                  </button>
                  <span className="text-xs text-red-300">•</span>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs font-semibold text-red-700 hover:underline cursor-pointer"
                  >
                    Set a password for email login
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div>
              <label className="block text-xs font-hanken font-medium text-[#525B54] mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="rayyan@example.com"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 border rounded-md font-hanken text-xs text-[#1C1B1B] focus:outline-none transition ${
                  touched.email && errors.email
                    ? 'border-red-400 bg-red-50/20 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                    : 'border-[#E5E2DC] focus:border-[#163422]'
                }`}
              />
              {touched.email && errors.email && (
                <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1.5">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-hanken font-medium text-[#525B54]">
                  Password <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-hanken text-[#163422] font-semibold hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-4 pr-10 py-3 border rounded-md font-hanken text-xs text-[#1C1B1B] focus:outline-none transition ${
                    touched.password && errors.password
                      ? 'border-red-400 bg-red-50/20 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                      : 'border-[#E5E2DC] focus:border-[#163422]'
                  }`}
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
              {touched.password && errors.password && (
                <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1.5">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#163422] hover:bg-[#0D2316] text-white font-hanken font-bold text-xs rounded-md transition cursor-pointer shadow-xs disabled:opacity-50 mt-2"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-5 items-center">
            <div className="grow border-t border-[#E5E2DC]"></div>
            <span className="shrink mx-4 text-xs font-hanken text-[#6E756F]">Or continue with</span>
            <div className="grow border-t border-[#E5E2DC]"></div>
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
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

          {/* Sign Up Link */}
          <p className="text-center font-hanken text-xs text-[#6E756F] mt-8">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/sign-up')}
              className="text-[#163422] font-semibold hover:underline cursor-pointer"
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignIn
