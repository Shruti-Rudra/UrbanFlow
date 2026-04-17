import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, ShieldCheck, ArrowRight, Key } from 'lucide-react';
import OTPInput from '../components/auth/OTPInput';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    identifier: '' // Email or Phone
  });
  const [step, setStep] = useState(1); // 1: Details, 2: OTP
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { requestOTP, verifyOTP } = useAuth();
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name.trim() || !formData.identifier.trim()) {
      setError('Please provide your name and email/phone.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await requestOTP(formData.identifier);
      setSuccess(res.message);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (otpCode) => {
    setError('');
    setIsLoading(true);
    try {
      // In a real flow, we'd also pass the name to update the placeholder user
      // But for simplicity of the prompt's request "Verify OTP before login/registration":
      await verifyOTP(formData.identifier, otpCode);
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
      <div className="absolute top-0 right-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-[5%] left-[5%] w-80 h-80 bg-primary-100 rounded-full blur-[120px] opacity-30 animate-pulse"></div>
        <div className="absolute bottom-[5%] right-[5%] w-80 h-80 bg-blue-100 rounded-full blur-[120px] opacity-30 animate-pulse delay-700"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white shadow-lg mb-6 text-primary-600 animate-slide-up">
                <User size={28} />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create your account</h2>
            <p className="mt-2 text-sm text-slate-600">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-primary-600 hover:text-primary-500 transition">
                    Sign in here
                </Link>
            </p>
        </div>

        <div className="mt-8">
          <div className="glass-panel py-8 px-4 sm:px-10 animate-fade-in mx-2 sm:mx-0">
            
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
              <form className="space-y-6" onSubmit={handleRequestOTP}>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                      <User size={18} />
                    </div>
                    <input
                      required
                      type="text"
                      className="input-field pl-10 py-3"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Email or Phone</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                      <Mail size={18} />
                    </div>
                    <input
                      required
                      type="text"
                      className="input-field pl-10 py-3"
                      placeholder="name@email.com or 10-digit phone"
                      value={formData.identifier}
                      onChange={(e) => setFormData({...formData, identifier: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full py-4 group"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Sending Code...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                          Get Verification Code
                          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center animate-fade-in">
                <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-50 text-primary-600 mb-4">
                        <Key size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Verify Your Identity</h3>
                    <p className="text-sm text-slate-500 mt-1">Enter the 6-digit code sent to <span className="font-semibold text-slate-700">{formData.identifier}</span></p>
                </div>

                <div className="mb-8">
                    <OTPInput onComplete={handleVerifyOTP} />
                </div>

                <button 
                    onClick={() => setStep(1)}
                    className="text-sm font-semibold text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1 mx-auto"
                >
                    Back to registration
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
