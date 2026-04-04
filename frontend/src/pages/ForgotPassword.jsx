import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, ArrowLeft, Send, Key } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const res = await forgotPassword(email);
      setSuccess(res.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Forgot Password?</h2>
            <p className="mt-2 text-sm text-slate-600 px-8">
                Enter your email address and we'll send you a link to reset your password.
            </p>
        </div>

        <div className="mt-8">
          <div className="glass-panel py-8 px-4 sm:px-10 animate-fade-in mx-2 sm:mx-0">
            
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {success ? (
              <div className="text-center py-4">
                <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600">
                    <Send size={28} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Check your inbox</h3>
                <p className="text-sm text-slate-500 mb-8">{success}</p>
                <Link to="/login" className="btn-primary inline-flex items-center gap-2">
                    <ArrowLeft size={18} /> Back to Login
                </Link>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      required
                      className="input-field pl-10 py-3.5"
                      placeholder="name@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full py-4"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Sending Link...
                            </span>
                        ) : (
                            <span>Send Reset Link</span>
                        )}
                    </button>
                    <Link to="/login" className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors">
                        <ArrowLeft size={16} /> Back to Sign In
                    </Link>
                </div>
              </form>
            )}

            <div className="mt-10 pt-8 border-t border-slate-100 text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 mb-4 transition-transform hover:scale-110">
                    <Key size={20} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Remembered your phone?</h3>
                <p className="text-xs text-slate-500 mb-6">You can log in instantly using an OTP sent to your registered phone number.</p>
                <Link 
                    to="/login?mode=otp" 
                    className="inline-flex items-center justify-center w-full py-3 px-4 border-2 border-primary-100 rounded-xl text-sm font-bold text-primary-600 hover:bg-primary-50 hover:border-primary-200 transition-all active:scale-[0.98]"
                >
                    Login via OTP instead
                </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
