import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Link2, Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const AuthPage = ({ type }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const isLogin = type === 'login';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isForgotPassword) {
        // Forgot Password Logic
        const res = await axios.post('/api/auth/forgot-password', { email });
        toast.success(res.data.msg || 'OTP sent to your email.');
        // Redirect to reset password page with email as query param
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      } else if (isLogin) {
        // Login Logic
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);
        const res = await axios.post('/api/auth/login', formData);
        login(res.data.access_token);
        toast.success('Successfully logged in!');
        navigate('/dashboard');
      } else {
        // Signup Logic
        const res = await axios.post('/api/auth/signup', { 
            full_name: fullName, 
            email, 
            password 
        });
        login(res.data.access_token);
        toast.success('Account created successfully!');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-950">
      {/* Background blobs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary-600/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px]" />

      <div className="w-full max-w-md glass-morphism p-8 rounded-3xl relative z-10 border border-white/10 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-14 h-14 rounded-2xl premium-gradient flex items-center justify-center mb-6 shadow-lg shadow-primary-500/20">
            <Link2 className="text-white" size={30} />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
            {isForgotPassword ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Get Started'}
          </h2>
          <p className="text-slate-400 text-sm">
            {isForgotPassword 
                ? 'Enter your email to receive a password reset link.' 
                : isLogin 
                    ? 'Manage your links with SmartLink analytics.' 
                    : 'Create your account and start shortening links.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name Field (Signup Only) */}
          {!isLogin && !isForgotPassword && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary-400 transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Email address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary-400 transition-colors">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password Field (Not shown on Forgot Password) */}
          {!isForgotPassword && (
            <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                    <label className="text-sm font-medium text-slate-300">Password</label>
                    {isLogin && (
                        <button 
                            type="button" 
                            onClick={() => setIsForgotPassword(true)}
                            className="text-xs text-primary-400 font-semibold hover:text-primary-300 transition-colors"
                        >
                            Forgot password?
                        </button>
                    )}
                </div>
                <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary-400 transition-colors">
                    <Lock size={18} />
                </div>
                <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="block w-full pl-11 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors"
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-xl premium-gradient text-white font-semibold shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed group mt-4"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                {isForgotPassword ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center space-y-3">
          {isForgotPassword && (
              <button 
                onClick={() => setIsForgotPassword(false)}
                className="text-slate-400 text-sm font-semibold hover:text-white transition-colors"
              >
                  Back to Login
              </button>
          )}  
          {!isForgotPassword && (
            <p className="text-slate-400 text-sm">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                <Link
                to={isLogin ? '/signup' : '/login'}
                className="text-primary-400 font-semibold hover:text-primary-300 transition-colors"
                >
                {isLogin ? 'Sign up' : 'Login'}
                </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
