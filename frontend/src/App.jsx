import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/AppLayout';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import LinkManagement from './pages/LinkManagement';
import Analytics from './pages/Analytics';
import NotFound from './pages/NotFound';
import ResetPassword from './pages/ResetPassword';
import axios from 'axios';
import { API_BASE_URL } from './services/api';

import Profile from './pages/Profile';
import GoPro from './pages/GoPro';
import About from './pages/About';
import IndustrialSuite from './pages/IndustrialSuite';
import SplashPage from './pages/SplashPage';

// Set global API base URL
axios.defaults.baseURL = API_BASE_URL;

const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Loading SmartLink...</div>;
  if (!token) return <Navigate to="/login" />;
  
  return <AppLayout>{children}</AppLayout>;
};

const PublicRoute = ({ children }) => {
  const { token } = useAuth();
  if (token) return <Navigate to="/dashboard" />;
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
            },
          }}
        />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          <Route path="/login" element={
            <PublicRoute><AuthPage type="login" /></PublicRoute>
          } />
          <Route path="/signup" element={
            <PublicRoute><AuthPage type="signup" /></PublicRoute>
          } />

          <Route path="/dashboard" element={
            <PrivateRoute><Dashboard /></PrivateRoute>
          } />
          <Route path="/links" element={
            <PrivateRoute><LinkManagement /></PrivateRoute>
          } />
          <Route path="/analytics" element={
            <PrivateRoute><Analytics /></PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute><Profile /></PrivateRoute>
          } />
          <Route path="/go-pro" element={
            <PrivateRoute><GoPro /></PrivateRoute>
          } />
          <Route path="/about" element={
            <PrivateRoute><About /></PrivateRoute>
          } />
          <Route path="/industrial" element={
            <PrivateRoute><IndustrialSuite /></PrivateRoute>
          } />

          <Route path="/reset-password" element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          } />
          
          {/* Protected Routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
