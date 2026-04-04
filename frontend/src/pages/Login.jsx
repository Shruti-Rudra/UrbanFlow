import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Phone, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Key } from 'lucide-react';
import OTPInput from '../components/auth/OTPInput';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [searchParams] = useSearchParams();
  const [loginMode, setLoginMode] = useState(searchParams.get('mode') === 'otp' ? 'otp' : 'password'); // 'password' or 'otp'
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: Identifier/Method, 2: Credentials (OTP only)
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { login, requestOTP, verifyOTP } = useAuth();
  const navigate = useNavigate();

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!identifier || !password) {
        throw new Error('Please enter both email/phone and password');
      }
      await login(identifier, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPRequest = async (e) => {
    e.preventDefault();
    if (countdown > 0) return;
    
    setError('');
    setIsLoading(true);

    try {
      if (!identifier) throw new Error('Please enter email or phone number');
      const res = await requestOTP(identifier);
      setSuccess(res.message);
      setStep(2);
      startCountdown();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerify = async (otpCode) => {
    setError('');
    setIsLoading(true);
    try {
      await verifyOTP(identifier, otpCode);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-[10%] right-[10%] w-96 h-96 bg-primary-100 rounded-full blur-[100px] opacity-40 animate-pulse"></div>
        <div className="absolute bottom-[10%] left-[10%] w-96 h-96 bg-blue-100 rounded-full blur-[100px] opacity-40 animate-pulse delay-1000"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative">
        <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-xl mb-6 text-primary-600 animate-bounce-slow">
                <ShieldCheck size={32} />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-bold text-primary-600 hover:text-primary-500 transition">
                    Create one now
                </Link>
            </p>
        </div>

        <div className="mt-8">
          <div className="glass-panel py-8 px-4 sm:px-10 animate-fade-in mx-2 sm:mx-0">
            {/* Login Mode Toggle */}
            {step === 1 && (
                <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
                    <button 
                        onClick={() => setLoginMode('password')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginMode === 'password' ? 'bg-white shadow text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Password
                    </button>
                    <button 
                        onClick={() => setLoginMode('otp')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginMode === 'otp' ? 'bg-white shadow text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        OTP Code
                    </button>
                </div>
            )}

            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-shake">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                <p className="text-sm text-green-700 font-medium">{success}</p>
              </div>
            )}

            {step === 1 ? (
              <form className="space-y-6" onSubmit={loginMode === 'password' ? handlePasswordLogin : handleOTPRequest}>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Email or Phone Number</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                      <Mail size={20} />
                    </div>
                    <input
                      type="text"
                      required
                      className="input-field pl-11 py-3.5"
                      placeholder="name@example.com"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                    />
                  </div>
                </div>

                {loginMode === 'password' && (
                  <div>
                    <div className="flex justify-between mb-2 ml-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                        <Link to="/forgot-password" size="sm" className="text-xs font-bold text-primary-600 hover:text-primary-500">
                            Forgot?
                        </Link>
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                        <Lock size={20} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        className="input-field pl-11 pr-11 py-3.5"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <div className="mt-3 text-right">
                        <button 
                            type="button"
                            onClick={() => setLoginMode('otp')}
                            className="text-xs font-bold text-primary-600 hover:text-primary-500 underline underline-offset-4"
                        >
                            Forgot Password? Login via OTP
                        </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || (loginMode === 'otp' && countdown > 0)}
                  className="btn-primary w-full py-4 relative group overflow-hidden"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                        {loginMode === 'password' ? 'Sign In' : 'Send Login Code'} 
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center animate-fade-in">
                <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-50 text-primary-600 mb-4">
                        <Key size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Enter Verification Code</h3>
                    <p className="text-sm text-slate-500 mt-1">We sent a 6-digit code to <span className="font-semibold text-slate-700">{identifier}</span></p>
                </div>

                <div className="mb-8">
                    <OTPInput onComplete={handleOTPVerify} />
                </div>

                <div className="space-y-4">
                    <p className="text-sm text-slate-500">
                        Didn't receive the code?{' '}
                        {countdown > 0 ? (
                            <span className="text-primary-600 font-bold">Resend in {countdown}s</span>
                        ) : (
                            <button 
                                onClick={handleOTPRequest}
                                className="text-primary-600 font-bold hover:underline"
                            >
                                Resend Code
                            </button>
                        )}
                    </p>
                    <button 
                        onClick={() => setStep(1)}
                        className="text-sm font-semibold text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1 mx-auto"
                    >
                        Change email/phone?
                    </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
