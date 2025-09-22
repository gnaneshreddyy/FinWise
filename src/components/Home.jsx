import React, { useState, useEffect } from 'react';
import { Search, Menu, X, ChevronRight, TrendingUp, Shield, Zap, Eye, EyeOff, ArrowLeft, Receipt } from 'lucide-react';
import Dashboard from './Dashboard';

// STEP 1: ADD FIREBASE IMPORTS
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';


const FinzApp = ({ onMockLogin, hideHeader = false }) => {
  const [currentView, setCurrentView] = useState('home');
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

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Logging in...", loginForm);
    if (onMockLogin) {
      onMockLogin();
      return;
    }
    // Fall back to old local view switch if no handler provided
    setCurrentView('dashboard');
  };

  const handleSignup = (e) => {
    e.preventDefault();
    console.log("Signing up...", signupForm);
    if (onMockLogin) {
      onMockLogin();
      return;
    }
    // Fall back to old local view switch if no handler provided
    setCurrentView('dashboard');
  };

  // STEP 2: CREATE THE GOOGLE SIGN-IN HANDLER
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log("Successfully signed in with Google:", user.displayName);
      // The onAuthStateChanged listener in App.jsx will automatically handle
      // switching the view to the dashboard upon successful login.
    } catch (error) {
      console.error("Google sign-in error:", error.message);
    }
  };

  const handleLoginInputChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleSignupInputChange = (e) => {
    setSignupForm({ ...signupForm, [e.target.name]: e.target.value });
  };

  // --- VIEWS ---

  if (currentView === 'home') {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-200 font-sans">
        {!hideHeader && (
          <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-gray-950/80 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
                FinWise
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
                <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">How It Works</a>
                <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
                <a href="#resources" className="text-gray-300 hover:text-white transition-colors">Resources</a>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <button onClick={() => setCurrentView('login')} className="text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-lg">
                  Login
                </button>
                <button onClick={() => setCurrentView('signup')} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium px-5 py-2 rounded-lg transition-all duration-300">
                  Get Started
                </button>
              </div>
              <div className="md:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white focus:outline-none">
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
            {isMenuOpen && (
              <div className="md:hidden bg-gray-950/90 backdrop-blur-md pb-4">
                <div className="flex flex-col items-center space-y-4 pt-4">
                  <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors text-lg">Features</a>
                  <a href="#how-it-works" onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors text-lg">How It Works</a>
                  <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors text-lg">Pricing</a>
                  <a href="#resources" onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors text-lg">Resources</a>
                  <button onClick={() => { setCurrentView('login'); setIsMenuOpen(false); }} className="text-gray-300 hover:text-white transition-colors text-lg">
                    Login
                  </button>
                  <button onClick={() => { setCurrentView('signup'); setIsMenuOpen(false); }} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium px-5 py-2 rounded-lg transition-all duration-300 text-lg">
                    Get Started
                  </button>
                </div>
              </div>
            )}
          </nav>
        )}

        <div className="relative overflow-hidden">
          {/* Hero Section */}
          <div className="pt-32 pb-24 md:pt-40 md:pb-32 bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 relative overflow-hidden">
            {/* Background blob effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse -z-10"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000 -z-10"></div>

            <div className="container mx-auto px-6 text-center">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Unlock Your Financial <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
                  Intelligence.
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-10">
                Empowering the next generation to build adaptive financial habits for life. Our clean, modern interface and powerful tools make it easy to manage your money.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => setCurrentView('signup')} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center">
                  Get Started
                </button>
                <a href="#features" className="text-gray-300 border border-gray-700 hover:border-blue-500 hover:text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center">
                  Explore Features
                </a>
              </div>
            </div>
          </div>

          {/* Intuitive AI Dashboard Section */}
          <section className="py-20 md:py-28 bg-gray-950" id="dashboard-preview">
            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 text-center md:text-left">
                <h2 className="text-4xl font-bold text-white mb-4">Intuitive AI Dashboard</h2>
                <p className="text-lg text-gray-400 mb-6">
                  Visualize your financial universe. Our clean, modern interface makes it easy to understand your money at a glance.
                </p>
                <button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
                  See It In Action
                </button>
              </div>
              <div className="order-1 md:order-2">
                <div className="bg-gray-800 rounded-xl p-6 aspect-video flex items-center justify-center text-gray-500 text-xl border border-gray-700 shadow-xl">
                  Dashboard Preview Image Here
                </div>
              </div>
            </div>
          </section>

          {/* Key Features Section */}
          <section className="py-20 md:py-28 bg-gray-950" id="features">
            <div className="container mx-auto px-6 text-center">
              <h2 className="text-4xl font-bold text-white mb-4">Key Features</h2>
              <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-16">
                Unlock a smarter way to manage your finances with FinWise's powerful, intuitive tools.
              </p>
              <div className="grid md:grid-cols-3 gap-8">
                {/* Feature Card 1 */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-8 border border-gray-800 hover:border-blue-500/50 transition-all duration-300 group">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-14 h-14 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                    <Zap className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">AI-Powered Budgeting</h3>
                  <p className="text-gray-400">
                    Smartly categorize and forecast your spending, helping you stay on track towards your financial goals.
                  </p>
                </div>
                {/* Feature Card 2 */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-8 border border-gray-800 hover:border-purple-500/50 transition-all duration-300 group">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 w-14 h-14 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                    <Shield className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Smart Savings Goals</h3>
                  <p className="text-gray-400">
                    Set and track automated savings goals, with personalized advice to reach them faster.
                  </p>
                </div>
                {/* Feature Card 3 */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-8 border border-gray-800 hover:border-pink-500/50 transition-all duration-300 group">
                  <div className="bg-gradient-to-r from-pink-500 to-red-600 w-14 h-14 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Advanced Investment Insights</h3>
                  <p className="text-gray-400">
                    Understand market trends and get recommendations for your portfolio to maximize returns.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="py-20 md:py-28 bg-gray-950" id="how-it-works">
            <div className="container max-w-6xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-white mb-4">
                  How It Works
                </h2>
                <p className="text-xl text-gray-400">
                  A visual journey through FinWise's core financial intelligence tools.
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
                <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800 shadow-lg">
                  <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 text-lg">
                    Market Simulator Visual
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <div className="inline-flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-3xl font-semibold text-white">Risk-Free Market Simulator</h3>
                  </div>
                  <p className="text-gray-400 text-lg mb-6">
                    Test your trading strategies in a real-time, risk-free environment. Our advanced simulator provides real-time market data to help you build confidence.
                  </p>
                  <button className="text-blue-400 font-semibold group flex items-center hover:text-blue-300 transition-colors">
                    Start Simulating <ChevronRight className="ml-1 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="text-center md:text-left order-2 md:order-1">
                  <div className="inline-flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <Receipt className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-3xl font-semibold text-white">Smart Receipt Scanning</h3>
                  </div>
                  <p className="text-gray-400 text-lg mb-6">
                    Effortlessly track expenses. Snap pictures of your receipts, and our AI will categorize them, providing instant insights into your spending habits.
                  </p>
                  <button className="text-pink-400 font-semibold group flex items-center hover:text-pink-300 transition-colors">
                    Get Started <ChevronRight className="ml-1 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800 shadow-lg order-1 md:order-2">
                  <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 text-lg">
                    Receipt Scanning Visual
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-20 md:py-28 bg-gray-950" id="faq">
            <div className="container mx-auto px-6 max-w-4xl">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
                <p className="text-lg text-gray-400">Have questions? We've got answers.</p>
              </div>
              <div className="space-y-6">
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 hover:border-blue-500/50 transition-all duration-300 cursor-pointer">
                  <button className="flex justify-between items-center w-full text-left">
                    <h3 className="text-xl font-semibold text-white">Is FinWise secure?</h3>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </button>
                  <p className="text-gray-400 mt-2 hidden">
                    Yes, FinWise uses bank-level encryption and robust security protocols to protect your data. Your financial information is always safe and confidential with FinWise.
                  </p>
                </div>
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 hover:border-purple-500/50 transition-all duration-300 cursor-pointer">
                  <button className="flex justify-between items-center w-full text-left">
                    <h3 className="text-xl font-semibold text-white">What is the pricing?</h3>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </button>
                  <p className="text-gray-400 mt-2 hidden">
                    FinWise offers various subscription plans tailored to different needs, including a free tier for basic features and premium tiers for advanced analytics.
                  </p>
                </div>
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 hover:border-pink-500/50 transition-all duration-300 cursor-pointer">
                  <button className="flex justify-between items-center w-full text-left">
                    <h3 className="text-xl font-semibold text-white">How does FinWise help with investments?</h3>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </button>
                  <p className="text-gray-400 mt-2 hidden">
                    Our AI-powered insights provide personalized recommendations and market analysis to help you make informed investment decisions and optimize your portfolio.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action Section */}
          <section className="py-20 md:py-28 bg-gradient-to-r from-gray-800 to-purple-900">
            <div className="container mx-auto px-6 text-center">
              <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Financial Future?</h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10">
                Join thousands of users who are taking control of their finances with FinWise.
              </p>
              <button onClick={() => setCurrentView('signup')} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-10 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
                Get Started Today
              </button>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-gray-950 py-12">
            <div className="container mx-auto px-6 grid md:grid-cols-4 gap-8 text-gray-400">
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 bg-clip-text text-transparent mb-4">
                  FinWise
                </h3>
                <p className="text-sm mb-4">Smart financial management, for everyone.</p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4">Product</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4">Company</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                </ul>
              </div>
            </div>
            <div className="text-center text-gray-500 text-sm mt-12">
              © 2024 FinWise. All rights reserved.
            </div>
          </footer>
        </div>
      </div>
    );
  }

  // Login Page
  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 font-sans">
        <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-[800px] h-[800px] bg-gradient-to-tr from-blue-900/40 via-purple-900/30 to-pink-900/20 rounded-full blur-3xl opacity-50"></div>
        <div className="relative w-full max-w-md mx-auto">
          <button onClick={() => setCurrentView('home')} className="flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-200 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
          </button>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 shadow-lg">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 bg-clip-text text-transparent mb-4">FinWise</h1>
              <h2 className="text-2xl font-semibold text-white mb-2">Welcome Back</h2>
              <p className="text-gray-400">Sign in to continue your financial journey</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <input type="email" name="email" id="email" value={loginForm.email} onChange={handleLoginInputChange} className="w-full bg-gray-800/50 text-white placeholder-gray-500 px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="you@example.com" required />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} name="password" id="password" value={loginForm.password} onChange={handleLoginInputChange} className="w-full bg-gray-800/50 text-white placeholder-gray-500 px-4 py-3 pr-12 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Enter your password" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors duration-200">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center">
                Sign In <ChevronRight className="ml-2 h-5 w-5" />
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-700"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-900/50 px-2 text-gray-400 backdrop-blur-sm">Or continue with</span>
              </div>
            </div>
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg">
              Sign in with Google
            </button>
            
            <div className="mt-6 text-center">
              <p className="text-gray-400">Don't have an account? <button onClick={() => setCurrentView('signup')} className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-semibold">Sign up</button></p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sign Up Page
  if (currentView === 'signup') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12 font-sans">
        <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-[800px] h-[800px] bg-gradient-to-tr from-blue-900/40 via-purple-900/30 to-pink-900/20 rounded-full blur-3xl opacity-50"></div>
        <div className="relative w-full max-w-md mx-auto">
          <button onClick={() => setCurrentView('home')} className="flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-200 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
          </button>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 shadow-lg">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 bg-clip-text text-transparent mb-4">FinWise</h1>
              <h2 className="text-2xl font-semibold text-white mb-2">Create your Account</h2>
              <p className="text-gray-400">Start your financial journey today.</p>
            </div>
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <input type="text" name="name" id="name" value={signupForm.name} onChange={handleSignupInputChange} className="w-full bg-gray-800/50 text-white placeholder-gray-500 px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Enter your full name" required />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <input type="email" name="email" id="email" value={signupForm.email} onChange={handleSignupInputChange} className="w-full bg-gray-800/50 text-white placeholder-gray-500 px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="you@example.com" required />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} name="password" id="password" value={signupForm.password} onChange={handleSignupInputChange} className="w-full bg-gray-800/50 text-white placeholder-gray-500 px-4 py-3 pr-12 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Create a strong password" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors duration-200">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                <input type="password" name="confirmPassword" id="confirmPassword" value={signupForm.confirmPassword} onChange={handleSignupInputChange} className="w-full bg-gray-800/50 text-white placeholder-gray-500 px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Confirm your password" required />
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 mt-2 shadow-lg flex items-center justify-center">
                Create Account <ChevronRight className="ml-2 h-5 w-5" />
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-700"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-900/50 px-2 text-gray-400 backdrop-blur-sm">Or sign up with</span>
              </div>
            </div>
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg">
              Sign up with Google
            </button>
            
            <div className="mt-6 text-center">
              <p className="text-gray-400">Already have an account? <button onClick={() => setCurrentView('login')} className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-semibold">Sign in</button></p>
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