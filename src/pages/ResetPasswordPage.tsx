import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Check,
  KeyRound,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validatePassword } from '../utils/validation';
import { supabase } from '../lib/supabase';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { updateUserPassword, openAuthModal, user } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRecoverySessionReady, setIsRecoverySessionReady] = useState(false);
  const [sessionCheckLoading, setSessionCheckLoading] = useState(true);

  const passwordValidation = validatePassword(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  // Listen for Supabase recovery token in URL
  useEffect(() => {
    // 1. Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsRecoverySessionReady(true);
      }
      setSessionCheckLoading(false);
    });

    // 2. Listen for auth state change (especially PASSWORD_RECOVERY event)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (session && session.user)) {
        setIsRecoverySessionReady(true);
      }
      setSessionCheckLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!passwordValidation.isValid) {
      setErrorMessage(
        passwordValidation.errorMessage ||
          'Password must be at least 8 characters long and contain at least one special character.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    setLoading(true);
    const { error } = await updateUserPassword(password);
    setLoading(false);

    if (error) {
      setErrorMessage(error);
    } else {
      setIsSuccess(true);
    }
  };

  return (
    <div className="min-h-[85vh] bg-dark-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-dark-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/90">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-block mb-4">
            <img
              src="/images/logo.png"
              alt="3D FormX"
              className="h-9 w-auto mx-auto object-contain"
            />
          </Link>
          <div className="w-12 h-12 rounded-2xl bg-brand-orange/10 border border-brand-orange/30 text-brand-orange flex items-center justify-center mx-auto mb-3">
            <KeyRound size={22} />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white font-heading">
            Set New Password
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create a secure password to access your 3D FormX account.
          </p>
        </div>

        {sessionCheckLoading ? (
          <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <Loader2 size={24} className="animate-spin text-brand-orange" />
            <span className="text-xs">Verifying security token...</span>
          </div>
        ) : isSuccess ? (
          /* Success Screen */
          <div className="py-4 text-center space-y-4 animate-scale-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle size={32} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Password Updated!</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto leading-relaxed">
                Your password has been reset successfully. You can now use your new password to sign in.
              </p>
            </div>

            <div className="pt-3 space-y-2">
              <button
                type="button"
                onClick={() => navigate('/shop')}
                className="w-full py-3 px-4 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-black font-extrabold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-brand-orange/20"
              >
                <span>Continue to Shop</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ) : !isRecoverySessionReady && !user ? (
          /* Expired / Missing Token State */
          <div className="text-center py-4 space-y-4 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
              <AlertCircle size={28} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Reset Link Invalid or Expired</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                This password reset link is invalid or has already been used. Please request a fresh reset link from the login window.
              </p>
            </div>

            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  navigate('/');
                  openAuthModal();
                }}
                className="w-full py-3 px-4 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-md"
              >
                Request New Reset Link
              </button>

              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={13} />
                <span>Return to Homepage</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Password Reset Form */
          <form onSubmit={handleResetPassword} className="space-y-4 animate-fade-in">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* New Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  New Password <span className="text-brand-orange">*</span>
                </label>
                <span className="text-[10px] text-slate-400">Min. 8 chars & special char</span>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="w-full bg-dark-950 border border-slate-800 rounded-xl pl-10 pr-11 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-orange"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-brand-orange transition-colors rounded-lg focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Confirm New Password <span className="text-brand-orange">*</span>
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className="w-full bg-dark-950 border border-slate-800 rounded-xl pl-10 pr-11 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-orange"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-brand-orange transition-colors rounded-lg focus:outline-none"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Real-time Requirements Check */}
            <div className="bg-dark-950/70 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Security Checklist:
              </div>
              <div className="space-y-1 text-[11px]">
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
                  <span>At least 8 characters long</span>
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
                  <span>Contains at least one special character (!@#$%^&*)</span>
                </div>

                <div
                  className={`flex items-center gap-1.5 transition-colors ${
                    passwordsMatch ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  {passwordsMatch ? (
                    <Check size={12} className="stroke-[3]" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  )}
                  <span>Passwords match</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !passwordValidation.isValid || !passwordsMatch}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-black font-extrabold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-glow-orange disabled:opacity-40"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={15} />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
