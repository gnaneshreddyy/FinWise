import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronRight, TrendingUp, Eye, EyeOff, ArrowLeft, Receipt, CalendarRange, MessageSquareText } from 'lucide-react';
import { loginWithEmail, loginWithGoogle, signupWithEmail } from '../services/authService';

const LANDING_FEATURES = [
  {
    icon: Receipt,
    title: 'Log in seconds',
    body: 'Add income and spending with a category, date and note. Everything is stored against your account.',
  },
  {
    icon: CalendarRange,
    title: 'Monthly statements',
    body: 'Opening and closing balance, money in, money out and a category split for every month.',
  },
  {
    icon: MessageSquareText,
    title: 'Ask about your money',
    body: 'An assistant that reads your own transactions, so answers are about your numbers, not generic tips.',
  },
  {
    icon: TrendingUp,
    title: 'Practice investing',
    body: 'A paper-trading simulator with ₹1,00,000 of virtual cash. Nothing real is ever bought or sold.',
  },
];

const LANDING_FAQ = [
  {
    q: 'Do I need to connect my bank?',
    a: 'No. FinWise never asks for bank credentials. You add transactions yourself.',
  },
  {
    q: 'Who can see my transactions?',
    a: 'Only you. Transactions live under your account and database rules block every other user from reading them.',
  },
  {
    q: 'Is the assistant giving financial advice?',
    a: 'No. It explains patterns in the data you entered. Talk to a registered advisor before making investment decisions.',
  },
];

const PREVIEW_SPLIT = [
  { label: 'Food & dining', amount: 7420, share: 41 },
  { label: 'Transport', amount: 3980, share: 22 },
  { label: 'Bills', amount: 3610, share: 20 },
  { label: 'Shopping', amount: 3230, share: 17 },
];

// Static illustration of the monthly statement screen, built from the same tokens as the app.
function StatementPreview() {
  return (
    <div className="rounded-xl border border-line bg-surface p-6" aria-hidden="true">
      <div className="mb-6 flex items-baseline justify-between">
        <p className="text-sm text-ink-muted">October statement</p>
        <p className="text-xs text-ink-subtle">Sample data</p>
      </div>
      <div className="mb-6 grid grid-cols-3 gap-4 border-b border-line pb-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-ink-subtle">In</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-gain">₹42,000</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-ink-subtle">Out</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-loss">₹18,240</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-ink-subtle">Saved</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-ink">57%</p>
        </div>
      </div>
      <div className="space-y-4">
        {PREVIEW_SPLIT.map((row) => (
          <div key={row.label}>
            <div className="mb-1.5 flex justify-between text-sm">
              <span className="text-ink-muted">{row.label}</span>
              <span className="tabular-nums text-ink">₹{row.amount.toLocaleString('en-IN')}</span>
            </div>
            <div className="h-1.5 rounded-full bg-raised">
              <div className="h-1.5 rounded-full bg-accent" style={{ width: `${row.share}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const Home = ({ hideHeader = false, onNavigate }) => {
  const [currentView, setCurrentView] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');

    try {
      await loginWithEmail(loginForm.email, loginForm.password);
    } catch (error) {
      console.error("Email sign-in error:", error);
      setAuthError(error.message || 'Could not sign in. Please check your email and password.');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (signupForm.password !== signupForm.confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    try {
      await signupWithEmail({
        name: signupForm.name,
        email: signupForm.email,
        password: signupForm.password,
      });
    } catch (error) {
      console.error("Email signup error:", error);
      setAuthError(error.message || 'Could not create your account. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    try {
      const result = await loginWithGoogle();
      const user = result.user;
      console.log("Successfully signed in with Google:", user.displayName);
      // The onAuthStateChanged listener in App.jsx will automatically handle
      // switching the view to the dashboard upon successful login.
    } catch (error) {
      console.error("Google sign-in error:", error.message);
      setAuthError(error.message || 'Could not sign in with Google.');
    }
  };

  const handleLoginInputChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleSignupInputChange = (e) => {
    setSignupForm({ ...signupForm, [e.target.name]: e.target.value });
  };

  const openPaperTrading = () => {
    if (onNavigate) {
      onNavigate('papertrading');
      return;
    }

    setCurrentView('login');
  };

  // --- VIEWS ---

  if (currentView === 'home') {
    return (
      <div className="min-h-screen bg-canvas text-ink font-sans">
        {!hideHeader && (
          <nav className={`fixed top-0 w-full z-50 border-b transition-colors ${
            scrolled
              ? 'border-line/80 bg-canvas/90 backdrop-blur-xl'
              : 'border-transparent bg-canvas/35 backdrop-blur-sm'
          }`}>
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
              <div className="text-2xl font-bold text-ink tracking-tight">
                FinWise
              </div>
              <div className="hidden items-center gap-1 rounded-xl border border-line bg-surface/70 p-1 md:flex">
                <a href="#features" className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:bg-raised hover:text-ink">Features</a>
                <a href="#faq" className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:bg-raised hover:text-ink">FAQ</a>
              </div>
              <div className="hidden items-center gap-3 md:flex">
                <button onClick={() => setCurrentView('login')} className="rounded-lg border border-line-strong px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-raised hover:text-ink">
                  Login
                </button>
                <button onClick={() => setCurrentView('signup')} className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-hover">
                  Get Started
                </button>
              </div>
              <div className="md:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-ink focus:outline-none">
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
            {isMenuOpen && (
              <div className="md:hidden border-t border-line bg-canvas/95 px-4 pb-4 pt-3 backdrop-blur-xl">
                <div className="flex flex-col gap-2">
                  <a href="#features" onClick={() => setIsMenuOpen(false)} className="rounded-lg px-3 py-2 text-ink-muted hover:bg-raised hover:text-ink">Features</a>
                  <a href="#faq" onClick={() => setIsMenuOpen(false)} className="rounded-lg px-3 py-2 text-ink-muted hover:bg-raised hover:text-ink">FAQ</a>
                  <button onClick={() => { setCurrentView('login'); setIsMenuOpen(false); }} className="rounded-lg px-3 py-2 text-left text-ink-muted hover:bg-raised hover:text-ink">
                    Login
                  </button>
                  <button onClick={() => { setCurrentView('signup'); setIsMenuOpen(false); }} className="rounded-lg bg-accent px-3 py-2 text-left font-medium text-accent-ink hover:bg-accent-hover">
                    Get Started
                  </button>
                </div>
              </div>
            )}
          </nav>
        )}

        <main>
          {/* Hero */}
          <section className="border-b border-line pt-32 pb-20 md:pt-40 md:pb-28">
            <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 md:grid-cols-2">
              <div>
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-accent">Personal finance, without the guesswork</p>
                <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-ink lg:text-6xl">
                  Know where your money went, and where it&apos;s going.
                </h1>
                <p className="mb-10 max-w-xl text-lg text-ink-muted">
                  Log what you earn and spend. FinWise turns it into monthly statements, spending patterns and an assistant that answers questions about your own numbers.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button onClick={() => setCurrentView('signup')} className="flex items-center justify-center rounded-lg bg-accent px-6 py-3 font-semibold text-accent-ink transition-colors hover:bg-accent-hover">
                    Get started <ChevronRight className="ml-1 h-5 w-5" />
                  </button>
                  <button onClick={openPaperTrading} className="flex items-center justify-center rounded-lg border border-line-strong px-6 py-3 font-semibold text-ink transition-colors hover:bg-raised">
                    Try the market simulator
                  </button>
                </div>
              </div>

              <StatementPreview />
            </div>
          </section>

          {/* Features */}
          <section className="py-20 md:py-28" id="features">
            <div className="mx-auto max-w-6xl px-6">
              <h2 className="mb-3 text-3xl font-semibold tracking-tight text-ink">What it does today</h2>
              <p className="mb-12 max-w-2xl text-ink-muted">No bank linking. You stay in control of what goes in.</p>
              <div className="grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-2 lg:grid-cols-4">
                {LANDING_FEATURES.map(({ icon: Icon, title, body }) => (
                  <div key={title} className="bg-surface p-6">
                    <Icon className="mb-5 h-5 w-5 text-accent" />
                    <h3 className="mb-2 font-semibold text-ink">{title}</h3>
                    <p className="text-sm leading-relaxed text-ink-muted">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="border-t border-line py-20 md:py-28" id="faq">
            <div className="mx-auto max-w-3xl px-6">
              <h2 className="mb-10 text-3xl font-semibold tracking-tight text-ink">Questions</h2>
              <div className="divide-y divide-line border-y border-line">
                {LANDING_FAQ.map(({ q, a }) => (
                  <details key={q} className="group py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-ink">
                      {q}
                      <ChevronRight className="h-5 w-5 text-ink-subtle transition-transform group-open:rotate-90" />
                    </summary>
                    <p className="mt-3 text-ink-muted">{a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          <footer className="border-t border-line py-10">
            <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 text-sm text-ink-subtle sm:flex-row sm:justify-between">
              <span className="font-semibold text-ink-muted">FinWise</span>
              <span>Educational tool. Not financial advice.</span>
            </div>
          </footer>
        </main>
      </div>
    );
  }

  // Login Page
  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center px-4 font-sans">
        <div className="relative w-full max-w-md mx-auto">
          <button onClick={() => setCurrentView('home')} className="flex items-center text-accent hover:text-accent-hover transition-colors mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
          </button>
          <div className="bg-surface rounded-xl p-8 border border-line">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-ink tracking-tight mb-4">FinWise</h1>
              <h2 className="text-2xl font-semibold text-ink mb-2">Welcome Back</h2>
              <p className="text-ink-muted">Sign in to continue your financial journey</p>
            </div>
            {authError && (
              <div className="mb-4 rounded-lg border border-loss/40 bg-loss/10 px-4 py-3 text-sm text-loss">
                {authError}
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-ink-muted mb-2">Email Address</label>
                <input type="email" name="email" id="email" value={loginForm.email} onChange={handleLoginInputChange} className="w-full bg-raised text-ink placeholder-ink-subtle px-4 py-3 rounded-lg border border-line-strong focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors" placeholder="you@example.com" required />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-ink-muted mb-2">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} name="password" id="password" value={loginForm.password} onChange={handleLoginInputChange} className="w-full bg-raised text-ink placeholder-ink-subtle px-4 py-3 pr-12 rounded-lg border border-line-strong focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors" placeholder="Enter your password" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ink-muted hover:text-accent-hover transition-colors">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <button type="submit" className="w-full bg-accent hover:bg-accent-hover text-accent-ink font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center">
                Sign In <ChevronRight className="ml-2 h-5 w-5" />
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-line-strong"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="bg-surface/50 px-2 text-ink-muted backdrop-blur-sm">Or continue with</span>
              </div>
            </div>
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2 bg-raised hover:bg-line text-ink font-semibold py-3 px-4 rounded-lg transition-colors">
              Sign in with Google
            </button>
            
            <div className="mt-6 text-center">
              <p className="text-ink-muted">Don't have an account? <button onClick={() => setCurrentView('signup')} className="text-accent hover:text-accent-hover transition-colors font-semibold">Sign up</button></p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sign Up Page
  if (currentView === 'signup') {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center px-4 py-12 font-sans">
        <div className="relative w-full max-w-md mx-auto">
          <button onClick={() => setCurrentView('home')} className="flex items-center text-accent hover:text-accent-hover transition-colors mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
          </button>
          <div className="bg-surface rounded-xl p-8 border border-line">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-ink tracking-tight mb-4">FinWise</h1>
              <h2 className="text-2xl font-semibold text-ink mb-2">Create your Account</h2>
              <p className="text-ink-muted">Start your financial journey today.</p>
            </div>
            {authError && (
              <div className="mb-4 rounded-lg border border-loss/40 bg-loss/10 px-4 py-3 text-sm text-loss">
                {authError}
              </div>
            )}
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-ink-muted mb-2">Full Name</label>
                <input type="text" name="name" id="name" value={signupForm.name} onChange={handleSignupInputChange} className="w-full bg-raised text-ink placeholder-ink-subtle px-4 py-3 rounded-lg border border-line-strong focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors" placeholder="Enter your full name" required />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-ink-muted mb-2">Email Address</label>
                <input type="email" name="email" id="email" value={signupForm.email} onChange={handleSignupInputChange} className="w-full bg-raised text-ink placeholder-ink-subtle px-4 py-3 rounded-lg border border-line-strong focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors" placeholder="you@example.com" required />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-ink-muted mb-2">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} name="password" id="password" value={signupForm.password} onChange={handleSignupInputChange} className="w-full bg-raised text-ink placeholder-ink-subtle px-4 py-3 pr-12 rounded-lg border border-line-strong focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors" placeholder="Create a strong password" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ink-muted hover:text-accent-hover transition-colors">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink-muted mb-2">Confirm Password</label>
                <input type="password" name="confirmPassword" id="confirmPassword" value={signupForm.confirmPassword} onChange={handleSignupInputChange} className="w-full bg-raised text-ink placeholder-ink-subtle px-4 py-3 rounded-lg border border-line-strong focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors" placeholder="Confirm your password" required />
              </div>
              <button type="submit" className="w-full bg-accent hover:bg-accent-hover text-accent-ink font-semibold py-3 px-4 rounded-lg transition-colors mt-2 flex items-center justify-center">
                Create Account <ChevronRight className="ml-2 h-5 w-5" />
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-line-strong"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="bg-surface/50 px-2 text-ink-muted backdrop-blur-sm">Or sign up with</span>
              </div>
            </div>
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2 bg-raised hover:bg-line text-ink font-semibold py-3 px-4 rounded-lg transition-colors">
              Sign up with Google
            </button>
            
            <div className="mt-6 text-center">
              <p className="text-ink-muted">Already have an account? <button onClick={() => setCurrentView('login')} className="text-accent hover:text-accent-hover transition-colors font-semibold">Sign in</button></p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Home;
