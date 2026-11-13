// frontend/src/pages/citizen/ReportComplaint.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  MapPin,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import ImageUploader from '../../components/ImageUploader';
import LocationPicker from '../../components/LocationPicker';
import { citizenApi } from '../../api/citizenApi';
import { useAuth } from '../../context/AuthContext';
import { ISSUE_CATEGORIES } from '../../utils/constants';

export const ReportComplaint = () => {
  const navigate = useNavigate();
  const { showToast } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Form states
  const [imageFile, setImageFile] = useState(null);
  const [imageSource, setImageSource] = useState('UPLOAD'); // 'CAPTURE' | 'UPLOAD'
  const [aiPrediction, setAiPrediction] = useState(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(ISSUE_CATEGORIES[0].id);

  const [locationData, setLocationData] = useState({
    latitude: 12.9716,
    longitude: 77.5946,
    address: 'Near Mahatma Gandhi Road Metro Station, Central Ward 1',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successModalData, setSuccessModalData] = useState(null);

  // Handle image selected & AI update
  const handleImageSelected = (file, source) => {
    setImageFile(file);
    setImageSource(source || 'UPLOAD');
    if (!title) {
      setTitle(`${category || 'Civic Infrastructure Concern'} reported`);
    }
  };

  const handlePredictionChange = (prediction) => {
    setAiPrediction(prediction);
    if (prediction?.category) {
      setCategory(prediction.category);
      if (!title || title.includes('reported')) {
        setTitle(`${prediction.category} reported on public road`);
      }
    }
  };

  // Submit Complaint
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!imageFile) {
      setErrorMsg('Please upload a photo or capture an image of the civic issue.');
      showToast('Please upload a photo or capture an image first.', 'error');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const finalTitle = title.trim() || `${category || 'Civic Infrastructure Concern'} Incident Report`;
    const finalDescription = description.trim() || `Reported via Civic Connect mobile/web portal at ${locationData.address || 'Selected Location'}.`;

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('source', imageSource || 'UPLOAD');
      formData.append('title', finalTitle);
      formData.append('description', finalDescription);
      formData.append('category', category || 'Road damage and potholes');
      formData.append('latitude', locationData.latitude || 12.9716);
      formData.append('longitude', locationData.longitude || 77.5946);
      formData.append('address', locationData.address || `${locationData.latitude}, ${locationData.longitude}`);

      const res = await citizenApi.createComplaint(formData);
      setSuccessModalData(res.data);
      showToast('Civic complaint registered successfully!', 'success');
    } catch (err) {
      console.error('Complaint submit error:', err);
      const msg = typeof err === 'string' ? err : err.message || 'Failed to submit complaint. Please retry.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="dashboard-main">
        <Navbar
          pageTitle="Report Civic Complaint"
          onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
        />

        <main className="dashboard-content">
          <div className="complaint-form-container">
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => navigate('/citizen/dashboard')}
                style={{ marginBottom: '1rem' }}
              >
                <ArrowLeft size={14} />
                <span>Back to Dashboard</span>
              </button>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                Report a Civic Issue
              </h1>
              <p style={{ color: 'var(--slate-500)', fontSize: '0.925rem' }}>
                Complete the three steps below to submit an issue directly to the municipal work queue.
              </p>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div
                style={{
                  padding: '1rem 1.25rem',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 'var(--radius-md)',
                  color: '#b91c1c',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.9rem',
                }}
              >
                <AlertCircle size={20} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* SECTION 1: Photographic Evidence & AI Classification */}
              <div className="form-section-card">
                <div className="form-section-header">
                  <div className="section-number-pill">1</div>
                  <div>
                    <h3 className="section-title">Photographic Proof & AI Vision</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                      Capture with camera or upload an image file. AI will detect category automatically.
                    </p>
                  </div>
                </div>

                <ImageUploader
                  onImageSelected={handleImageSelected}
                  onPredictionChange={handlePredictionChange}
                  isSimulated={true}
                />
              </div>

              {/* SECTION 2: Issue Details */}
              <div className="form-section-card">
                <div className="form-section-header">
                  <div className="section-number-pill">2</div>
                  <div>
                    <h3 className="section-title">Complaint Information</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                      Describe the problem and specify the category
                    </p>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Complaint Title
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Deep pothole damaging vehicles near metro pillar"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: 4 }}>
                    Leave blank to auto-generate based on detected category.
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Issue Category <span className="required">*</span>
                  </label>
                  <select
                    className="form-input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {ISSUE_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.department})
                      </option>
                    ))}
                  </select>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: 4 }}>
                    {aiPrediction ? 'Category suggested by AI vision model.' : 'Select the primary department category.'}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Detailed Description</label>
                  <textarea
                    rows={4}
                    className="form-input"
                    placeholder="Provide specific notes (e.g. depth of pothole, days of garbage overflow, exact landmarks)..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* SECTION 3: Geolocation */}
              <div className="form-section-card">
                <div className="form-section-header">
                  <div className="section-number-pill">3</div>
                  <div>
                    <h3 className="section-title">Incident Location & Map Geotag</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                      Auto-detect using GPS satellite coordinates or manually adjust the map pin
                    </p>
                  </div>
                </div>

                <LocationPicker
                  initialLatitude={locationData.latitude}
                  initialLongitude={locationData.longitude}
                  initialAddress={locationData.address}
                  onLocationChange={(loc) => setLocationData(loc)}
                />
              </div>

              {/* Bottom Error Alert if any */}
              {errorMsg && (
                <div
                  style={{
                    padding: '0.85rem 1.25rem',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 'var(--radius-md)',
                    color: '#b91c1c',
                    marginTop: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    fontSize: '0.875rem',
                  }}
                >
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => navigate('/citizen/dashboard')}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                      <span>Submitting to Municipal Queue...</span>
                    </span>
                  ) : (
                    <>
                      <span>Submit Grievance</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>

      {/* Success Modal */}
      {successModalData && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 520, textAlign: 'center', padding: '2.5rem 2rem' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: '#ecfdf5',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
              Complaint Registered!
            </h3>

            <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Your complaint has been queued for review by municipal authorities.
            </p>

            <div
              style={{
                backgroundColor: 'var(--slate-50)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.75rem',
                textAlign: 'left',
                fontSize: '0.85rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--slate-500)' }}>Complaint ID:</span>
                <strong style={{ color: 'var(--primary)' }}>{successModalData.complaint_id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--slate-500)' }}>AI Predicted Category:</span>
                <strong style={{ color: 'var(--navy-900)' }}>{successModalData.prediction?.category || category}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--slate-500)' }}>Initial Status:</span>
                <span className="badge badge-blue">Pending Review</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={() => {
                  setSuccessModalData(null);
                  navigate('/citizen/complaints');
                }}
              >
                Track in My Complaints
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => {
                  setSuccessModalData(null);
                  navigate('/citizen/dashboard');
                }}
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportComplaint;

