import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Link as LinkIcon, FileCode, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useScans } from '../hooks/useScans';
import { validateSpecFile, isValidUrl } from '../utils/helpers';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Tabs from '../components/ui/Tabs';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export const NewScan = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { uploadFileSpec, uploadUrlSpec, loading } = useScans();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setError('');
    setSuccess('');
    if (e.dataTransfer.files?.[0]) {
      const selected = e.dataTransfer.files[0];
      const res = validateSpecFile(selected);
      if (!res.valid) {
        setError(res.message);
      } else {
        setFile(selected);
      }
    }
  };

  const handleFileSelect = (e) => {
    setError('');
    setSuccess('');
    if (e.target.files?.[0]) {
      const selected = e.target.files[0];
      const res = validateSpecFile(selected);
      if (!res.valid) {
        setError(res.message);
      } else {
        setFile(selected);
      }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an OpenAPI / Swagger specification file.');
      return;
    }
    setError('');
    setSuccess('');
    setUploadProgress(0);

    try {
      const res = await uploadFileSpec(file, (evt) => {
        setUploadProgress(Math.round((evt.loaded * 100) / evt.total));
      });
      const scanId = res.data?.scanId || res.scanId;
      setSuccess('Specification parsed successfully!');
      setTimeout(() => navigate(`/scans/${scanId}`), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to parse specification file.');
      setFile(null);
      setUploadProgress(0);
    }
  };

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    if (!url) {
      setError('Please enter a specification URL.');
      return;
    }
    if (!isValidUrl(url)) {
      setError('Please enter a valid absolute URL.');
      return;
    }
    setError('');
    setSuccess('');

    try {
      const res = await uploadUrlSpec(url);
      const scanId = res.data?.scanId || res.scanId;
      setSuccess('Specification imported successfully from URL!');
      setTimeout(() => navigate(`/scans/${scanId}`), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to import specification from URL.');
    }
  };

  const tabList = [
    { id: 'upload', label: 'Upload File', icon: Upload },
    { id: 'url', label: 'Import via URL', icon: LinkIcon },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col gap-6 animate-fade-in py-2">
      <PageHeader
        title="New API Scan"
        description="Import an OpenAPI or Swagger specification to discover endpoints and generate static security posture analysis."
        action={
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        }
      />

      <Card className="!p-0 overflow-hidden shadow-2xl">
        <Tabs tabs={tabList} activeTab={activeTab} onChange={(tab) => { setActiveTab(tab); setError(''); setSuccess(''); }} />

        <div className="p-6 md:p-8 flex flex-col gap-5">
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Import Error</p>
                <p className="text-slate-300 mt-0.5 text-xs">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="font-bold">{success}</span>
            </div>
          )}

          {activeTab === 'upload' ? (
            <form onSubmit={handleUploadSubmit} className="flex flex-col gap-5">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 md:p-10 text-center cursor-pointer transition-all flex flex-col items-center gap-3 ${
                  isDragging
                    ? 'border-blue-500 bg-blue-500/10 scale-[1.01]'
                    : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".json,.yaml,.yml"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <FileCode className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {file ? file.name : 'Drag & drop specification file here'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {file ? `Size: ${(file.size / 1024).toFixed(1)} KB (Click to replace)` : 'Supports JSON, YAML, or YML (Max 10MB)'}
                  </p>
                </div>
                {!file && (
                  <Button variant="secondary" size="sm" type="button" className="pointer-events-none mt-1">
                    Browse Files
                  </Button>
                )}
              </div>

              {uploadProgress > 0 && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button type="submit" loading={loading} disabled={!file} className="flex-1">
                  Start Scan
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleUrlSubmit} className="flex flex-col gap-5">
              <Input
                label="Specification URL"
                type="url"
                icon={LinkIcon}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://petstore.swagger.io/v2/swagger.json"
              />
              <p className="text-xs text-slate-400 leading-relaxed -mt-2">
                Provide a publicly accessible URL to an OpenAPI 3.0+ or Swagger 2.0 definition file.
              </p>
              <Button type="submit" loading={loading} disabled={!url} className="w-full">
                Import Spec
              </Button>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
};

export default NewScan;
