import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getScanById } from '../services/scanService';
import LoadingSpinner from '../components/LoadingSpinner';

const ScanDetails = () => {
  const { id } = useParams();
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [authFilter, setAuthFilter] = useState('ALL');
  const [securityFilter, setSecurityFilter] = useState('ALL');
  
  // Expanded row tracking (endpointId)
  const [expandedEndpoints, setExpandedEndpoints] = useState({});

  useEffect(() => {
    const fetchScanDetails = async () => {
      try {
        const res = await getScanById(id);
        setScan(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load scan details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchScanDetails();
  }, [id]);

  const toggleRow = (endpointId) => {
    setExpandedEndpoints(prev => ({
      ...prev,
      [endpointId]: !prev[endpointId]
    }));
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
  const filteredEndpoints = scan.endpoints.filter(ep => {
    // Path search
    const matchesSearch = ep.path.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Method filter
    const matchesMethod = methodFilter === 'ALL' || ep.method === methodFilter;
    
    // Auth filter
    const matchesAuth = authFilter === 'ALL' || 
      (authFilter === 'AUTH' && ep.requiresAuth) || 
      (authFilter === 'NO_AUTH' && !ep.requiresAuth);
      
    // Security type filter
    const matchesSecurity = securityFilter === 'ALL' || ep.securityType === securityFilter;
    
    return matchesSearch && matchesMethod && matchesAuth && matchesSecurity;
  });

  // Extract all methods present in the spec for filtering options
  const methodsPresent = Array.from(new Set(scan.endpoints.map(e => e.method)));
  
  // Extract all security types present in the spec for filtering options
  const securityTypesPresent = Array.from(new Set(scan.endpoints.map(e => e.securityType)));

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 w-full flex-1 flex flex-col min-h-0">
      {/* Back Link */}
      <div className="mb-6">
        <Link to="/dashboard" className="text-sm font-semibold text-[var(--color-primary-light)] hover:underline flex items-center gap-1.5">
          ← Back to Dashboard
        </Link>
      </div>

      {/* API Header Info Card */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 mb-8 shadow-xl">
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
            
            {/* Servers List */}
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

          {/* Quick Metrics Panel */}
          <div className="grid grid-cols-2 gap-4 shrink-0 bg-[var(--color-bg-dark)]/50 border border-[var(--color-border)] rounded-xl p-4 min-w-[280px]">
            <div>
              <span className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block">Discovered</span>
              <span className="text-xl font-bold text-white mt-1 block">{scan.endpointCount} endpoints</span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block">Scan Duration</span>
              <span className="text-xl font-bold text-white mt-1 block">{scan.scanDuration} ms</span>
            </div>
            <div className="col-span-2 border-t border-[var(--color-border)] pt-2.5 mt-1">
              <span className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block">Auth Detected</span>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {scan.authTypes && scan.authTypes.length > 0 ? (
                  scan.authTypes.map(t => (
                    <span key={t} className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[var(--color-primary)]/10 text-[var(--color-primary-light)] border border-[var(--color-primary)]/20">
                      {t}
                    </span>
                  ))
                ) : (
                  <span className="text-xs font-semibold text-[var(--color-error)]">None</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Filters */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-t-2xl p-5 border-b-0 space-y-4">
        <h2 className="text-lg font-semibold text-white">Discovered Endpoints Inventory</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Path Search */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">🔍</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search endpoint path..."
              className="w-full pl-9 pr-3 py-2 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
            />
          </div>

          {/* Method Filter */}
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

          {/* Auth Required Filter */}
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

          {/* Security Type Filter */}
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

      {/* Endpoints Table View */}
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
                        onClick={() => toggleRow(ep.endpointId)}
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
                          <td colSpan={7} className="px-8 py-5 text-sm">
                            <div className="space-y-4">
                              {/* Description */}
                              {ep.description && (
                                <div className="space-y-1">
                                  <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Description</h4>
                                  <p className="text-[var(--color-text)] leading-relaxed">{ep.description}</p>
                                </div>
                              )}

                              {/* OperationId */}
                              {ep.operationId && (
                                <div className="space-y-1">
                                  <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider font-mono">Operation ID</h4>
                                  <code className="text-xs text-[var(--color-primary-light)]">{ep.operationId}</code>
                                </div>
                              )}

                              {/* Request Body presence */}
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Request Body Required:</h4>
                                <span className={`text-xs font-medium ${ep.requestBodyPresent ? 'text-[var(--color-primary-light)] font-semibold' : 'text-[var(--color-text-muted)]'}`}>
                                  {ep.requestBodyPresent ? 'Yes' : 'No'}
                                </span>
                              </div>

                              {/* Parameters Table */}
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

                              {/* Response Codes */}
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
