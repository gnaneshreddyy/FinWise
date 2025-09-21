import React, { useState, useEffect } from 'react';
import { Search, Menu, X, ChevronRight, TrendingUp, Shield, Zap, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Dashboard from './Dashboard';

const FinzApp = () => {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'login', 'signup', 'dashboard'
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Dashboard', active: true },
    { name: 'Insights', active: false },
    { name: 'GNG', active: false },
    { name: 'Rewards', active: false },
    { name: 'Stock', active: false },
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    setCurrentView('dashboard');
  };

  const handleSignup = (e) => {
    e.preventDefault();
    setCurrentView('dashboard');
  };

  const handleLoginInputChange = (e) => {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSignupInputChange = (e) => {
    setSignupForm({
      ...signupForm,
      [e.target.name]: e.target.value
    });
  };

  // Landing Page (Home)
  if (currentView === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative min-h-screen flex flex-col items-center justify-center px-4">
          {/* Logo */}
          <div className="text-center mb-12">
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-8">
              Finz
            </h1>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Start Financial
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-600 bg-clip-text text-transparent">
                Learning
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed">
              Take control of your financial future with smart insights, 
              personalized learning, and powerful tools to build wealth.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={() => setCurrentView('signup')}
              className="group bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-medium px-12 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 flex items-center text-lg"
            >
              Sign Up
              <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
            
            <button
              onClick={() => setCurrentView('login')}
              className="group text-purple-400 font-medium px-12 py-4 rounded-lg border-2 border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/10 transition-all duration-300 transform hover:scale-105 text-lg"
            >
              Login
            </button>
          </div>

          {/* Feature Highlights */}
          <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-6xl mx-auto">
            <div className="group bg-slate-800/30 backdrop-blur-sm rounded-xl p-8 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:transform hover:scale-105">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Smart Insights</h3>
              <p className="text-gray-400">AI-powered analytics to help you make better financial decisions and grow your wealth.</p>
            </div>

            <div className="group bg-slate-800/30 backdrop-blur-sm rounded-xl p-8 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:transform hover:scale-105">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Secure Learning</h3>
              <p className="text-gray-400">Learn financial concepts in a safe environment with personalized guidance and support.</p>
            </div>

            <div className="group bg-slate-800/30 backdrop-blur-sm rounded-xl p-8 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:transform hover:scale-105">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Real Progress</h3>
              <p className="text-gray-400">Track your learning journey and see real results in your financial knowledge and habits.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Login Page
  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative w-full max-w-md mx-auto px-4">
          {/* Back Button */}
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center text-purple-400 hover:text-purple-300 transition-colors duration-200 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </button>

          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-4">
              Finz
            </h1>
            <h2 className="text-2xl font-semibold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-400">Sign in to continue your financial learning journey</p>
          </div>

          {/* Login Form */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-8 border border-purple-500/20">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={loginForm.email}
                  onChange={handleLoginInputChange}
                  className="w-full bg-slate-700/50 text-white placeholder-gray-400 px-4 py-3 rounded-lg border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    value={loginForm.password}
                    onChange={handleLoginInputChange}
                    className="w-full bg-slate-700/50 text-white placeholder-gray-400 px-4 py-3 pr-12 rounded-lg border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 bg-slate-700 border-purple-500/30 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors duration-200">
                    Forgot password?
                  </a>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 flex items-center justify-center"
              >
                Sign In
                <ChevronRight className="ml-2 h-5 w-5" />
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Don't have an account?{' '}
                <button
                  onClick={() => setCurrentView('signup')}
                  className="text-purple-400 hover:text-purple-300 transition-colors duration-200"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>

          {/* Demo Login Button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="text-sm text-gray-400 hover:text-purple-400 transition-colors duration-200 underline"
            >
              Demo Login (Skip Authentication)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Sign Up Page
  if (currentView === 'signup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative w-full max-w-md mx-auto px-4">
          {/* Back Button */}
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center text-purple-400 hover:text-purple-300 transition-colors duration-200 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </button>

          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-4">
              Finz
            </h1>
            <h2 className="text-2xl font-semibold text-white mb-2">Join Finz</h2>
            <p className="text-gray-400">Start your financial learning journey today</p>
          </div>

          {/* Sign Up Form */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-8 border border-purple-500/20">
            <form onSubmit={handleSignup} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={signupForm.name}
                  onChange={handleSignupInputChange}
                  className="w-full bg-slate-700/50 text-white placeholder-gray-400 px-4 py-3 rounded-lg border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={signupForm.email}
                  onChange={handleSignupInputChange}
                  className="w-full bg-slate-700/50 text-white placeholder-gray-400 px-4 py-3 rounded-lg border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    value={signupForm.password}
                    onChange={handleSignupInputChange}
                    className="w-full bg-slate-700/50 text-white placeholder-gray-400 px-4 py-3 pr-12 rounded-lg border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  value={signupForm.confirmPassword}
                  onChange={handleSignupInputChange}
                  className="w-full bg-slate-700/50 text-white placeholder-gray-400 px-4 py-3 rounded-lg border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Confirm your password"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 flex items-center justify-center"
              >
                Create Account
                <ChevronRight className="ml-2 h-5 w-5" />
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Already have an account?{' '}
                <button
                  onClick={() => setCurrentView('login')}
                  className="text-purple-400 hover:text-purple-300 transition-colors duration-200"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard View (shown when logged in)
  return <Dashboard onLogout={() => setCurrentView('home')} />;
};

export default FinzApp;