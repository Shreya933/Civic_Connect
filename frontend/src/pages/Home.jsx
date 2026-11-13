// frontend/src/pages/Home.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building,
  Building2,
  Camera,
  Cpu,
  MapPin,
  CheckCircle2,
  Users,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Sliders,
  Layers,
  Sparkles,
  PhoneCall,
  Mail,
  ChevronRight,
  Clock,
  Award,
  Calendar,
  AlertTriangle,
  Flame,
  Activity,
  FileCheck2,
  BarChart3,
  Compass,
} from 'lucide-react';
import { ISSUE_CATEGORIES, ROLES, DEMO_CREDENTIALS } from '../utils/constants';
import { useAuth } from '../context/AuthContext';

export const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role, switchDemoRole } = useAuth();

  const handleRoleCardClick = (targetRole) => {
    navigate('/login', { state: { preselectedRole: targetRole } });
  };

  const handleDirectDemoAccess = (targetRole) => {
    const dest = switchDemoRole(targetRole);
    navigate(dest);
  };

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', color: 'var(--slate-800)' }}>
      {/* 1. Header Navigation */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid var(--border-light)',
          padding: '0.85rem 2rem',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo & Branding */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #1e40af, #0d9488)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)',
              }}
            >
              <Building2 size={24} />
            </div>
            <div>
              <span
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: 'var(--navy-900)',
                  display: 'block',
                  lineHeight: 1.1,
                }}
              >
                CIVIC CONNECT
              </span>
              <span
                style={{
                  fontSize: '0.675rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                AI Civic Governance Platform
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2rem',
            }}
            className="home-nav-links d-none d-md-flex"
          >
            <a href="#features" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--slate-600)', textDecoration: 'none' }}>
              Features
            </a>
            <a href="#how-it-works" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--slate-600)', textDecoration: 'none' }}>
              How It Works
            </a>
            <a href="#roles" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--slate-600)', textDecoration: 'none' }}>
              Role Portals
            </a>
            <a href="#categories" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--slate-600)', textDecoration: 'none' }}>
              Civic Categories
            </a>
          </nav>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/login" className="btn btn-outline btn-sm">
              Sign In
            </Link>
            <Link to="/citizen/report" className="btn btn-primary btn-sm">
              Report Issue
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section
        style={{
          position: 'relative',
          padding: '6rem 2rem 5rem',
          background: 'radial-gradient(ellipse at top, #eff6ff 0%, #f8fafc 60%, #ffffff 100%)',
          overflow: 'hidden',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            textAlign: 'center',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1d4ed8',
              padding: '0.4rem 1.1rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.825rem',
              fontWeight: 700,
              marginBottom: '1.75rem',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.1)',
            }}
          >
            <Sparkles size={15} style={{ color: '#2563eb' }} />
            <span>AI-POWERED CIVIC COMPLAINT & RESOLUTION PLATFORM</span>
          </div>

          {/* Main Headline */}
          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5.2vw, 4rem)',
              fontWeight: 900,
              lineHeight: 1.15,
              color: 'var(--navy-900)',
              marginBottom: '1.5rem',
              letterSpacing: '-0.035em',
            }}
          >
            Report Civic Issues. Track Resolution. <br className="d-none d-md-inline" />
            <span style={{ background: 'linear-gradient(135deg, #1e40af, #0d9488)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Ensure Accountability.
            </span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
              color: 'var(--slate-600)',
              maxWidth: 780,
              margin: '0 auto 2.5rem',
              lineHeight: 1.65,
            }}
          >
            Bridging citizens and municipal administration with AI vision diagnostics, interactive GPS pinning, automated department work orders, and strict SLA overdue oversight.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <Link to="/citizen/report" className="btn btn-primary btn-lg" style={{ padding: '0.9rem 1.75rem', fontSize: '1rem' }}>
              <Camera size={20} />
              <span>Report a Complaint</span>
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg" style={{ padding: '0.9rem 1.75rem', fontSize: '1rem' }}>
              <span>Login to Portal</span>
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Quick Metrics Ticker */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              marginTop: '4.5rem',
              padding: '1.5rem',
              background: '#ffffff',
              borderRadius: 16,
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>&lt; 500ms</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600 }}>YOLO AI Categorization</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0d9488' }}>100%</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600 }}>GPS Geocoded Precision</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#4f46e5' }}>4 Roles</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600 }}>Segregated Access Control</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ea580c' }}>Audit Proof</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600 }}>Persistent Overdue History</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Feature Cards (6 Features) */}
      <section
        id="features"
        style={{
          padding: '5rem 2rem',
          maxWidth: 1280,
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Engineered for Transparency
          </span>
          <h2
            style={{
              fontSize: '2.25rem',
              fontWeight: 800,
              color: 'var(--navy-900)',
              marginTop: '0.5rem',
            }}
          >
            Core Capabilities of Civic Connect
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.75rem',
          }}
        >
          {/* Feature 1 */}
          <div className="card" style={{ padding: '2rem' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <Camera size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.65rem' }}>
              Photo-Based Complaint Reporting
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: 1.6 }}>
              Citizens capture live camera evidence or upload issue photos with instant browser-side preview, validation, and cloud storage via ImageKit.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="card" style={{ padding: '2rem' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: '#f0fdf4',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <MapPin size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.65rem' }}>
              GPS Location Detection
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: 1.6 }}>
              Interactive OpenStreetMap Leaflet integration allows 1-click GPS geolocation detection, draggable marker pinning, and reverse geocoding into city addresses.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="card" style={{ padding: '2rem' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: '#f5f3ff',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <Cpu size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.65rem' }}>
              AI-Powered Categorization
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: 1.6 }}>
              Ultralytics YOLO computer vision model automatically scans the uploaded image, identifies complaint types (potholes, garbage, lights), and computes confidence.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="card" style={{ padding: '2rem' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: '#fffbeb',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <Building size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.65rem' }}>
              Department Assignment
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: 1.6 }}>
              Municipal Admins review pending complaints, allocate specific specialized departments (Roads, Waste, Water, Electrical), assign crew size, and set deadlines.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="card" style={{ padding: '2rem' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: '#fff1f2',
                color: '#e11d48',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <Clock size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.65rem' }}>
              Deadline & Overdue Tracking
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: 1.6 }}>
              Automatic SLA countdowns trigger OVERDUE status when time expires. Historical overdue audit records are permanently retained even after later resolution.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="card" style={{ padding: '2rem' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: '#ecfeff',
                color: '#0891b2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <BarChart3 size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.65rem' }}>
              Authority Monitoring
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: 1.6 }}>
              Commissioners and Higher Authorities monitor cross-department resolution rates, track SLA breaches, and issue formal administrative actions and warnings.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Five-Step "How It Works" Section */}
      <section
        id="how-it-works"
        style={{
          padding: '5rem 2rem',
          backgroundColor: '#f8fafc',
          borderTop: '1px solid var(--border-light)',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              System Workflow
            </span>
            <h2
              style={{
                fontSize: '2.25rem',
                fontWeight: 800,
                color: 'var(--navy-900)',
                marginTop: '0.5rem',
              }}
            >
              5-Step Lifecycle from Report to Resolution
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {/* Step 1 */}
            <div className="card" style={{ padding: '1.75rem 1.25rem', textAlign: 'center', position: 'relative' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                }}
              >
                1
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
                Citizen Reports Issue
              </h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--slate-600)', lineHeight: 1.5 }}>
                Citizen captures photo, enters description, and attaches verified GPS coordinates.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card" style={{ padding: '1.75rem 1.25rem', textAlign: 'center' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: '#f5f3ff',
                  color: '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                }}
              >
                2
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
                AI Classifies Complaint
              </h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--slate-600)', lineHeight: 1.5 }}>
                YOLO vision model infers category and confidence to route to proper civic domain.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card" style={{ padding: '1.75rem 1.25rem', textAlign: 'center' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: '#fffbeb',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                }}
              >
                3
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
                Admin Reviews & Assigns
              </h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--slate-600)', lineHeight: 1.5 }}>
                Municipal Admin assigns specialized department, worker crew, and sets SLA deadline.
              </p>
            </div>

            {/* Step 4 */}
            <div className="card" style={{ padding: '1.75rem 1.25rem', textAlign: 'center' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: '#f0fdf4',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                }}
              >
                4
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
                Department Resolves Issue
              </h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--slate-600)', lineHeight: 1.5 }}>
                Crews repair infrastructure and upload completion proof photo to mark Resolved.
              </p>
            </div>

            {/* Step 5 */}
            <div className="card" style={{ padding: '1.75rem 1.25rem', textAlign: 'center' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: '#ecfeff',
                  color: '#0891b2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                }}
              >
                5
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
                Authority Monitors Performance
              </h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--slate-600)', lineHeight: 1.5 }}>
                Leadership reviews department charts, tracks overdue breaches, and issues orders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Four Role Portals Showcase */}
      <section
        id="roles"
        style={{
          padding: '5rem 2rem',
          maxWidth: 1280,
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Dedicated Portals
          </span>
          <h2
            style={{
              fontSize: '2.25rem',
              fontWeight: 800,
              color: 'var(--navy-900)',
              marginTop: '0.5rem',
            }}
          >
            Access by Governance Role
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {DEMO_CREDENTIALS.map((cred) => (
            <div
              key={cred.role}
              className="card"
              style={{
                padding: '2rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTop: `4px solid ${cred.color}`,
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      backgroundColor: `${cred.color}15`,
                      color: cred.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {cred.role === ROLES.CITIZEN && <Users size={24} />}
                    {cred.role === ROLES.MUNICIPAL_ADMIN && <Building size={24} />}
                    {cred.role === ROLES.HIGHER_AUTHORITY && <ShieldAlert size={24} />}
                    {cred.role === ROLES.SYSTEM_ADMIN && <ShieldCheck size={24} />}
                  </div>
                  <span
                    style={{
                      fontSize: '0.725rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: 999,
                      backgroundColor: `${cred.color}15`,
                      color: cred.color,
                    }}
                  >
                    {cred.badge}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
                  {cred.roleLabel}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  {cred.desc}
                </p>

                <div
                  style={{
                    padding: '0.75rem',
                    background: '#f8fafc',
                    borderRadius: 8,
                    border: '1px solid var(--border-light)',
                    fontSize: '0.75rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div style={{ color: 'var(--slate-500)', fontWeight: 600 }}>Demo Account:</div>
                  <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{cred.email}</div>
                  <div style={{ color: 'var(--slate-500)' }}>PW: <code>{cred.password}</code></div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%', backgroundColor: cred.color, borderColor: cred.color }}
                  onClick={() => handleRoleCardClick(cred.role)}
                >
                  {cred.role === ROLES.CITIZEN ? 'Sign In as Citizen' : 'Staff Login (2FA)'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ width: '100%' }}
                  onClick={() => handleDirectDemoAccess(cred.role)}
                >
                  Instant Dashboard Access
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Civic Issue Categories with Real Photos */}
      <section
        id="categories"
        style={{
          padding: '5rem 2rem',
          backgroundColor: '#f8fafc',
          borderTop: '1px solid var(--border-light)',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Supported Domains
            </span>
            <h2
              style={{
                fontSize: '2.25rem',
                fontWeight: 800,
                color: 'var(--navy-900)',
                marginTop: '0.5rem',
              }}
            >
              Classified Civic Issues
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.75rem',
            }}
          >
            {ISSUE_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className="card"
                style={{
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                <div style={{ height: 180, overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={cat.image}
                    alt={cat.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      padding: '0.25rem 0.65rem',
                      borderRadius: 999,
                      backgroundColor: 'rgba(15, 23, 42, 0.75)',
                      color: '#ffffff',
                      fontSize: '0.725rem',
                      fontWeight: 700,
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    {cat.department}
                  </div>
                </div>
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
                      {cat.name}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                      {cat.description}
                    </p>
                  </div>
                  <Link
                    to="/citizen/report"
                    style={{
                      fontSize: '0.825rem',
                      fontWeight: 700,
                      color: cat.color,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span>Report this issue</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer
        style={{
          backgroundColor: 'var(--navy-950)',
          color: '#ffffff',
          padding: '4rem 2rem 2rem',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '2.5rem',
            paddingBottom: '3rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ maxWidth: 360 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #2563eb, #0d9488)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <Building2 size={20} />
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>CIVIC CONNECT</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6 }}>
              AI-Powered Civic Complaint Reporting and Resolution Platform. Connecting citizens, municipal administrators, and executive authorities for smarter governance.
            </p>
          </div>

          <div>
            <h5 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: '#38bdf8' }}>Demo Portals</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
              <Link to="/citizen/dashboard" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Citizen Dashboard</Link>
              <Link to="/admin/dashboard" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Municipal Admin Dashboard</Link>
              <Link to="/authority/dashboard" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Higher Authority Analytics</Link>
              <Link to="/sysadmin/dashboard" style={{ color: '#cbd5e1', textDecoration: 'none' }}>System Administrator</Link>
            </div>
          </div>

          <div>
            <h5 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: '#38bdf8' }}>Contact & Support</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
              <span>Municipal Grievance Helpline: 1800-CIVIC-GOV</span>
              <span>Email: helpdesk@civicconnect.gov.in</span>
              <span>Available 24/7 for civic emergencies</span>
            </div>
          </div>
        </div>

        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            paddingTop: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8rem',
            color: '#64748b',
          }}
        >
          <div>&copy; 2026 CIVIC CONNECT Governance Platform. All rights reserved.</div>
          <div>Built for Municipal Corporations and Smarter Cities.</div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
