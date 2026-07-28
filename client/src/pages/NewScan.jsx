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
      setError('Invalid file type. Only JSON or YAML/YML specification files are supported.');
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
      setError('Please enter a valid absolute URL.'); return;
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
    <div className="w-full max-w-2xl mx-auto py-8 md:py-12 flex flex-col gap-8">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">New API Scan</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-2 leading-relaxed">
          Discover, map, and analyze security posture from an OpenAPI or Swagger specification.
        </p>
      </div>

      {/* Card Container */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-2xl border border-[var(--color-border)]">
        {/* Navigation Tabs */}
        <div className="flex border-b border-[var(--color-border)] bg-[var(--color-bg-dark)]/40">
          <button
            type="button"
            onClick={() => { setActiveTab('upload'); setError(''); setSuccess(''); }}
            className={`flex-1 py-4 px-6 text-center text-sm font-semibold transition-all border-b-2 cursor-pointer ${
              activeTab === 'upload'
                ? 'border-[var(--color-primary)] text-white bg-[var(--color-bg-card)]'
                : 'border-transparent text-[var(--color-text-muted)] hover:text-white'
            }`}
          >
            📂 Upload File
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('url'); setError(''); setSuccess(''); }}
            className={`flex-1 py-4 px-6 text-center text-sm font-semibold transition-all border-b-2 cursor-pointer ${
              activeTab === 'url'
                ? 'border-[var(--color-primary)] text-white bg-[var(--color-bg-card)]'
                : 'border-transparent text-[var(--color-text-muted)] hover:text-white'
            }`}
          >
            🔗 Import via URL
          </button>
        </div>

        {/* Content Body */}
        <div className="p-8 md:p-10 flex flex-col gap-6">
          {/* Alerts */}
          {error && (
            <div className="p-4 bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 rounded-xl text-[var(--color-error)] text-sm flex items-start gap-3">
              <span className="text-lg leading-none shrink-0">⚠️</span>
              <div>
                <p className="font-semibold">Scan Error</p>
                <p className="text-[var(--color-text-muted)] mt-1 text-xs leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="p-4 bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 rounded-xl text-[var(--color-success)] text-sm flex items-center gap-3">
              <span className="text-lg leading-none shrink-0">✅</span>
              <span className="font-semibold">{success}</span>
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <form onSubmit={handleUploadSubmit} className="flex flex-col gap-6">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleBrowseClick}
                className={`border-2 border-dashed rounded-2xl p-10 md:p-14 text-center cursor-pointer transition-all flex flex-col items-center gap-3 ${
                  isDragging
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                    : 'border-[var(--color-border)] bg-[var(--color-bg-input)]/20 hover:border-[var(--color-primary)]/60 hover:bg-[var(--color-primary)]/5'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".json,.yaml,.yml"
                  className="hidden"
                />
                <div className="text-4xl mb-1">📂</div>
                <h3 className="text-base font-semibold text-white">
                  {file ? file.name : 'Drag & drop specification file here'}
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                  {file ? `Size: ${(file.size / 1024).toFixed(1)} KB (Click to replace)` : 'Supports JSON, YAML, or YML (Max 10MB)'}
                </p>
                {!file && (
                  <span className="mt-2 inline-block px-4 py-2 bg-[var(--color-bg-input)] text-white text-xs font-semibold rounded-lg border border-[var(--color-border)] pointer-events-none">
                    Browse Files
                  </span>
                )}
              </div>

              {uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-[var(--color-bg-input)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !file}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white font-semibold text-sm rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[var(--color-primary)]/20"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Parsing Schema...
                  </>
                ) : (
                  'Start Scan'
                )}
              </button>
            </form>
          )}

          {/* URL Tab */}
          {activeTab === 'url' && (
            <form onSubmit={handleUrlSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                  Specification URL
                </label>
                <div className="input-wrapper py-1 px-4">
                  <span className="text-lg shrink-0">🔗</span>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://petstore.swagger.io/v2/swagger.json"
                    className="input-field"
                  />
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">
                  Enter an absolute link to a public OpenAPI or Swagger document (JSON or YAML).
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !url}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white font-semibold text-sm rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[var(--color-primary)]/20"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Downloading Spec...
                  </>
                ) : (
                  'Import Spec'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewScan;
