import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  KeyRound,
  ArrowLeft,
  MailCheck,
  Check,
  Send,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { validatePassword } from '../../utils/validation';

type AuthMode = 'signin' | 'signup' | 'forgot' | 'verify-email';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    signInWithIdentifier,
    signUpWithEmail,
    sendPasswordResetEmail,
    resendConfirmationEmail,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>('signin');
  // In sign-in mode, identifier holds either email address or mobile phone number
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Email confirmation state for newly registered or unconfirmed user
  const [pendingConfirmEmail, setPendingConfirmEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendNotice, setResendNotice] = useState<string | null>(null);

  // Password validation analysis for registration
  const passwordValidation = validatePassword(password);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  // Reset notifications and view states when switching modes or reopening modal
  useEffect(() => {
    setShowPassword(false);
    setErrorMessage(null);
    setSuccessMessage(null);
    setResendNotice(null);
  }, [mode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  // Handle Sign In & Registration Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setResendNotice(null);
    setLoading(true);

    if (mode === 'signin') {
      const result = await signInWithIdentifier(identifier, password);
      setLoading(false);

      if (result.error) {
        if (result.isEmailNotConfirmed) {
          setPendingConfirmEmail(result.email || identifier);
          setErrorMessage(
            'Your email address has not been confirmed yet. Please verify your email via the confirmation link sent to your inbox.'
          );
        } else {
          setErrorMessage(result.error);
        }
      } else {
        closeAuthModal();
      }
    } else if (mode === 'signup') {
      // 1. Full name validation
      if (!fullName.trim()) {
        setErrorMessage('Please enter your full name');
        setLoading(false);
        return;
      }

      // 2. Mobile phone number validation (mandatory 10 digits)
      const cleanPhone = phone.trim().replace(/\D/g, '');
      if (!cleanPhone || cleanPhone.length < 10) {
        setErrorMessage('Mobile phone number is mandatory. Please enter a valid 10-digit number.');
        setLoading(false);
        return;
      }

      // 3. Email validation
      if (!email.trim() || !email.includes('@')) {
        setErrorMessage('Please enter a valid email address.');
        setLoading(false);
        return;
      }

      // 4. Password validation (min 8 chars & special char)
      if (!passwordValidation.isValid) {
        setErrorMessage(
          passwordValidation.errorMessage ||
            'Password must be at least 8 characters long and include at least one special character.'
        );
        setLoading(false);
        return;
      }

      const result = await signUpWithEmail(email, password, fullName, phone);
      setLoading(false);

      if (result.error) {
        setErrorMessage(result.error);
      } else {
        // Registration success: Transition directly to the Confirmation screen
        setPendingConfirmEmail(email.trim());
        setIdentifier(email.trim());
        setMode('verify-email');
      }
    }
  };

  // Handle Forgot Password Submit
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setResendNotice(null);

    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      setErrorMessage('Please enter a valid registered email address.');
      return;
    }

    setLoading(true);
    const { error } = await sendPasswordResetEmail(forgotEmail);
    setLoading(false);

    if (error) {
      setErrorMessage(error);
    } else {
      setForgotSent(true);
      setSuccessMessage(`Password reset link has been dispatched to ${forgotEmail.trim()}.`);
    }
  };

  // Handle Resend Confirmation Email
  const handleResendConfirmation = async (targetEmail: string) => {
    if (!targetEmail) return;
    setResendLoading(true);
    setResendNotice(null);

    const { error } = await resendConfirmationEmail(targetEmail);
    setResendLoading(false);

    if (error) {
      setResendNotice(`Failed to resend: ${error}`);
    } else {
      setResendNotice(`Verification email successfully resent to ${targetEmail}! Please check your inbox and spam folder.`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-3 sm:p-4 flex min-h-screen items-center justify-center animate-fade-in"
      onClick={closeAuthModal}
    >
      <div
        className="relative w-full max-w-md bg-dark-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl shadow-black/95 my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header with Title and Close Button */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-800/80 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-orange/10 border border-brand-orange/30 text-brand-orange flex items-center justify-center flex-shrink-0">
              {mode === 'verify-email' ? (
                <MailCheck size={20} />
              ) : mode === 'forgot' ? (
                <KeyRound size={20} />
              ) : (
                <Lock size={18} />
              )}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white font-heading leading-tight">
                {mode === 'verify-email'
                  ? 'Confirm Your Email'
                  : mode === 'forgot'
                  ? 'Reset Password'
                  : mode === 'signin'
                  ? 'Sign In to 3D FormX'
                  : 'Create 3D FormX Account'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {mode === 'verify-email'
                  ? 'Check your mailbox to activate account'
                  : mode === 'forgot'
                  ? 'We will send a secure password reset link'
                  : mode === 'signin'
                  ? 'Sign in using Email ID or Phone Number'
                  : 'Join India’s premier 3D manufacturing hub'}
              </p>
            </div>
          </div>

          {/* Close ('X') Button */}
          <button
            onClick={closeAuthModal}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-dark-800 border border-slate-700/80 hover:border-slate-600 transition-all flex items-center justify-center flex-shrink-0"
            aria-label="Close dialog"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher (Visible in Sign In and Register modes) */}
        {(mode === 'signin' || mode === 'signup') && (
          <div className="grid grid-cols-2 p-1 bg-dark-950 rounded-xl border border-slate-800 mb-4 flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-brand-orange text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-brand-orange text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto pr-1 -mr-1 custom-scrollbar flex-1">
          {/* Alert Messages */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300 animate-fade-in">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <span>{errorMessage}</span>
                {/* If unconfirmed email error detected during sign-in, give direct resend button */}
                {pendingConfirmEmail && mode === 'signin' && (
                  <div className="mt-2 pt-2 border-t border-rose-500/20 flex items-center gap-2">
                    <button
                      type="button"
                      disabled={resendLoading}
                      onClick={() => handleResendConfirmation(pendingConfirmEmail)}
                      className="text-[11px] font-bold text-brand-orange hover:underline flex items-center gap-1 disabled:opacity-50"
                    >
                      {resendLoading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                      Resend Confirmation Email to {pendingConfirmEmail}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-300 animate-fade-in">
              <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {resendNotice && (
            <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300 animate-fade-in">
              <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{resendNotice}</span>
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW 1: REGISTRATION EMAIL CONFIRMATION NOTICE SCREEN          */}
          {/* ============================================================== */}
          {mode === 'verify-email' && (
            <div className="py-2 text-center space-y-4 animate-scale-in">
              <div className="w-16 h-16 rounded-2xl bg-brand-orange/15 border border-brand-orange/40 text-brand-orange flex items-center justify-center mx-auto shadow-lg shadow-brand-orange/10">
                <MailCheck size={32} />
              </div>

              <div>
                <h4 className="text-lg font-extrabold text-white font-heading">
                  Please Confirm Your Email
                </h4>
                <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
                  We have sent a verification link to{' '}
                  <strong className="text-brand-orange underline">{pendingConfirmEmail || email}</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-dark-950 border border-slate-800 text-left text-xs text-slate-400 space-y-2">
                <div className="flex items-start gap-2 text-amber-300 font-semibold">
                  <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-amber-400" />
                  <span>Important: You must confirm your email before logging in.</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed pl-5">
                  Click the link inside the verification email to activate your account. If you don't see the email within 1-2 minutes, please be sure to inspect your <strong className="text-white">Spam / Junk folder</strong>.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIdentifier(pendingConfirmEmail || email);
                    setMode('signin');
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-black font-extrabold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-glow-orange"
                >
                  Proceed to Sign In
                </button>

                <button
                  type="button"
                  disabled={resendLoading}
                  onClick={() => handleResendConfirmation(pendingConfirmEmail || email)}
                  className="w-full py-2.5 px-4 rounded-xl bg-dark-850 hover:bg-dark-800 border border-slate-700/80 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {resendLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Resending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={13} className="text-brand-orange" />
                      <span>Resend Confirmation Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW 2: FORGOT PASSWORD SCREEN                                 */}
          {/* ============================================================== */}
          {mode === 'forgot' && (
            <div className="py-1 animate-scale-in">
              {forgotSent ? (
                <div className="text-center py-4 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle size={28} />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-white">Reset Link Dispatched</h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      We have sent instructions to reset your password to{' '}
                      <strong className="text-brand-orange">{forgotEmail}</strong>.
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-400 bg-dark-950 border border-slate-800 p-3 rounded-xl text-left">
                    Please check your email inbox and spam folder. Click the secure link to set your new password.
                  </p>
                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signin');
                        setForgotSent(false);
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-black font-extrabold text-xs uppercase tracking-wider transition-all"
                    >
                      Back to Sign In
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleForgotSubmit}
                      className="w-full py-2.5 text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      Didn't get the email? Click to resend
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div className="p-3 rounded-xl bg-dark-950 border border-slate-800/80 text-xs text-slate-400 leading-relaxed flex items-start gap-2.5">
                    <HelpCircle size={16} className="text-brand-orange mt-0.5 flex-shrink-0" />
                    <span>
                      Enter the email address registered with your 3D FormX account. We'll send you a password reset link.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Registered Email Address <span className="text-brand-orange">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full bg-dark-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-orange"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-black font-extrabold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-glow-orange disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Sending Link...</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Send Reset Link</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setErrorMessage(null);
                    }}
                    className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft size={13} />
                    <span>Back to Sign In</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW 3: SIGN IN & REGISTER FORMS                               */}
          {/* ============================================================== */}
          {(mode === 'signin' || mode === 'signup') && (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'signup' ? (
                <>
                  {/* 1. Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Full Name <span className="text-brand-orange">*</span>
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Rajesh Kumar"
                        className="w-full bg-dark-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-orange"
                      />
                    </div>
                  </div>

                  {/* 2. Mandatory Mobile Phone Number */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-300">
                        Mobile Phone Number <span className="text-brand-orange">*</span>
                      </label>
                      <span className="text-[10px] text-brand-orange font-mono">Mandatory</span>
                    </div>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="10-digit mobile (e.g. 9876543210)"
                        className="w-full bg-dark-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-orange"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Used for order delivery alerts and signing in to your account.
                    </p>
                  </div>

                  {/* 3. Email Address */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Address <span className="text-brand-orange">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full bg-dark-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-orange"
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* Sign In Mode: Allows EITHER Email ID OR Phone Number */
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email ID or Mobile Phone Number <span className="text-brand-orange">*</span>
                  </label>
                  <div className="relative">
                    {identifier.includes('@') ? (
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-orange" />
                    ) : (
                      <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    )}
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Enter registered email or 10-digit phone"
                      className="w-full bg-dark-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-orange"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    You can type your registered email address or your 10-digit mobile number.
                  </p>
                </div>
              )}

              {/* Password Field with View / Hide Eye Button and Forgot Password Link */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Password <span className="text-brand-orange">*</span>
                  </label>
                  {mode === 'signin' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(identifier.includes('@') ? identifier : '');
                        setForgotSent(false);
                        setErrorMessage(null);
                        setMode('forgot');
                      }}
                      className="text-[11px] text-brand-orange font-semibold hover:underline transition-colors"
                    >
                      Forgot password?
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400">Min. 8 chars & special char</span>
                  )}
                </div>

                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-dark-950 border border-slate-800 rounded-xl pl-10 pr-11 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-orange"
                  />
                  {/* Eye View / Hide Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-brand-orange transition-colors rounded-lg focus:outline-none"
                    title={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password validation indicators in Registration mode */}
                {mode === 'signup' && (
                  <div className="mt-2 space-y-1 bg-dark-950/60 p-2.5 rounded-lg border border-slate-800/80">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Password Requirements:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                      <div
                        className={`flex items-center gap-1.5 transition-colors ${
                          passwordValidation.hasMinLength ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      >
                        {passwordValidation.hasMinLength ? (
                          <Check size={12} className="stroke-[3]" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                        )}
                        <span>At least 8 characters</span>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 transition-colors ${
                          passwordValidation.hasSpecialChar ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      >
                        {passwordValidation.hasSpecialChar ? (
                          <Check size={12} className="stroke-[3]" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                        )}
                        <span>Special character (!@#$%)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-3 px-4 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-black font-extrabold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-glow-orange disabled:opacity-50 active:scale-98"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : mode === 'signin' ? (
                  'Sign In'
                ) : (
                  'Complete Registration'
                )}
              </button>
            </form>
          )}

          {/* Footer note for mode switching */}
          {(mode === 'signin' || mode === 'signup') && (
            <div className="mt-4 pt-3 border-t border-slate-800/60 text-center text-[11px] text-slate-500">
              {mode === 'signin' ? (
                <span>
                  New customer?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setErrorMessage(null);
                    }}
                    className="text-brand-orange font-semibold hover:underline"
                  >
                    Create an account
                  </button>
                </span>
              ) : (
                <span>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setErrorMessage(null);
                    }}
                    className="text-brand-orange font-semibold hover:underline"
                  >
                    Sign in here
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
