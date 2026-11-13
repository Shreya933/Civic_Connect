// frontend/src/components/ImageUploader.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { ISSUE_CATEGORIES } from '../utils/constants';

export const ImageUploader = ({
  onImageSelected,
  onPredictionChange,
  isSimulated = true,
}) => {
  const [mode, setMode] = useState('upload'); // 'upload' | 'camera'
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Stop camera stream cleanly
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);

  // Start browser camera stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCapturing(true);
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError(
        err.message || 'Unable to access camera. Please allow camera permissions or upload an image file instead.'
      );
    }
  };

  const handleModeSwitch = (newMode) => {
    if (newMode === mode) return;
    if (mode === 'camera') {
      stopCamera();
    }
    setMode(newMode);
    if (newMode === 'camera' && !previewUrl) {
      startCamera();
    }
  };

  // Run AI Classification simulation or hook
  const analyzeImage = (file, imageSource) => {
    setIsAnalyzing(true);
    // Simulate smart AI inference delay
    setTimeout(() => {
      // Deterministically pick realistic category or based on filename
      let category = 'Road damage and potholes';
      let confidence = 0.94;

      const lowerName = (file?.name || '').toLowerCase();
      if (lowerName.includes('garbage') || lowerName.includes('waste') || lowerName.includes('trash')) {
        category = 'Garbage accumulation';
        confidence = 0.98;
      } else if (lowerName.includes('water') || lowerName.includes('leak') || lowerName.includes('pipe')) {
        category = 'Water leakage';
        confidence = 0.92;
      } else if (lowerName.includes('light') || lowerName.includes('pole') || lowerName.includes('lamp')) {
        category = 'Broken streetlights';
        confidence = 0.96;
      } else if (lowerName.includes('drain') || lowerName.includes('flood') || lowerName.includes('sewer')) {
        category = 'Drainage problems';
        confidence = 0.91;
      }

      const result = {
        category,
        confidence,
        state: 'CLASSIFIED',
        source: imageSource,
      };

      setPrediction(result);
      setIsAnalyzing(false);
      if (onPredictionChange) {
        onPredictionChange(result);
      }
    }, 900);
  };

  // Handle file chosen from file picker
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, WEBP).');
      return;
    }

    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(url);
    stopCamera();

    if (onImageSelected) {
      onImageSelected(file, 'UPLOAD', url);
    }
    analyzeImage(file, 'UPLOAD');
  };

  // Shutter click for camera capture
  const takeSnapshot = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const capturedFile = new File([blob], `civic_capture_${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });
        const url = URL.createObjectURL(blob);

        setSelectedFile(capturedFile);
        setPreviewUrl(url);
        stopCamera();

        if (onImageSelected) {
          onImageSelected(capturedFile, 'CAPTURE', url);
        }
        analyzeImage(capturedFile, 'CAPTURE');
      },
      'image/jpeg',
      0.9
    );
  };

  const handleReset = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setPrediction(null);
    if (onPredictionChange) onPredictionChange(null);
    if (onImageSelected) onImageSelected(null, null, null);

    if (mode === 'camera') {
      startCamera();
    }
  };

  return (
    <div>
      {/* Upload vs Camera selector tabs */}
      {!previewUrl && (
        <div className="upload-mode-toggle">
          <button
            type="button"
            className={`mode-tab-btn ${mode === 'upload' ? 'active' : ''}`}
            onClick={() => handleModeSwitch('upload')}
          >
            <Upload size={18} />
            <span>Upload Image File</span>
          </button>
          <button
            type="button"
            className={`mode-tab-btn ${mode === 'camera' ? 'active' : ''}`}
            onClick={() => handleModeSwitch('camera')}
          >
            <Camera size={18} />
            <span>Use Device Camera</span>
          </button>
        </div>
      )}

      {/* Mode 1: File Dropzone */}
      {mode === 'upload' && !previewUrl && (
        <div>
          <div
            className="dropzone-box"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file && file.type.startsWith('image/')) {
                const url = URL.createObjectURL(file);
                setSelectedFile(file);
                setPreviewUrl(url);
                if (onImageSelected) onImageSelected(file, 'UPLOAD', url);
                analyzeImage(file, 'UPLOAD');
              }
            }}
          >
            <div className="dropzone-icon">
              <ImageIcon size={26} />
            </div>
            <strong style={{ fontSize: '1rem', color: 'var(--navy-900)', marginBottom: '0.25rem' }}>
              Choose a complaint photo or drag & drop here
            </strong>
            <p style={{ fontSize: '0.825rem', color: 'var(--slate-500)' }}>
              Supports high-resolution JPEG, PNG, or WEBP (up to 5 MB)
            </p>
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              style={{ marginTop: '1.25rem' }}
            >
              <Upload size={14} />
              Browse Local Files
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* Mode 2: Camera Capture Live View */}
      {mode === 'camera' && !previewUrl && (
        <div>
          {cameraError ? (
            <div
              style={{
                padding: '1.5rem',
                backgroundColor: '#fff1f2',
                border: '1px solid #fecdd3',
                borderRadius: 'var(--radius-md)',
                color: '#9f1239',
                textAlign: 'center',
              }}
            >
              <AlertCircle size={32} style={{ margin: '0 auto 0.75rem', color: '#e11d48' }} />
              <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Camera Unavailable</p>
              <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>{cameraError}</p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => handleModeSwitch('upload')}
              >
                Switch to File Upload
              </button>
            </div>
          ) : (
            <div className="camera-preview-container">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="camera-video-stream"
                onLoadedMetadata={() => videoRef.current?.play()}
              />
              <div className="camera-controls-bar">
                <button
                  type="button"
                  className="shutter-btn"
                  onClick={takeSnapshot}
                  title="Capture Photo"
                >
                  <Camera size={26} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selected Image Preview with action controls */}
      {previewUrl && (
        <div>
          <div className="image-preview-wrapper">
            <img src={previewUrl} alt="Complaint preview" className="image-preview-img" />
            <div className="preview-actions-overlay">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleReset}
                title="Replace Image"
              >
                <RotateCcw size={14} />
                <span>Replace</span>
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleReset}
                title="Remove Image"
              >
                <Trash2 size={14} />
                <span>Remove</span>
              </button>
            </div>
          </div>

          {/* AI Classification Panel */}
          {isAnalyzing && (
            <div
              className="card"
              style={{
                marginTop: '1.25rem',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                backgroundColor: '#eff6ff',
                borderColor: '#bfdbfe',
              }}
            >
              <Sparkles size={24} style={{ color: 'var(--primary)', animation: 'spin 2s linear infinite' }} />
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>
                  Civic AI Vision Analysis in progress...
                </strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                  Scanning road surface, waste markers, and infrastructure features...
                </p>
              </div>
            </div>
          )}

          {prediction && !isAnalyzing && (
            <div className="ai-prediction-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="ai-header-badge">
                  <Sparkles size={12} />
                  AI Vision Model v2.4
                </span>
                {isSimulated && (
                  <span
                    style={{
                      fontSize: '0.725rem',
                      background: 'rgba(0,0,0,0.06)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      color: 'var(--slate-600)',
                      fontWeight: 600,
                    }}
                  >
                    Simulated Demo Inference
                  </span>
                )}
              </div>

              <div className="ai-detected-title">
                Category: {prediction.category}
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                Deep learning model detected issue with high confidence.
              </p>

              <div className="confidence-progress-bar">
                <div
                  className="confidence-fill"
                  style={{ width: `${prediction.confidence * 100}%` }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--slate-700)',
                }}
              >
                <span>Confidence Score: {(prediction.confidence * 100).toFixed(1)}%</span>
                <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle2 size={14} /> Ready for Submission
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;

