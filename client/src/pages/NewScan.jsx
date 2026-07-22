import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadScan, uploadScanFromUrl } from '../services/scanService';

const NewScan = () => {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'url'
  
  // File upload states
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // URL input states
  const [url, setUrl] = useState('');
  
  // General states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Helper validation: JSON or YAML, and < 10MB
  const validateFile = (selectedFile) => {
    const validExtensions = ['.json', '.yaml', '.yml'];
    const fileName = selectedFile.name.toLowerCase();
    const isValidExt = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValidExt) {
      setError('Invalid file type. Only OpenAPI/Swagger specifications in JSON or YAML/YML format are allowed.');
      return false;
    }
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      setError('File size exceeds the 10 MB limit.');
      return false;
    }
    
    return true;
  };

  // Drag and Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setError('');
    setSuccess('');
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleFileSelect = (e) => {
    setError('');
    setSuccess('');
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  // Submit File Upload
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select or drag in a specification file first.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setUploadProgress(0);

    try {
      const res = await uploadScan(file, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });

      setSuccess('Specification parsed and imported successfully!');
      setTimeout(() => {
        navigate(`/scans/${res.scanId}`);
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to parse and upload specification. Verify it is a valid OpenAPI specification.');
      setFile(null);
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  // Submit URL Import
  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    if (!url) {
      setError('Please enter a specification URL.');
      return;
    }

    // Basic format check
    try {
      new URL(url);
    } catch (_) {
      setError('Please enter a valid absolute URL (e.g. https://petstore.swagger.io/v2/swagger.json).');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await uploadScanFromUrl(url);
      setSuccess('Specification downloaded and parsed successfully!');
      setTimeout(() => {
        navigate(`/scans/${res.scanId}`);
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to import specification from URL. Ensure the endpoint is reachable and contains a valid specification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 w-full flex-1 flex flex-col justify-center">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white tracking-wide">New API Scan</h1>
        <p className="text-[var(--color-text-muted)] mt-2">
          Discover and map endpoints from an OpenAPI or Swagger schema specification.
        </p>
      </div>

      {/* Card */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-[var(--color-border)] bg-[var(--color-bg-dark)]/40">
          <button
            onClick={() => { setActiveTab('upload'); setError(''); setSuccess(''); }}
            className={`flex-1 py-4 text-center font-medium text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'border-[var(--color-primary)] text-white bg-[var(--color-bg-card)]'
                : 'border-transparent text-[var(--color-text-muted)] hover:text-white'
            }`}
          >
            Upload File
          </button>
          <button
            onClick={() => { setActiveTab('url'); setError(''); setSuccess(''); }}
            className={`flex-1 py-4 text-center font-medium text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === 'url'
                ? 'border-[var(--color-primary)] text-white bg-[var(--color-bg-card)]'
                : 'border-transparent text-[var(--color-text-muted)] hover:text-white'
            }`}
          >
            Import via URL
          </button>
        </div>

        <div className="p-8">
          {/* Success / Error Alerts */}
          {error && (
            <div className="mb-6 p-4 bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 rounded-xl text-[var(--color-error)] text-sm flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold">Scan Error</p>
                <p className="mt-1 text-[var(--color-text-muted)] leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 rounded-xl text-[var(--color-success)] text-sm flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{success}</span>
            </div>
          )}

          {/* Upload Specification Tab */}
          {activeTab === 'upload' && (
            <form onSubmit={handleUploadSubmit} className="space-y-6">
              {/* Drag Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleBrowseClick}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                    : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-bg-input)]/20'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".json,.yaml,.yml"
                  className="hidden"
                />
                
                <div className="text-4xl mb-4">📂</div>
                <h3 className="text-lg font-medium text-white mb-1">
                  {file ? file.name : 'Drag & drop specification file here'}
                </h3>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {file 
                    ? `Size: ${(file.size / 1024).toFixed(1)} KB (Click to replace)` 
                    : 'Supports JSON, YAML, or YML (Max 10MB)'
                  }
                </p>
                {!file && (
                  <button
                    type="button"
                    className="mt-4 px-4 py-2 bg-[var(--color-bg-input)] text-white text-xs font-semibold rounded-lg border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all"
                  >
                    Browse Files
                  </button>
                )}
              </div>

              {/* Progress Bar */}
              {uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-[var(--color-bg-input)] rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading || !file}
                className="w-full py-3 px-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] disabled:from-[var(--color-border)] disabled:to-[var(--color-border)] text-white font-medium rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Parsing Schema...
                  </>
                ) : (
                  'Start Scan'
                )}
              </button>
            </form>
          )}

          {/* Import via URL Tab */}
          {activeTab === 'url' && (
            <form onSubmit={handleUrlSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-text-muted)]">
                  Specification URL
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🔗</span>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://petstore.swagger.io/v2/swagger.json"
                    className="w-full pl-11 pr-4 py-3 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all duration-200"
                  />
                </div>
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                  Enter an absolute link to a public OpenAPI document (JSON or YAML). The system will fetch and scan the spec securely.
                </p>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading || !url}
                className="w-full py-3 px-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] disabled:from-[var(--color-border)] disabled:to-[var(--color-border)] text-white font-medium rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
