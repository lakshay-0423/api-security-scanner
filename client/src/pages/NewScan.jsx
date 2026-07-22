import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadScan, uploadScanFromUrl } from '../services/scanService';

const NewScan = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const validateFile = (selectedFile) => {
    const validExtensions = ['.json', '.yaml', '.yml'];
    const fileName = selectedFile.name.toLowerCase();
    const isValidExt = validExtensions.some(ext => fileName.endsWith(ext));
    if (!isValidExt) {
      setError('Invalid file type. Only JSON or YAML/YML files are allowed.');
      return false;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10 MB limit.');
      return false;
    }
    return true;
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => { setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setError(''); setSuccess('');
    if (e.dataTransfer.files?.[0]) {
      const f = e.dataTransfer.files[0];
      if (validateFile(f)) setFile(f);
    }
  };
  const handleFileSelect = (e) => {
    setError(''); setSuccess('');
    if (e.target.files?.[0]) {
      const f = e.target.files[0];
      if (validateFile(f)) setFile(f);
    }
  };
  const handleBrowseClick = () => { fileInputRef.current?.click(); };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError('Please select a specification file first.'); return; }
    setLoading(true); setError(''); setSuccess(''); setUploadProgress(0);
    try {
      const res = await uploadScan(file, (progressEvent) => {
        setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
      });
      const scanId = res.data?.scanId || res.scanId;
      setSuccess('Specification parsed successfully!');
      setTimeout(() => navigate(`/scans/${scanId}`), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to parse specification.');
      setFile(null); setUploadProgress(0);
    } finally { setLoading(false); }
  };

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    if (!url) { setError('Please enter a specification URL.'); return; }
    try { new URL(url); } catch (_) {
      setError('Please enter a valid URL.'); return;
    }
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await uploadScanFromUrl(url);
      const scanId = res.data?.scanId || res.scanId;
      setSuccess('Specification imported successfully!');
      setTimeout(() => navigate(`/scans/${scanId}`), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to import specification from URL.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '48px 24px', width: '100%' }}>
      <div style={{ width: '100%', maxWidth: '640px' }}>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', letterSpacing: '0.5px' }}>New API Scan</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '8px' }}>
            Discover and map endpoints from an OpenAPI or Swagger specification.
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(17, 24, 39, 0.9)',
          border: '1px solid rgba(30, 58, 95, 0.6)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden'
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(30, 58, 95, 0.6)', background: 'rgba(10, 15, 29, 0.5)' }}>
            {['upload', 'url'].map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => { setActiveTab(tab); setError(''); setSuccess(''); }}
                style={{
                  flex: 1,
                  padding: '16px',
                  textAlign: 'center',
                  fontWeight: 600,
                  fontSize: '14px',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
                  color: activeTab === tab ? '#ffffff' : '#94a3b8',
                  background: activeTab === tab ? 'rgba(17, 24, 39, 0.9)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {tab === 'upload' ? 'Upload File' : 'Import via URL'}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ padding: '32px' }}>
            {/* Alerts */}
            {error && (
              <div style={{ marginBottom: '24px', padding: '14px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#ef4444', fontSize: '14px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ fontSize: '18px', lineHeight: 1 }}>⚠️</span>
                <div>
                  <p style={{ fontWeight: 600 }}>Scan Error</p>
                  <p style={{ color: '#94a3b8', marginTop: '4px', lineHeight: 1.5 }}>{error}</p>
                </div>
              </div>
            )}
            {success && (
              <div style={{ marginBottom: '24px', padding: '14px 16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', color: '#10b981', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '18px', lineHeight: 1 }}>✅</span>
                <span>{success}</span>
              </div>
            )}

            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <form onSubmit={handleUploadSubmit}>
                {/* Dropzone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleBrowseClick}
                  style={{
                    border: isDragging ? '2px dashed #3b82f6' : '2px dashed rgba(30, 58, 95, 0.8)',
                    borderRadius: '16px',
                    padding: '48px 24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: isDragging ? 'rgba(59, 130, 246, 0.08)' : 'rgba(30, 41, 59, 0.3)',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".json,.yaml,.yml" style={{ display: 'none' }} />
                  <div style={{ fontSize: '40px', marginBottom: '4px' }}>📂</div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>
                    {file ? file.name : 'Drag & drop specification file here'}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                    {file ? `Size: ${(file.size / 1024).toFixed(1)} KB (Click to replace)` : 'Supports JSON, YAML, or YML (Max 10MB)'}
                  </p>
                  {!file && (
                    <span style={{
                      marginTop: '8px', display: 'inline-block', padding: '8px 16px',
                      background: '#1e293b', color: '#ffffff', fontSize: '12px', fontWeight: 600,
                      borderRadius: '8px', border: '1px solid rgba(30, 58, 95, 0.6)', pointerEvents: 'none'
                    }}>
                      Browse Files
                    </span>
                  )}
                </div>

                {/* Progress */}
                {uploadProgress > 0 && (
                  <div style={{ marginTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                      <span>Uploading...</span><span>{uploadProgress}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'linear-gradient(to right, #3b82f6, #60a5fa)', borderRadius: '4px', transition: 'width 0.3s' }} />
                    </div>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || !file}
                  style={{
                    width: '100%', marginTop: '24px', padding: '14px',
                    background: !file ? '#1e3a5f' : 'linear-gradient(to right, #3b82f6, #60a5fa)',
                    color: '#ffffff', fontWeight: 600, fontSize: '14px',
                    border: 'none', borderRadius: '12px', cursor: !file ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.5 : 1, transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: file ? '0 4px 15px rgba(59, 130, 246, 0.25)' : 'none'
                  }}
                >
                  {loading ? (
                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Parsing Schema...</>
                  ) : 'Start Scan'}
                </button>
              </form>
            )}

            {/* URL Tab */}
            {activeTab === 'url' && (
              <form onSubmit={handleUrlSubmit}>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', marginBottom: '8px' }}>
                    Specification URL
                  </label>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '0 16px',
                    background: '#1e293b', border: '1px solid rgba(30, 58, 95, 0.6)',
                    borderRadius: '12px', transition: 'all 0.2s'
                  }}>
                    <span style={{ fontSize: '18px', flexShrink: 0 }}>🔗</span>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://petstore.swagger.io/v2/swagger.json"
                      style={{
                        width: '100%', padding: '14px 0', background: 'transparent',
                        border: 'none', outline: 'none', color: '#ffffff', fontSize: '14px'
                      }}
                    />
                  </div>
                  <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px', lineHeight: 1.5 }}>
                    Enter an absolute link to a public OpenAPI document (JSON or YAML).
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !url}
                  style={{
                    width: '100%', padding: '14px',
                    background: !url ? '#1e3a5f' : 'linear-gradient(to right, #3b82f6, #60a5fa)',
                    color: '#ffffff', fontWeight: 600, fontSize: '14px',
                    border: 'none', borderRadius: '12px', cursor: !url ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.5 : 1, transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: url ? '0 4px 15px rgba(59, 130, 246, 0.25)' : 'none'
                  }}
                >
                  {loading ? (
                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Downloading Spec...</>
                  ) : 'Import Spec'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewScan;
