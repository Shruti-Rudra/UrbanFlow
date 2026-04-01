import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, ArrowRight, RefreshCw, CheckCircle } from 'lucide-react';

const OTPVerification = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { tempUser, generatedOTP, verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();

  // Protect this route directly if accessed without a pending session
  if (!tempUser) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      if (otp.length !== 6) {
        throw new Error('Please enter exactly 6 digits');
      }

      await verifyOTP(otp);
      
      // If verifyOTP doesn't throw, it was successful and context state is updated.
      navigate('/dashboard');
      
    } catch (err) {
      setError(err.message || 'Verification failed');
      setOtp('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    setError('');
    const newOtp = resendOTP();
    setMessage(`A new verification code has been sent!`);
    setTimeout(() => setMessage(''), 4000);
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Verify your identity
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          We've sent a 6-digit code to <span className="font-semibold text-slate-800">{tempUser.identifier}</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-panel py-8 px-4 sm:px-10 animate-fade-in relative z-10 text-center">
          
          <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={30} />
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md text-left">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {message && (
            <div className="mb-6 bg-green-50 border border-green-200 p-3 rounded-md text-center flex items-center justify-center gap-2">
              <CheckCircle size={16} className="text-green-500" />
              <p className="text-sm text-green-700 font-medium">{message}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <input
                type="text"
                maxLength="6"
                required
                className="w-full text-center text-3xl tracking-[0.5em] font-mono py-4 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition duration-200"
                placeholder="••••••"
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, ''); // Allow only digits
                  setOtp(val);
                }}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full flex justify-center items-center py-3 px-4 rounded-lg shadow text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed transition"
              >
                {isLoading ? (
                  <span>Verifying...</span>
                ) : (
                  <span className="flex items-center gap-2">Verify & Continue <ArrowRight size={18} /></span>
                )}
              </button>
            </div>
            
            <div className="mt-6 pt-4 text-center flex flex-col items-center gap-2">
              <p className="text-sm text-slate-500">Didn't receive the code?</p>
              <button 
                type="button" 
                onClick={handleResend}
                className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-800 transition"
              >
                <RefreshCw size={14} /> Resend Code
              </button>
            </div>
            
            <div className="mt-8 border-t border-slate-200 pt-4 text-center">
              <p className="text-sm font-semibold text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-200 shadow-sm">
                [Testing Mode] Your OTP Code is: <span className="font-mono text-xl tracking-widest text-slate-800 ml-2">{generatedOTP}</span>
              </p>
            </div>

            <div className="mt-4 text-center">
               <Link to="/login" className="text-xs text-slate-400 hover:text-slate-600 underline">Wrong email/phone? Go back</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
