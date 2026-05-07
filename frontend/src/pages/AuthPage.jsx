import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Link2, Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';

const AuthPage = ({ type }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const isLogin = type === 'login';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isForgotPassword) {
        const res = await axios.post('/api/auth/forgot-password', { email });
        toast.success(res.data.msg || 'OTP sent to your email.');
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      } else if (isLogin) {
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);
        const res = await axios.post('/api/auth/login', formData);
        login(res.data.access_token);
        toast.success('Successfully logged in!');
        navigate('/dashboard');
      } else {
        await axios.post('/api/auth/signup', { 
            full_name: fullName, 
            email, 
            password 
        });
        toast.success('Account created successfully! Please sign in.');
        navigate('/login');
      }
    } catch (err) {
      let errorMsg = 'An error occurred';
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errorMsg = err.response.data.detail.map(e => e.msg).join(', ');
        } else if (typeof err.response.data.detail === 'string') {
          errorMsg = err.response.data.detail;
        } else {
          errorMsg = JSON.stringify(err.response.data.detail);
        }
      }
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Real Google OAuth — opens native account picker popup
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      try {
        // Fetch user info from Google using the access token (using fetch to avoid global axios baseURL)
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        
        if (!userInfoRes.ok) {
            throw new Error('Failed to fetch user info from Google');
        }

        const userData = await userInfoRes.json();
        const { name, email: gEmail, picture } = userData;
        
        // Send real user data to our backend
        const res = await axios.post('/api/auth/google', {
          email: gEmail,
          full_name: name,
          profile_photo: picture,
        });
        
        login(res.data.access_token);
        toast.success(`Welcome, ${name}! 🎉`);
        navigate('/dashboard');
      } catch (err) {
        let errorMsg = 'Google sign-in failed';
        if (err.response?.data?.detail) {
          errorMsg = typeof err.response.data.detail === 'string'
            ? err.response.data.detail
            : JSON.stringify(err.response.data.detail);
        }
        toast.error(errorMsg);
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google OAuth Error:', error);
      toast.error('Google sign-in was cancelled or failed. Please try again.');
    },
    flow: 'implicit',
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background blobs (kept for extra local flair, but global handles the rest) */}
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

        {/* Google Auth — Real OAuth popup (opens native Google account picker) */}
        {!isForgotPassword && (
          <div className="mt-5 space-y-4">
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-4 text-xs text-slate-500 uppercase font-medium tracking-wider">Or</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <button
              type="button"
              onClick={() => googleLogin()}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <p className="text-center text-[10px] text-slate-600">
              Clicking "Continue with Google" opens a secure Google account picker.
            </p>
          </div>
        )}

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
