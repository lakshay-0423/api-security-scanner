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
    <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col gap-6 animate-fade-in py-4">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white">New API Scan</h1>
        <p className="text-[13px] text-[var(--color-text-muted)] mt-0.5 leading-relaxed">
          Import an OpenAPI or Swagger specification to discover endpoints and generate static security analysis.
        </p>
      </div>

      {/* Card Container */}
      <div className="glass-card overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-[var(--color-border)] bg-[var(--color-bg-dark)]/40">
          <button
            type="button"
            onClick={() => { setActiveTab('upload'); setError(''); setSuccess(''); }}
            className={`flex-1 py-3 px-4 text-center text-xs font-semibold transition-all border-b-2 cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'upload'
                ? 'border-[var(--color-primary)] text-white bg-[var(--color-bg-card)]'
                : 'border-transparent text-[var(--color-text-muted)] hover:text-white'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload File
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('url'); setError(''); setSuccess(''); }}
            className={`flex-1 py-3 px-4 text-center text-xs font-semibold transition-all border-b-2 cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'url'
                ? 'border-[var(--color-primary)] text-white bg-[var(--color-bg-card)]'
                : 'border-transparent text-[var(--color-text-muted)] hover:text-white'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Import via URL
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 flex flex-col gap-5">
          {/* Alerts */}
          {error && (
            <div className="p-3.5 bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 rounded-xl text-[var(--color-error)] text-xs flex items-start gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-semibold text-white">Scan Error</p>
                <p className="text-[var(--color-text-muted)] mt-0.5 text-xs leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="p-3.5 bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 rounded-xl text-[var(--color-success)] text-xs flex items-center gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-semibold">{success}</span>
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <form onSubmit={handleUploadSubmit} className="flex flex-col gap-5">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleBrowseClick}
                className={`border-2 border-dashed rounded-xl p-8 md:p-10 text-center cursor-pointer transition-all flex flex-col items-center gap-2.5 ${
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
                <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-input)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-primary-light)]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-white">
                  {file ? file.name : 'Drag & drop specification file here'}
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                  {file ? `Size: ${(file.size / 1024).toFixed(1)} KB (Click to replace)` : 'Supports JSON, YAML, or YML (Max 10MB)'}
                </p>
                {!file && (
                  <span className="btn-secondary !py-1.5 !px-3.5 !text-xs mt-1 pointer-events-none">
                    Browse Files
                  </span>
                )}
              </div>

              {uploadProgress > 0 && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--color-bg-input)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !file}
                className="btn-primary w-full py-2.5 justify-center"
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
            <form onSubmit={handleUrlSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                  Specification URL
                </label>
                <div className="input-wrapper py-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://petstore.swagger.io/v2/swagger.json"
                    className="input-field"
                  />
                </div>
                <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 leading-relaxed">
                  Provide a publicly accessible URL to an OpenAPI 3.0+ or Swagger 2.0 definition file.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !url}
                className="btn-primary w-full py-2.5 justify-center"
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
