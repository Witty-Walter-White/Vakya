import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useGoogleLogin } from '@react-oauth/google';
import logoImg from '../images/logo.png';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useApp();
  const redirectFrom = location.state?.from as string | undefined;
  const redirectFile = location.state?.file as File | undefined;

  const goToDestination = () => {
    if (redirectFrom) {
      navigate(redirectFrom, { state: redirectFile ? { file: redirectFile } : undefined, replace: true });
    } else {
      navigate('/app');
    }
  };
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await res.json();

        login({
          id: `google_${userInfo.sub}`,
          name: userInfo.name || 'User',
          email: userInfo.email,
          plan: 'free',
          photo: userInfo.picture,
        });
        goToDestination();
      } catch (err) {
        console.error('Failed to fetch Google user info', err);
        setError('Google login failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setError('Google Login failed.');
    }
  });

  const handleGoogleLogin = () => {
    googleLogin();
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    if (isSignUp && !name) { setError('Please enter your name.'); return; }
    setIsLoading(true);

    
    setTimeout(() => {
      login({
        id: 'email_' + Date.now(),
        name: isSignUp ? name : (email.split('@')[0] || 'User'),
        email,
        plan: 'free',
      });
      goToDestination();
      setIsLoading(false);
    }, 800);
  };

  const features = [
    'AI-powered clause risk scoring',
    'MSME compliance checks for Indian law',
    'Instant negotiation suggestions',
    'Export redlined DOCX reports',
  ];

  return (
    <div className="login-page">
      
      <div className="login-left">
        <div className="login-brand" onClick={() => navigate('/')}>
          <img src={logoImg} alt="Vakya" className="login-brand-logo" />
        </div>

        <div className="login-left-content">
          <div className="login-badge">AI Legal Intelligence</div>
          <h1 className="login-headline">
            Protect your business.<br />
            <span className="login-headline-accent">Understand every clause.</span>
          </h1>
          <p className="login-subline">
            Vakya analyses your contracts in minutes and flags risks before you sign built specifically for Indian MSMEs.
          </p>

          <ul className="login-features">
            {features.map((f, i) => (
              <li key={i} className="login-feature-item">
                <CheckCircle2 size={16} className="login-feature-icon" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      
      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <h2 className="login-card-title">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="login-card-sub">
              {isSignUp ? 'Start analysing contracts for free.' : 'Sign in to continue to Vakya.'}
            </p>
          </div>

          
          <button
            className="google-btn"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            type="button"
            id="google-signin-btn"
          >
            <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {isLoading ? 'Signing in...' : 'Continue with Google'}
          </button>

          
          <div className="login-divider">
            <span className="login-divider-line" />
            <span className="login-divider-text">or</span>
            <span className="login-divider-line" />
          </div>

          
          <form className="login-form" onSubmit={handleEmailSubmit}>
            {isSignUp && (
              <div className="login-field">
                <label className="login-label">Full Name</label>
                <input
                  id="login-name"
                  type="text"
                  className="login-input"
                  placeholder="Your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            )}

            <div className="login-field">
              <label className="login-label">Email address</label>
              <div className="login-input-wrapper">
                <Mail size={15} className="login-input-icon" />
                <input
                  id="login-email"
                  type="email"
                  className="login-input has-icon"
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="login-field">
              <label className="login-label">Password</label>
              <div className="login-input-wrapper">
                <Lock size={15} className="login-input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="login-input has-icon has-trail"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPassword(p => !p)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {!isSignUp && (
              <div className="login-forgot-row">
                <button type="button" className="login-forgot-btn">Forgot password?</button>
              </div>
            )}

            {error && <p className="login-error">{error}</p>}

            <button
              id="login-submit-btn"
              type="submit"
              className="login-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
              {!isLoading && <ArrowRight size={15} />}
            </button>
          </form>

          
          <p className="login-switch">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              className="login-switch-btn"
              onClick={() => { setIsSignUp(s => !s); setError(''); }}
            >
              {isSignUp ? 'Sign in' : 'Sign up free'}
            </button>
          </p>

          <p className="login-terms">
            By continuing, you agree to our{' '}
            <Link to="/" className="login-link">Terms of Service</Link>{' '}
            and{' '}
            <Link to="/" className="login-link">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
