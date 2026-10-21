import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, Phone, CheckCircle, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, signInWithIdentifier, signUpWithEmail } = useAuth();
  
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  // In sign-in mode, this holds either an email address or mobile phone number
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  // Reset password visibility when switching modes or closing
  useEffect(() => {
    setShowPassword(false);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [mode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    if (mode === 'signin') {
      const { error } = await signInWithIdentifier(identifier, password);
      setLoading(false);
      if (error) {
        setErrorMessage(error);
      } else {
        closeAuthModal();
      }
    } else {
      // Registration Validations
      if (!fullName.trim()) {
        setErrorMessage('Please enter your full name');
        setLoading(false);
        return;
      }

      // Requirement: Phone number is mandatory
      const cleanPhone = phone.trim().replace(/\D/g, '');
      if (!cleanPhone || cleanPhone.length < 10) {
        setErrorMessage('Mobile phone number is mandatory. Please enter a valid 10-digit number.');
        setLoading(false);
        return;
      }

      if (!email.trim() || !email.includes('@')) {
        setErrorMessage('Please enter a valid email address.');
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        setLoading(false);
        return;
      }

      const { error } = await signUpWithEmail(email, password, fullName, phone);
      setLoading(false);
      if (error) {
        setErrorMessage(error);
      } else {
        setSuccessMessage('Account registered successfully! You can now sign in using either your email ID or mobile phone number.');
        setTimeout(() => {
          setIdentifier(email);
          setMode('signin');
          setSuccessMessage(null);
        }, 2200);
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm p-3 sm:p-4 flex min-h-screen items-center justify-center animate-fade-in"
      onClick={closeAuthModal}
    >
      <div 
        className="relative w-full max-w-md bg-dark-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl shadow-black/90 my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header with Title and Guaranteed Always-Visible Close Button */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-800/80 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-orange/10 border border-brand-orange/30 text-brand-orange flex items-center justify-center flex-shrink-0">
              <Lock size={18} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white font-heading leading-tight">
                {mode === 'signin' ? 'Sign In to 3D FormX' : 'Create 3D FormX Account'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {mode === 'signin' 
                  ? 'Sign in using Email ID or Phone Number' 
                  : 'Join India’s premier 3D manufacturing hub'}
              </p>
            </div>
          </div>

          {/* Close ('X') Button - Always visible at top right inside modal */}
          <button
            onClick={closeAuthModal}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-dark-800 border border-slate-700/80 hover:border-slate-600 transition-all flex items-center justify-center flex-shrink-0"
            aria-label="Close dialog"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-dark-950 rounded-xl border border-slate-800 mb-4 flex-shrink-0">
          <button
            type="button"
            onClick={() => { setMode('signin'); setErrorMessage(null); setSuccessMessage(null); }}
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
            onClick={() => { setMode('signup'); setErrorMessage(null); setSuccessMessage(null); }}
            className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-brand-orange text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Scrollable Form Body for Small / Zoomed Screens */}
        <div className="overflow-y-auto pr-1 -mr-1 custom-scrollbar flex-1">
          {/* Alert Messages */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300 animate-shake">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-300">
              <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

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

            {/* Password Field with View / Hide Eye Button */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Password <span className="text-brand-orange">*</span>
                </label>
                {mode === 'signin' && (
                  <span className="text-[10px] text-slate-400">Min. 6 characters</span>
                )}
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-dark-950 border border-slate-800 rounded-xl pl-10 pr-11 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-orange"
                />
                {/* Eye View / Hide Toggle Button inside input box */}
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

          {/* Footer note */}
          <div className="mt-4 pt-3 border-t border-slate-800/60 text-center text-[11px] text-slate-500">
            {mode === 'signin' ? (
              <span>
                New customer?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setErrorMessage(null); }}
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
                  onClick={() => { setMode('signin'); setErrorMessage(null); }}
                  className="text-brand-orange font-semibold hover:underline"
                >
                  Sign in here
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
