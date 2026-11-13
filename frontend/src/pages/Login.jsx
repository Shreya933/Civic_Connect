// frontend/src/pages/Login.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Users,
  Shield,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  KeyRound,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROLES, ROLE_DASHBOARDS, DEMO_CREDENTIALS } from '../utils/constants';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginCitizen, loginStaff, verifyStaffOtp, isAuthenticated, role } = useAuth();

  // If already authenticated, redirect to role dashboard
  useEffect(() => {
    if (isAuthenticated && role) {
      const destination = ROLE_DASHBOARDS[role] || '/';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  // Determine initial tab from navigation state
  const initialRole = location.state?.preselectedRole;
  const [authType, setAuthType] = useState(
    initialRole && initialRole !== ROLES.CITIZEN ? 'staff' : 'citizen'
  );

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // OTP Verification view state
  const [otpStage, setOtpStage] = useState(false);
  const [pendingStaffData, setPendingStaffData] = useState(null);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const otpInputRefs = useRef([]);

  // Timer countdown for OTP resend
  useEffect(() => {
    let interval = null;
    if (otpStage && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [otpStage, resendTimer]);

  // Fill demo account credentials with one click
  const handleSelectDemoAccount = (demo) => {
    setEmail(demo.email);
    setPassword(demo.password);
    setAuthType(demo.role === ROLES.CITIZEN ? 'citizen' : 'staff');
    setErrorMsg(null);
  };

  // Handle Form Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    setLoading(true);

    try {
      if (authType === 'citizen') {
        await loginCitizen({ email, password });
        navigate('/citizen/dashboard');
      } else {
        // Staff Login: Step 1 (Trigger OTP)
        const staffRes = await loginStaff({ email, password });
        setPendingStaffData(staffRes);
        setOtpStage(true);
        setResendTimer(60);
        setCanResend(false);

        // Auto-focus first OTP box
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 100);
      }
    } catch (err) {
      setErrorMsg(
        typeof err === 'string'
          ? err
          : err.message || 'Authentication failed. Please check credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP input typing & auto-focus
  const handleOtpChange = (index, val) => {
    if (!/^\d*$/.test(val)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = val.slice(-1);
    setOtpDigits(newDigits);

    // Auto advance
    if (val && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Submit OTP Verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit OTP code.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await verifyStaffOtp(pendingStaffData?.user_id, fullOtp, email);
      const destination = ROLE_DASHBOARDS[res.role] || '/';
      navigate(destination);
    } catch (err) {
      setErrorMsg(typeof err === 'string' ? err : err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    setResendTimer(60);
    setCanResend(false);
    setErrorMsg(null);
    try {
      const newStaffRes = await loginStaff({ email, password });
      setPendingStaffData(newStaffRes);
      setOtpDigits(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } catch (err) {
      setErrorMsg('Failed to resend OTP.');
    }
  };

  const handleAutoFillDevOtp = () => {
    const code = pendingStaffData?.devOtp || '123456';
    const digits = String(code).split('').slice(0, 6);
    setOtpDigits(digits);
  };

  return (
    <div className="auth-page">
      <div className="auth-split-layout">
        {/* Left Branding Showcase Panel */}
        <div className="auth-branding-panel">
          <Link to="/" className="auth-brand-logo">
            <div className="auth-brand-logo-icon">
              <Building2 size={24} />
            </div>
            <div>
              <span className="auth-brand-name">CIVIC CONNECT</span>
              <span className="auth-brand-tagline">AI Civic Governance Platform</span>
            </div>
          </Link>

          <div className="auth-hero-content">
            <div className="auth-hero-pill">
              <Sparkles size={14} />
              <span>Multi-Tier Municipal Governance</span>
            </div>
            <h2 className="auth-hero-title">
              Empowering Citizens, Elevating Cities.
            </h2>
            <p className="auth-hero-desc">
              Report public infrastructure issues, monitor algorithmic SLA resolution, and facilitate accountable civic administration through computer vision and GPS tracking.
            </p>

            {/* Quick Demo Credentials Widget */}
            <div className="demo-credentials-card" style={{ marginTop: '2rem', padding: '1.25rem', background: 'rgba(255, 255, 255, 0.08)', borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ⚡ Quick Demo Accounts
                </span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Click to auto-fill</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                {DEMO_CREDENTIALS.map((demo) => (
                  <button
                    key={demo.role}
                    type="button"
                    onClick={() => handleSelectDemoAccount(demo)}
                    style={{
                      background: email === demo.email ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      border: email === demo.email ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      borderRadius: 8,
                      padding: '0.5rem 0.65rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: demo.color }}></span>
                      {demo.roleLabel}
                    </div>
                    <div style={{ fontSize: '0.675rem', color: '#94a3b8', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {demo.email}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="auth-branding-footer">
            <span>&copy; 2026 Smart Municipal Platform. Secured with JWT & 2FA OTP.</span>
          </div>
        </div>

        {/* Right Form Card Panel */}
        <div className="auth-form-panel">
          <div className="auth-card">
            <div className="auth-card-header">
              <h2 className="auth-card-title">
                {otpStage ? 'Two-Factor Authentication' : 'Welcome to Civic Connect'}
              </h2>
              <p className="auth-card-subtitle">
                {otpStage
                  ? `Enter the 6-digit verification code sent for ${email}`
                  : 'Select your account type to access the civic portal'}
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="auth-error-alert" role="alert">
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {!otpStage ? (
              /* Step 1: Login Form (Citizen vs Staff) */
              <div>
                {/* Role Switcher Tabs */}
                <div className="auth-type-tabs">
                  <button
                    type="button"
                    className={`auth-type-tab ${authType === 'citizen' ? 'active' : ''}`}
                    onClick={() => {
                      setAuthType('citizen');
                      setErrorMsg(null);
                    }}
                  >
                    <Users size={16} />
                    <span>Citizen Portal</span>
                  </button>
                  <button
                    type="button"
                    className={`auth-type-tab ${authType === 'staff' ? 'active' : ''}`}
                    onClick={() => {
                      setAuthType('staff');
                      setErrorMsg(null);
                    }}
                  >
                    <Shield size={16} />
                    <span>Municipal Staff</span>
                  </button>
                </div>

                {authType === 'staff' && (
                  <div className="auth-notice-box">
                    <Shield size={16} style={{ flexShrink: 0, marginTop: 2, color: 'var(--primary)' }} />
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-700)' }}>
                      <strong>Municipal Staff & Authority Portal:</strong>
                      <div>
                        Covers Municipal Admins, Higher Authorities, and System Admins. Requires 2FA OTP verification code.
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit}>
                  {/* Email */}
                  <div className="form-group">
                    <label className="form-label">
                      Email Address <span className="required">*</span>
                    </label>
                    <div className="form-input-wrapper">
                      <Mail size={16} className="form-input-icon" />
                      <input
                        type="email"
                        className="form-input form-input-with-icon"
                        placeholder={authType === 'citizen' ? 'citizen@civic.test' : 'admin@civic.test'}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="form-group">
                    <label className="form-label">
                      Password <span className="required">*</span>
                    </label>
                    <div className="form-input-wrapper">
                      <Lock size={16} className="form-input-icon" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-input form-input-with-icon"
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Meta row: Remember me & Forgot Password */}
                  <div className="form-meta-row">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <span>Remember me</span>
                    </label>

                    <button
                      type="button"
                      className="forgot-password-link"
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.85rem' }}
                    disabled={loading}
                  >
                    {loading ? (
                      <span>Signing in...</span>
                    ) : (
                      <>
                        <span>{authType === 'staff' ? 'Continue to OTP Verification' : 'Sign In'}</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>

                {/* Footer Link */}
                <div className="auth-footer">
                  {authType === 'citizen' ? (
                    <span>
                      Don't have a citizen account?{' '}
                      <Link to="/register">Register here</Link>
                    </span>
                  ) : (
                    <span>
                      Need official staff credentials?{' '}
                      <Link to="/register" state={{ tab: 'staff' }}>
                        Register for Staff Review
                      </Link>
                    </span>
                  )}
                </div>
              </div>
            ) : (
              /* Step 2: OTP Verification Form */
              <form onSubmit={handleVerifyOtp}>
                {/* Dev Mode OTP Banner with 1-Click Auto-Fill */}
                <div
                  className="auth-notice-box"
                  style={{
                    backgroundColor: '#f0fdf4',
                    borderColor: '#bbf7d0',
                    color: '#15803d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <KeyRound size={18} style={{ flexShrink: 0, color: '#16a34a' }} />
                    <div style={{ fontSize: '0.825rem' }}>
                      <strong>Dev OTP:</strong>{' '}
                      <code style={{ fontSize: '0.95rem', fontWeight: 800, padding: '2px 6px', background: '#dcfce7', borderRadius: 4 }}>
                        {pendingStaffData?.devOtp || '123456'}
                      </code>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-success"
                    style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', fontWeight: 700 }}
                    onClick={handleAutoFillDevOtp}
                  >
                    Auto-Fill
                  </button>
                </div>

                <div className="otp-container" style={{ margin: '1.75rem 0' }}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="otp-digit-input"
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>

                <div className="otp-resend-row" style={{ marginBottom: '1.5rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                    <Clock size={14} />
                    {canResend ? 'Did not receive code?' : `Resend in ${resendTimer}s`}
                  </span>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={!canResend}
                    onClick={handleResendOtp}
                  >
                    Resend Code
                  </button>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem', marginBottom: '0.75rem' }}
                  disabled={loading}
                >
                  {loading ? 'Verifying Security Token...' : 'Verify & Enter Dashboard'}
                </button>

                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ width: '100%' }}
                  onClick={() => {
                    setOtpStage(false);
                    setErrorMsg(null);
                  }}
                >
                  Back to Login
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="modal-overlay" onClick={() => setShowForgotPassword(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="card-title">Password Recovery</h3>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setShowForgotPassword(false)}
              >
                &times;
              </button>
            </div>
            <div className="card-body">
              <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', marginBottom: '1.25rem' }}>
                Enter your registered official or personal email address. A secure one-time reset link will be dispatched.
              </p>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="citizen@civic.test"
                  defaultValue={email}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowForgotPassword(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setShowForgotPassword(false);
                  alert('If this email is registered, password recovery instructions have been sent.');
                }}
              >
                Send Reset Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
