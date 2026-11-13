// frontend/src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Building2,
  Users,
  Shield,
  Mail,
  Lock,
  Phone,
  User,
  MapPin,
  Briefcase,
  Building,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DEPARTMENTS } from '../utils/constants';

export const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { registerCitizen, registerStaff } = useAuth();

  const [regType, setRegType] = useState(
    location.state?.tab === 'staff' ? 'staff' : 'citizen'
  );

  // Common & Citizen Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Staff Fields
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0].name);
  const [jurisdiction, setJurisdiction] = useState('');
  const [requestedRole, setRequestedRole] = useState('ADMIN'); // 'ADMIN' or 'HIGHER_AUTHORITY'

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validation
    if (!fullName.trim() || !email.trim() || !mobile.trim() || !password) {
      setErrorMsg('Please fill in all mandatory fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      if (regType === 'citizen') {
        await registerCitizen({
          full_name: fullName.trim(),
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          mobile: mobile.trim(),
          password,
          address: address.trim(),
        });
        setSuccessMsg('Account created successfully! Redirecting to sign in...');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        // Staff Registration
        if (!designation.trim() || !jurisdiction.trim()) {
          setErrorMsg('Official designation and municipal jurisdiction are required.');
          setLoading(false);
          return;
        }

        await registerStaff({
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          mobile: mobile.trim(),
          designation: designation.trim(),
          department,
          jurisdiction: jurisdiction.trim(),
          requested_role: requestedRole,
          password,
        });

        setSuccessMsg(
          'Staff request submitted! Your account is pending System Administrator approval before you can sign in.'
        );
        setTimeout(() => navigate('/login', { state: { preselectedRole: requestedRole } }), 2500);
      }
    } catch (err) {
      setErrorMsg(typeof err === 'string' ? err : err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-split-layout">
        {/* Left Branding */}
        <div className="auth-branding-panel">
          <Link to="/" className="auth-brand-logo">
            <div className="auth-brand-logo-icon">
              <Building2 size={24} />
            </div>
            <span>CIVIC CONNECT</span>
          </Link>

          <div className="auth-hero-content">
            <h2 className="auth-hero-title">
              Join the Public Civic Governance Network.
            </h2>
            <p className="auth-hero-desc">
              Whether you are an active citizen or a dedicated municipal staff officer, Civic Connect brings speed, transparency, and accountability to municipal services.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature-item">
                <CheckCircle2 size={18} className="auth-feature-icon" />
                <span>Immediate photo-based reporting of potholes, waste, and lighting defects.</span>
              </div>
              <div className="auth-feature-item">
                <CheckCircle2 size={18} className="auth-feature-icon" />
                <span>Direct departmental work order assignment and SLA tracking.</span>
              </div>
              <div className="auth-feature-item">
                <CheckCircle2 size={18} className="auth-feature-icon" />
                <span>System Administrator role vetting ensures high security compliance.</span>
              </div>
            </div>
          </div>

          <div className="auth-panel-footer">
            Municipal Corporation Information Technology Division &copy; 2026.
          </div>
        </div>

        {/* Right Form */}
        <div className="auth-form-panel">
          <div className="auth-card" style={{ maxWidth: 540 }}>
            <div className="auth-card-header">
              <h1 className="auth-title">Create an Account</h1>
              <p className="auth-subtitle">
                Select your account type to continue registration
              </p>
            </div>

            {/* Role Tabs */}
            <div className="auth-role-tabs">
              <button
                type="button"
                className={`auth-role-tab ${regType === 'citizen' ? 'active' : ''}`}
                onClick={() => {
                  setRegType('citizen');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
              >
                <Users size={15} />
                <span>Citizen Account</span>
              </button>
              <button
                type="button"
                className={`auth-role-tab ${regType === 'staff' ? 'active' : ''}`}
                onClick={() => {
                  setRegType('staff');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
              >
                <Shield size={15} />
                <span>Municipal Staff</span>
              </button>
            </div>

            {/* Alerts */}
            {errorMsg && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 'var(--radius-md)',
                  color: '#b91c1c',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1.25rem',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 'var(--radius-md)',
                  color: '#15803d',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1.25rem',
                }}
              >
                <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                <span>{successMsg}</span>
              </div>
            )}

            {regType === 'staff' && (
              <div className="auth-notice-box">
                <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong>System Administrator Approval Required:</strong>
                  <div>
                    Staff accounts cannot sign in immediately. Your credentials and jurisdiction will be verified by the System Administrator before access is granted.
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="form-group">
                <label className="form-label">
                  {regType === 'citizen' ? 'Full Name' : 'Staff Officer Name'}{' '}
                  <span className="required">*</span>
                </label>
                <div className="form-input-wrapper">
                  <User size={16} className="form-input-icon" />
                  <input
                    type="text"
                    className="form-input form-input-with-icon"
                    placeholder="e.g. Rahul Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Email & Mobile in grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">
                    {regType === 'citizen' ? 'Email Address' : 'Official Email'}{' '}
                    <span className="required">*</span>
                  </label>
                  <div className="form-input-wrapper">
                    <Mail size={16} className="form-input-icon" />
                    <input
                      type="email"
                      className="form-input form-input-with-icon"
                      placeholder={regType === 'citizen' ? 'rahul@example.com' : 'officer@gov.in'}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Mobile Number <span className="required">*</span>
                  </label>
                  <div className="form-input-wrapper">
                    <Phone size={16} className="form-input-icon" />
                    <input
                      type="tel"
                      className="form-input form-input-with-icon"
                      placeholder="9876543210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Citizen specific: Residential Address */}
              {regType === 'citizen' && (
                <div className="form-group">
                  <label className="form-label">Residential Address</label>
                  <div className="form-input-wrapper">
                    <MapPin size={16} className="form-input-icon" />
                    <input
                      type="text"
                      className="form-input form-input-with-icon"
                      placeholder="Flat 204, Green Valley Apts, Sector 4"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Staff Specific Fields */}
              {regType === 'staff' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div className="form-group">
                      <label className="form-label">
                        Official Designation <span className="required">*</span>
                      </label>
                      <div className="form-input-wrapper">
                        <Briefcase size={16} className="form-input-icon" />
                        <input
                          type="text"
                          className="form-input form-input-with-icon"
                          placeholder="e.g. Assistant Engineer"
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Requested Role <span className="required">*</span>
                      </label>
                      <select
                        className="form-input"
                        value={requestedRole}
                        onChange={(e) => setRequestedRole(e.target.value)}
                      >
                        <option value="ADMIN">Municipal Admin</option>
                        <option value="HIGHER_AUTHORITY">Higher Authority</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department <span className="required">*</span></label>
                    <select
                      className="form-input"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept.id} value={dept.name}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Jurisdiction / Assigned Area <span className="required">*</span>
                    </label>
                    <div className="form-input-wrapper">
                      <MapPin size={16} className="form-input-icon" />
                      <input
                        type="text"
                        className="form-input form-input-with-icon"
                        placeholder="e.g. East Municipal Zone, Wards 45-60"
                        value={jurisdiction}
                        onChange={(e) => setJurisdiction(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Password & Confirm Password */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">
                    Password <span className="required">*</span>
                  </label>
                  <div className="form-input-wrapper">
                    <Lock size={16} className="form-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input form-input-with-icon"
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Confirm Password <span className="required">*</span>
                  </label>
                  <div className="form-input-wrapper">
                    <Lock size={16} className="form-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input form-input-with-icon"
                      placeholder="Re-type password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }}
                disabled={loading}
              >
                {loading ? (
                  <span>Processing Registration...</span>
                ) : (
                  <>
                    <span>
                      {regType === 'citizen'
                        ? 'Complete Citizen Registration'
                        : 'Submit Staff Access Request'}
                    </span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer">
              Already have an account? <Link to="/login">Sign In Here</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

