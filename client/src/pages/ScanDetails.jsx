import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getScanById, runAnalysis, getFindings, exportJsonReport } from '../services/scanService';
import LoadingSpinner from '../components/LoadingSpinner';

const ScanDetails = () => {
  const { id } = useParams();
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Phase 2 Analysis & Findings state
  const [findings, setFindings] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [exporting, setExporting] = useState(false);

  // Endpoints Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [authFilter, setAuthFilter] = useState('ALL');
  const [securityFilter, setSecurityFilter] = useState('ALL');

  // Findings Search & Filter state
  const [findingSearch, setFindingSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Expanded row tracking
  const [expandedEndpoints, setExpandedEndpoints] = useState({});
  const [expandedFindings, setExpandedFindings] = useState({});

  const fetchData = async () => {
    try {
      const scanRes = await getScanById(id);
      setScan(scanRes.data);

      if (scanRes.data.analysisStatus === 'completed') {
        const findingsRes = await getFindings(id);
        setFindings(findingsRes.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load scan details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    setAnalysisError('');
    try {
      await runAnalysis(id);
      await fetchData();
    } catch (err) {
      setAnalysisError(err.response?.data?.message || 'Failed to execute security analysis.');
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExportJson = async () => {
    setExporting(true);
    try {
      const blobData = await exportJsonReport(id);
      const url = window.URL.createObjectURL(new Blob([blobData], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `security-report-${scan?.apiTitle ? scan.apiTitle.toLowerCase().replace(/[^a-z0-9]/g, '-') : id}.json`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('Failed to download report', err);
    } finally {
      setExporting(false);
    }
  };

  const toggleEndpointRow = (endpointId) => {
    setExpandedEndpoints(prev => ({ ...prev, [endpointId]: !prev[endpointId] }));
  };

  const toggleFindingRow = (findingId) => {
    setExpandedFindings(prev => ({ ...prev, [findingId]: !prev[findingId] }));
  };

  const getMethodBadgeClass = (method) => {
    const normalMethod = method.toUpperCase();
    if (normalMethod === 'GET') return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    if (normalMethod === 'POST') return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    if (normalMethod === 'PUT') return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    if (normalMethod === 'PATCH') return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
    if (normalMethod === 'DELETE') return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
  };

  const getSeverityBadgeClass = (severity) => {
    const s = (severity || '').toLowerCase();
    if (s === 'critical') return 'bg-red-950/80 text-red-300 border border-red-800';
    if (s === 'high') return 'bg-rose-500/15 text-rose-400 border border-rose-500/30';
    if (s === 'medium') return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
    if (s === 'low') return 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/30';
    return 'bg-blue-500/15 text-blue-400 border border-blue-500/30';
  };

  const getStatusBadgeClass = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'resolved') return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    if (s === 'accepted') return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
  };

  const getRiskScoreColor = (score = 0) => {
    if (score > 70) return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', label: 'Critical Risk' };
    if (score > 40) return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', label: 'High Risk' };
    if (score > 20) return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', label: 'Medium Risk' };
    return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', label: 'Low Risk' };
  };

  if (loading) return <LoadingSpinner />;

  if (error || !scan) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 text-center flex-1 flex flex-col justify-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-white">Failed to load scan report</h2>
        <p className="text-[var(--color-text-muted)] mt-2">{error || 'The report does not exist or you do not have permission to view it.'}</p>
        <Link to="/dashboard" className="mt-6 inline-block px-5 py-2.5 bg-[var(--color-bg-input)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary-light)] border border-[var(--color-border)] text-white text-sm font-medium rounded-xl transition-all cursor-pointer">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Filtered endpoints calculation
  const filteredEndpoints = (scan.endpoints || []).filter(ep => {
    const matchesSearch = ep.path.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = methodFilter === 'ALL' || ep.method === methodFilter;
    const matchesAuth = authFilter === 'ALL' || (authFilter === 'AUTH' && ep.requiresAuth) || (authFilter === 'NO_AUTH' && !ep.requiresAuth);
    const matchesSecurity = securityFilter === 'ALL' || ep.securityType === securityFilter;
    return matchesSearch && matchesMethod && matchesAuth && matchesSecurity;
  });

  // Filtered findings calculation
  const filteredFindings = findings.filter(f => {
    const query = findingSearch.toLowerCase();
    const matchesSearch = f.title.toLowerCase().includes(query) ||
                          f.description.toLowerCase().includes(query) ||
                          (f.ruleId && f.ruleId.toLowerCase().includes(query)) ||
                          (f.endpointId && f.endpointId.toLowerCase().includes(query));
    const matchesSeverity = severityFilter === 'ALL' || f.severity.toLowerCase() === severityFilter.toLowerCase();
    const matchesCategory = categoryFilter === 'ALL' || f.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || f.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesSeverity && matchesCategory && matchesStatus;
  });

  const methodsPresent = Array.from(new Set((scan.endpoints || []).map(e => e.method)));
  const securityTypesPresent = Array.from(new Set((scan.endpoints || []).map(e => e.securityType)));
  const categoriesPresent = Array.from(new Set(findings.map(f => f.category)));

  const riskStyle = getRiskScoreColor(scan.riskScore);

  return (
    <div className="w-full max-w-6xl flex-1 flex flex-col gap-8">
      {/* Back Link & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link to="/dashboard" className="text-sm font-semibold text-[var(--color-primary-light)] hover:underline flex items-center gap-1.5">
          ← Back to Dashboard
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="px-4 py-2.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[var(--color-primary)]/20 disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing Spec...
              </>
            ) : scan.analysisStatus === 'completed' ? (
              <>⚡ Re-run Security Analysis</>
            ) : (
              <>🛡️ Run Security Analysis</>
            )}
          </button>

          {scan.analysisStatus === 'completed' && (
            <button
              onClick={handleExportJson}
              disabled={exporting}
              className="px-4 py-2.5 bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-primary)] text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {exporting ? 'Generating JSON...' : '📥 Export JSON Report'}
            </button>
          )}
        </div>
      </div>

      {analysisError && (
        <div className="p-4 bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 rounded-xl text-[var(--color-error)] text-sm flex items-center gap-2">
          <span>⚠️ {analysisError}</span>
        </div>
      )}

      {/* API Header Info Card */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 lg:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">{scan.apiTitle}</h1>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--color-bg-input)] border border-[var(--color-border)] text-white">
                v{scan.apiVersion}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                {scan.specVersion}
              </span>
            </div>
            {scan.description && (
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed max-w-4xl">
                {scan.description}
              </p>
            )}
            
            {/* Base Servers List */}
            {scan.servers && scan.servers.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1.5">
                  Base Servers
                </span>
                <div className="flex flex-col gap-1">
                  {scan.servers.map((srv, idx) => (
                    <code key={idx} className="text-xs bg-[var(--color-bg-input)] px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-primary-light)] self-start max-w-full overflow-x-auto">
                      {srv}
                    </code>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Metrics & Risk Score Panel */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-4 shrink-0">
            {/* Risk Score Card */}
            <div className={`p-6 rounded-2xl border ${riskStyle.bg} ${riskStyle.border} min-w-[220px] flex items-center justify-between`}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block text-[var(--color-text-muted)]">Risk Score</span>
                <span className={`text-3xl font-extrabold ${riskStyle.text} mt-0.5 block`}>{scan.riskScore || 0}<span className="text-sm text-[var(--color-text-muted)] font-normal"> / 100</span></span>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${riskStyle.bg} ${riskStyle.text} border ${riskStyle.border}`}>
                {riskStyle.label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 shrink-0 bg-[var(--color-bg-dark)]/50 border border-[var(--color-border)] rounded-2xl p-6 min-w-[280px]">
              <div>
                <span className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block">Discovered</span>
                <span className="text-xl font-bold text-white mt-1 block">{scan.endpointCount} endpoints</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block">Security Issues</span>
                <span className="text-xl font-bold text-white mt-1 block">{scan.findingCount || 0} findings</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PHASE 2: SECURITY FINDINGS SECTION */}
      {scan.analysisStatus === 'completed' && (
        <div className="mb-10 flex flex-col glass-card rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="px-8 py-6 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-bg-input)]/40">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                🛡️ Static Security Analysis Findings
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--color-primary)]/20 text-[var(--color-primary-light)] border border-[var(--color-primary)]/30">
                  {findings.length} Total
                </span>
              </h2>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">Rule-based passive findings generated from OpenAPI specification metadata</p>
            </div>
          </div>

          {/* Findings Filter Bar */}
          <div className="p-6 border-b border-[var(--color-border)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-[var(--color-bg-card)]">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">🔍</span>
              <input
                type="text"
                value={findingSearch}
                onChange={(e) => setFindingSearch(e.target.value)}
                placeholder="Search rule ID, title, endpoint..."
                className="w-full pl-9 pr-3 py-2 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl text-sm text-white focus:outline-none focus:border-[var(--color-primary)]"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
                <option value="INFO">Info</option>
              </select>
            </div>

            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl text-sm text-white focus:outline-none focus:border-[var(--color-primary)]"
              >
                <option value="ALL">All Categories</option>
                {categoriesPresent.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl text-sm text-white focus:outline-none focus:border-[var(--color-primary)]"
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
          </div>

          {/* Findings Table */}
          <div className="overflow-x-auto">
            {filteredFindings.length === 0 ? (
              <div className="p-8 text-center text-sm text-[var(--color-text-muted)]">
                No security findings match your selected filters.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--color-bg-input)]/30 border-b border-[var(--color-border)]">
                    <th className="w-10"></th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Severity</th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Rule ID</th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Category</th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Title</th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Endpoint</th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {filteredFindings.map((f) => {
                    const isExpanded = !!expandedFindings[f._id];
                    return (
                      <>
                        <tr
                          key={f._id}
                          onClick={() => toggleFindingRow(f._id)}
                          className="hover:bg-[var(--color-bg-input)]/20 transition-colors cursor-pointer select-none"
                        >
                          <td className="pl-4 text-center text-xs text-[var(--color-text-muted)]">
                            {isExpanded ? '▼' : '▶'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded text-[11px] font-extrabold uppercase tracking-wide border ${getSeverityBadgeClass(f.severity)}`}>
                              {f.severity}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs font-bold text-[var(--color-primary-light)]">
                            {f.ruleId}
                          </td>
                          <td className="px-6 py-4 text-xs font-semibold text-[var(--color-text-muted)]">
                            {f.category}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-white">
                            {f.title}
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-[var(--color-text-muted)]">
                            {f.endpointId}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(f.status)}`}>
                              {f.status}
                            </span>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-[var(--color-bg-input)]/10 border-l border-r border-[var(--color-primary)]/25">
                            <td colSpan={7} className="px-10 py-6 text-sm space-y-4">
                              <div>
                                <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Description</h4>
                                <p className="text-[var(--color-text)] text-sm leading-relaxed">{f.description}</p>
                              </div>

                              <div>
                                <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Remediation Recommendation</h4>
                                <p className="text-emerald-400 text-sm font-medium leading-relaxed">{f.recommendation}</p>
                              </div>

                              {f.reference && (
                                <div>
                                  <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Security Standard Reference</h4>
                                  <a href={f.reference} target="_blank" rel="noreferrer" className="text-xs text-[var(--color-primary-light)] hover:underline font-mono">
                                    {f.reference}
                                  </a>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Endpoints Table Container */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-t-2xl p-6 border-b-0 space-y-4">
        <h2 className="text-lg font-semibold text-white">Discovered Endpoints Inventory</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">🔍</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search endpoint path..."
              className="w-full pl-9 pr-3 py-2 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-all"
            />
          </div>

          <div>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl text-sm text-white focus:outline-none focus:border-[var(--color-primary)] transition-all"
            >
              <option value="ALL">All HTTP Methods</option>
              {methodsPresent.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={authFilter}
              onChange={(e) => setAuthFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl text-sm text-white focus:outline-none focus:border-[var(--color-primary)] transition-all"
            >
              <option value="ALL">All Authentication States</option>
              <option value="AUTH">Authentication Required</option>
              <option value="NO_AUTH">No Authentication</option>
            </select>
          </div>

          <div>
            <select
              value={securityFilter}
              onChange={(e) => setSecurityFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl text-sm text-white focus:outline-none focus:border-[var(--color-primary)] transition-all"
            >
              <option value="ALL">All Security Types</option>
              {securityTypesPresent.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-b-2xl shadow-xl flex-1 overflow-hidden flex flex-col min-h-0">
        {filteredEndpoints.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-[var(--color-bg-input)] border border-[var(--color-border)] flex items-center justify-center text-xl mb-4">
              📭
            </div>
            <h3 className="text-md font-semibold text-white">No matching endpoints</h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Try adjusting your search criteria or filter configuration.</p>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[var(--color-bg-card)] border-b border-[var(--color-border)] z-10">
                <tr className="bg-[var(--color-bg-input)]/30">
                  <th className="w-12"></th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Method</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Path</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Summary</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Authentication</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Security Type</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Tags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filteredEndpoints.map((ep) => {
                  const isExpanded = !!expandedEndpoints[ep.endpointId];
                  return (
                    <>
                      <tr
                        key={ep.endpointId}
                        onClick={() => toggleEndpointRow(ep.endpointId)}
                        className="hover:bg-[var(--color-bg-input)]/20 transition-colors cursor-pointer select-none"
                      >
                        <td className="pl-4 text-center text-sm text-[var(--color-text-muted)]">
                          {isExpanded ? '▼' : '▶'}
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono tracking-wide ${getMethodBadgeClass(ep.method)}`}>
                            {ep.method}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 font-mono text-sm text-white select-all">
                          {ep.path}
                        </td>
                        <td className="px-6 py-3.5 text-sm text-[var(--color-text)] max-w-xs truncate" title={ep.summary}>
                          {ep.summary || <span className="text-[var(--color-text-muted)] italic">No summary</span>}
                        </td>
                        <td className="px-6 py-3.5 text-sm">
                          {ep.requiresAuth ? (
                            <span className="inline-flex items-center gap-1 text-[var(--color-primary-light)]">
                              🛡️ Required
                            </span>
                          ) : (
                            <span className="text-[var(--color-text-muted)]">🔓 Optional</span>
                          )}
                        </td>
                        <td className="px-6 py-3.5 text-sm">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                            ep.securityType !== 'None' 
                              ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary-light)] border-[var(--color-primary)]/20' 
                              : 'bg-[var(--color-bg-input)] text-[var(--color-text-muted)] border-transparent'
                          }`}>
                            {ep.securityType}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-xs text-[var(--color-text-muted)] max-w-[150px] truncate" title={ep.tags.join(', ')}>
                          {ep.tags.length > 0 ? ep.tags.join(', ') : '—'}
                        </td>
                      </tr>
                      {/* Expanded Details Row */}
                      {isExpanded && (
                        <tr className="bg-[var(--color-bg-input)]/10 border-l border-r border-[var(--color-primary)]/25">
                          <td colSpan={7} className="px-10 py-6 text-sm">
                            <div className="space-y-4">
                              {ep.description && (
                                <div className="space-y-1">
                                  <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Description</h4>
                                  <p className="text-[var(--color-text)] leading-relaxed">{ep.description}</p>
                                </div>
                              )}

                              {ep.operationId && (
                                <div className="space-y-1">
                                  <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider font-mono">Operation ID</h4>
                                  <code className="text-xs text-[var(--color-primary-light)]">{ep.operationId}</code>
                                </div>
                              )}

                              <div className="flex items-center gap-1.5">
                                <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Request Body Required:</h4>
                                <span className={`text-xs font-medium ${ep.requestBodyPresent ? 'text-[var(--color-primary-light)] font-semibold' : 'text-[var(--color-text-muted)]'}`}>
                                  {ep.requestBodyPresent ? 'Yes' : 'No'}
                                </span>
                              </div>

                              <div className="space-y-2">
                                <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Parameters Schema</h4>
                                {ep.parameters && ep.parameters.length > 0 ? (
                                  <div className="border border-[var(--color-border)] rounded-xl overflow-hidden max-w-3xl">
                                    <table className="w-full text-left border-collapse text-xs">
                                      <thead>
                                        <tr className="bg-[var(--color-bg-input)] text-[var(--color-text-muted)] font-medium border-b border-[var(--color-border)]">
                                          <th className="px-4 py-2">Parameter Name</th>
                                          <th className="px-4 py-2">Location</th>
                                          <th className="px-4 py-2">Required</th>
                                          <th className="px-4 py-2">Type</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-[var(--color-border)]">
                                        {ep.parameters.map((p, pIdx) => (
                                          <tr key={pIdx} className="hover:bg-[var(--color-bg-input)]/25">
                                            <td className="px-4 py-2 font-mono text-white font-semibold">{p.name}</td>
                                            <td className="px-4 py-2 capitalize font-mono">{p.location}</td>
                                            <td className="px-4 py-2">
                                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${p.required ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-500/10 text-slate-400'}`}>
                                                {p.required ? 'True' : 'False'}
                                              </span>
                                            </td>
                                            <td className="px-4 py-2 font-mono">{p.type}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <p className="text-xs text-[var(--color-text-muted)] italic">No parameters defined</p>
                                )}
                              </div>

                              <div className="space-y-1.5">
                                <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Defined Response Codes</h4>
                                <div className="flex flex-wrap gap-1.5">
                                  {ep.responseCodes && ep.responseCodes.length > 0 ? (
                                    ep.responseCodes.map(code => {
                                      let codeColor = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
                                      if (code.startsWith('2')) codeColor = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25';
                                      if (code.startsWith('3')) codeColor = 'bg-amber-500/15 text-amber-400 border-amber-500/25';
                                      if (code.startsWith('4')) codeColor = 'bg-rose-500/15 text-rose-400 border-rose-500/25';
                                      if (code.startsWith('5')) codeColor = 'bg-red-600/20 text-red-400 border-red-600/30';
                                      return (
                                        <span key={code} className={`px-2 py-0.5 rounded-lg text-xs font-mono font-semibold border ${codeColor}`}>
                                          {code}
                                        </span>
                                      );
                                    })
                                  ) : (
                                    <span className="text-xs text-[var(--color-text-muted)] italic">None documented</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanDetails;
