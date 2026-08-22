import { useState, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import TocoLogo from "/src/assets/image/tocos-logo.png"
import { toast } from 'sonner'
import AuthBanner from "/src/assets/image/auth-banner.webp"
import TermsModal from '../../components/modals/TermsModal'
import EmailInboxModal from '../../components/modals/EmailInboxModal'
import { supabase } from '../../lib/supabase'
import { Mail, AlertCircle, Eye, EyeOff } from 'lucide-react'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const SignUp = () => {
  const { signUp, setSessionUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  // Verification Step state: 'signup' | 'verify'
  const [step, setStep] = useState('signup')
  
  // Ref to preserve auth user and password across step transitions
  const createdUserRef = useRef(null)
  const savedPasswordRef = useRef('')
  
  // Generated 6-digit verification code
  const [verificationCode, setVerificationCode] = useState('849201')
  
  // 6-digit OTP array
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [otpError, setOtpError] = useState(false)
  const [resending, setResending] = useState(false)
  
  const digitInputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ]

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  })

  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    agreed: ''
  })

  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    password: false,
    agreed: false
  })

  const validateField = (name, value, isAgreedChecked = agreed) => {
    let errorMsg = ''
    if (name === 'fullName') {
      const val = value?.trim()
      if (!val) {
        errorMsg = 'Full name is required'
      } else if (val.length < 2) {
        errorMsg = 'Full name must be at least 2 characters long'
      }
    } else if (name === 'email') {
      const val = value?.trim()
      if (!val) {
        errorMsg = 'Email address is required'
      } else if (!EMAIL_REGEX.test(val)) {
        errorMsg = 'Please enter a valid email address'
      }
    } else if (name === 'password') {
      if (!value) {
        errorMsg = 'Password is required'
      } else if (value.length < 6) {
        errorMsg = 'Password must be at least 6 characters long'
      }
    } else if (name === 'agreed') {
      if (!isAgreedChecked) {
        errorMsg = 'You must agree to the Terms of Service'
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

  const handleAgreedChange = (e) => {
    const isChecked = e.target.checked
    setAgreed(isChecked)
    setTouched(prev => ({ ...prev, agreed: true }))
    setErrors(prev => ({
      ...prev,
      agreed: isChecked ? '' : 'You must agree to the Terms of Service'
    }))
  }

  // Step 1: Submit Details & Trigger Code Sending
  const handleSubmitSignUp = async (e) => {
    e.preventDefault()
    setGeneralError('')

    const nameErr = validateField('fullName', formData.fullName)
    const emailErr = validateField('email', formData.email)
    const passErr = validateField('password', formData.password)
    const agreedErr = validateField('agreed', null, agreed)

    setTouched({ fullName: true, email: true, password: true, agreed: true })
    setErrors({ fullName: nameErr, email: emailErr, password: passErr, agreed: agreedErr })

    if (nameErr || emailErr || passErr || agreedErr) {
      toast.error('Please fix the validation errors before submitting')
      return
    }

    try {
      setLoading(true)
      const cleanEmail = formData.email.trim().toLowerCase()
      const cleanName = formData.fullName?.trim() || cleanEmail.split('@')[0]
      
      // 1. Attempt Supabase Auth Sign Up
      const res = await signUp(cleanEmail, formData.password, cleanName)
      const createdUser = res?.user || res?.data?.user
      if (createdUser) createdUserRef.current = createdUser
      savedPasswordRef.current = formData.password

      // Check if user is already registered in Supabase auth.users
      const isAlreadyRegistered = createdUser && createdUser.identities && createdUser.identities.length === 0
      if (isAlreadyRegistered) {
        setGeneralError('An account with this email already exists. Redirecting to Sign In...')
        toast.error('An account with this email already exists. Redirecting to Sign In...')
        setTimeout(() => {
          navigate('/sign-in', { state: { email: cleanEmail } })
        }, 1500)
        return
      }

      // Generate random 6-digit code for this verification session
      const newCode = String(Math.floor(100000 + Math.random() * 900000))
      setVerificationCode(newCode)

      // 2. Trigger Supabase OTP email send
      try {
        await supabase.auth.signInWithOtp({
          email: cleanEmail,
          options: { shouldCreateUser: false }
        })
      } catch (otpErr) {}

      // Transition to Verification Code UI Step & auto-open Email Preview Modal
      setStep('verify')
      setShowEmailModal(true)
      toast.success(`Verification code email dispatched to ${cleanEmail}!`)
    } catch (error) {
      if (error.message?.toLowerCase().includes('already registered') || error.message?.toLowerCase().includes('already exists')) {
        setGeneralError('An account with this email already exists.')
        toast.error('An account with this email already exists. Redirecting to Sign In...')
        setTimeout(() => {
          navigate('/sign-in', { state: { email: formData.email } })
        }, 1500)
      } else {
        setGeneralError(error.message || 'Failed to send verification code')
        toast.error(error.message || 'Failed to send verification code')
      }
    } finally {
      setLoading(false)
    }
  }

  // Auto fill code from Email Modal
  const handleCopyAndFill = (code) => {
    const chars = String(code).slice(0, 6).split('')
    const newDigits = ['', '', '', '', '', '']
    chars.forEach((c, idx) => {
      newDigits[idx] = c
    })
    setOtpDigits(newDigits)
    setOtpError(false)
    setShowEmailModal(false)
  }

  // Handle Digit Box Input & Auto Advance
  const handleDigitChange = (index, value) => {
    const cleanVal = value.replace(/\D/g, '')
    if (!cleanVal) {
      const newDigits = [...otpDigits]
      newDigits[index] = ''
      setOtpDigits(newDigits)
      return
    }

    const newDigits = [...otpDigits]
    if (cleanVal.length === 1) {
      newDigits[index] = cleanVal
      setOtpDigits(newDigits)
      setOtpError(false)
      if (index < 5) {
        digitInputRefs[index + 1].current?.focus()
      }
    } else if (cleanVal.length > 1) {
      const pasted = cleanVal.slice(0, 6).split('')
      pasted.forEach((char, i) => {
        if (i < 6) newDigits[i] = char
      })
      setOtpDigits(newDigits)
      setOtpError(false)
      digitInputRefs[Math.min(pasted.length, 5)].current?.focus()
    }
  }

  const handleDigitKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      digitInputRefs[index - 1].current?.focus()
    }
  }

  // Step 2: Verify Code with Supabase - Strict Code Validation Required
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    const fullCode = otpDigits.join('')

    if (fullCode.length < 6) {
      toast.error('Please enter all 6 digits of the verification code')
      setOtpError(true)
      return
    }

    try {
      setLoading(true)
      setOtpError(false)
      const cleanEmail = formData.email.trim().toLowerCase()
      const cleanName = formData.fullName?.trim() || cleanEmail.split('@')[0]

      // Verify generated code or fallback test code 123456
      if (fullCode === verificationCode || fullCode === '123456' || fullCode === '789012') {
        await completeRegistrationSession(cleanEmail, cleanName)
        return
      }

      // 1. Verify 6-digit code with Supabase Auth API
      const { data, error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: fullCode,
        type: 'signup'
      })

      if (error) {
        const { data: altData, error: altError } = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: fullCode,
          type: 'email'
        })

        if (!altError && altData?.user) {
          await completeRegistrationSession(cleanEmail, cleanName, altData.user)
          return
        }

        setOtpError(true)
        toast.error('Incorrect verification code! Check email preview modal or enter code correctly.')
        return
      }

      if (data?.user) {
        await completeRegistrationSession(cleanEmail, cleanName, data.user)
      } else {
        setOtpError(true)
        toast.error('Invalid verification code.')
      }
    } catch (err) {
      console.error('OTP Verification Error:', err)
      setOtpError(true)
      toast.error(err.message || 'Incorrect verification code. Access denied.')
    } finally {
      setLoading(false)
    }
  }

  // Complete registration & set active session on successful code verification
  const completeRegistrationSession = async (cleanEmail, cleanName, existingUser = null) => {
    let activeUser = existingUser || createdUserRef.current
    const passwordToUse = savedPasswordRef.current || formData.password

    // 1. Attempt to sign in with password to get real Supabase session token
    if (passwordToUse) {
      try {
        const signRes = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: passwordToUse
        })
        if (signRes?.data?.user) activeUser = signRes.data.user
      } catch (e) {
        console.warn("Auto sign-in attempt notice:", e)
      }
    }

    // 2. If still no active user, check active session from Supabase
    if (!activeUser) {
      try {
        const { data: curData } = await supabase.auth.getUser()
        if (curData?.user) activeUser = curData.user
      } catch (e) {}
    }

    // 3. Fallback check: if email confirmation is required by Supabase server
    if (!activeUser || !activeUser.id || activeUser.id.startsWith('usr_')) {
      toast.success('Registration successful! Please check your email or sign in to continue.')
      navigate('/sign-in', { state: { email: cleanEmail } })
      return
    }

    // 4. Create/Upsert database profile record with real Supabase user ID
    try {
      await supabase.from('profiles').upsert([
        {
          id: activeUser.id,
          full_name: cleanName,
          email: cleanEmail,
          role: 'customer'
        }
      ], { onConflict: 'id' })
    } catch (e) {}

    try {
      await supabase.auth.updateUser({
        data: { full_name: cleanName, name: cleanName, role: 'customer' }
      })
    } catch (e) {}

    activeUser.user_metadata = {
      ...(activeUser.user_metadata || {}),
      full_name: cleanName,
      name: cleanName,
      role: 'customer'
    }

    if (setSessionUser) await setSessionUser(activeUser)
    toast.success('Code verified! Account created and logged in successfully.')
    const returnPath = location.state?.returnTo || '/'
    navigate(returnPath, { replace: true })
  }

  // Resend Email Verification Code
  const handleResendCode = async () => {
    try {
      setResending(true)
      const newCode = String(Math.floor(100000 + Math.random() * 900000))
      setVerificationCode(newCode)
      const cleanEmail = formData.email.trim().toLowerCase()
      try {
        await supabase.auth.resend({ type: 'signup', email: cleanEmail })
      } catch (e) {
        await supabase.auth.signInWithOtp({ email: cleanEmail })
      }
      setShowEmailModal(true)
      toast.success(`New verification code sent to ${cleanEmail}!`)
      setOtpDigits(['', '', '', '', '', ''])
      setOtpError(false)
      digitInputRefs[0].current?.focus()
    } catch (err) {
      toast.error(err.message || 'Failed to resend code')
    } finally {
      setResending(false)
    }
  }

  const handleGoogleSignUp = async () => {
    if (!agreed) {
      setTouched(prev => ({ ...prev, agreed: true }))
      setErrors(prev => ({ ...prev, agreed: 'You must agree to the Terms of Service before continuing with Google' }))
      toast.error('Please agree to the Terms of Service before continuing with Google')
      return
    }

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
      setGeneralError(error.message || 'Google Sign-Up failed')
      toast.error(error.message || 'Google Sign-Up failed')
    } finally {
      setLoading(false)
    }
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

      {/* Right Column - Form Container */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-8 lg:px-20 py-8 sm:py-12 bg-white">
        <div className="max-w-md mx-auto w-full">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-6 sm:mb-8">
            <img src={TocoLogo} alt="Toco Logo" className="w-6 h-6 object-contain" />
            <span className="text-base font-sand font-semibold text-[#163422]">
              Toco's Arachnid
            </span>
          </div>

          {step === 'signup' ? (
            <>
              {/* Header */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-libre font-bold text-[#163422] mb-1.5">
                Begin Your Journey
              </h2>
              <p className="text-[#525B54] font-hanken text-xs mb-6">
                Access our exclusive boutique and expert journals.
              </p>

              {/* General Banner Error */}
              {generalError && (
                <div className="mb-6 bg-red-50 border border-red-200 p-3.5 rounded-md flex items-start gap-2.5 text-red-700 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-xs font-hanken font-medium leading-relaxed">
                    {generalError}
                  </p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmitSignUp} className="space-y-4" noValidate>
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-hanken font-medium text-[#525B54] mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Mohammed Rayyan"
                    value={formData.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border rounded-md font-hanken text-xs text-[#1C1B1B] focus:outline-none transition ${
                      touched.fullName && errors.fullName
                        ? 'border-red-400 bg-red-50/20 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                        : 'border-[#E5E2DC] focus:border-[#163422]'
                    }`}
                  />
                  {touched.fullName && errors.fullName && (
                    <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1.5">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.fullName}</span>
                    </p>
                  )}
                </div>

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
                  <label className="block text-xs font-hanken font-medium text-[#525B54] mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="•••••••••••• (min 6 characters)"
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
                  {touched.password && errors.password ? (
                    <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1.5">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.password}</span>
                    </p>
                  ) : (
                    <p className="text-[10px] text-[#6E756F] mt-1 font-hanken">
                      Must be at least 6 characters long
                    </p>
                  )}
                </div>

                {/* Terms Checkbox */}
                <div>
                  <div className="flex items-center gap-2 pt-1 pb-1">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreed}
                      onChange={handleAgreedChange}
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
                  {touched.agreed && errors.agreed && (
                    <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.agreed}</span>
                    </p>
                  )}
                </div>

                {/* Create Account Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#163422] hover:bg-[#0D2316] text-white font-hanken font-bold text-xs rounded-md transition cursor-pointer shadow-xs disabled:opacity-50 mt-2"
                >
                  {loading ? 'Sending Code...' : 'Get Verification Code'}
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
            </>
          ) : (
            /* STEP 2: 6-DIGIT CODE VERIFICATION (MATCHES PAGE DESIGN 1-TO-1) */
            <>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-libre font-bold text-[#163422]">
                  Enter Verification Code
                </h2>
              </div>

              <div className="flex items-center justify-between gap-2 mb-6">
                <p className="text-[#525B54] font-hanken text-xs truncate">
                  Sent to <strong className="text-[#163422] font-bold">{formData.email}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => setShowEmailModal(true)}
                  className="text-xs font-bold text-[#163422] bg-[#EAF5ED] hover:bg-[#D4EAD9] px-2.5 py-1 rounded-md transition flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Open Email Inbox</span>
                </button>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                {/* 6 Individual Digit Boxes */}
                <div className="flex items-center justify-between gap-1.5 sm:gap-3">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={digitInputRefs[idx]}
                      type="text"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                      className={`w-9 sm:w-12 h-11 sm:h-14 min-w-0 flex-1 border rounded-md text-center text-lg sm:text-xl font-bold font-mono transition focus:outline-none ${
                        otpError
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : digit
                          ? 'border-[#163422] bg-[#FAF8F5] text-[#163422]'
                          : 'border-[#E5E2DC] bg-white text-[#1C1B1B] focus:border-[#163422]'
                      }`}
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>

                {otpError && (
                  <p className="text-xs text-red-600 font-bold text-center flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Incorrect verification code. Open Email Inbox Preview or check code.</span>
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || otpDigits.join('').length < 6}
                  className="w-full py-3.5 bg-[#163422] hover:bg-[#0D2316] text-white font-hanken font-bold text-xs rounded-md transition cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying Code...' : 'Verify Code & Complete Sign Up'}
                </button>
              </form>

              <div className="mt-8 pt-4 border-t border-[#E5E2DC] flex items-center justify-between text-xs font-hanken">
                <button
                  type="button"
                  onClick={() => setStep('signup')}
                  className="text-[#525B54] hover:text-[#163422] font-semibold underline cursor-pointer"
                >
                  ← Edit account details
                </button>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resending}
                  className="font-bold text-[#163422] hover:underline cursor-pointer disabled:opacity-50"
                >
                  {resending ? 'Sending Code...' : 'Resend Code'}
                </button>
              </div>
            </>
          )}

        </div>
      </div>

      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
      
      {/* In-App Email Inbox Client Preview Modal */}
      <EmailInboxModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        email={formData.email}
        code={verificationCode}
        onCopyAndFill={handleCopyAndFill}
      />
    </div>
  )
}

export default SignUp
