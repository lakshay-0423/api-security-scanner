import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getScans } from '../services/scanService';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await getScans();
        setScans(res.data || []);
      } catch (err) {
        setError('Failed to load dashboard statistics.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner />;

  const completedScans = scans.filter(s => s.status === 'completed');
  const analyzedScans = completedScans.filter(s => s.analysisStatus === 'completed');
  
  const totalScansCount = scans.length;
  const totalEndpointsCount = completedScans.reduce((sum, scan) => sum + (scan.endpointCount || 0), 0);
  const totalFindingsCount = completedScans.reduce((sum, scan) => sum + (scan.findingCount || 0), 0);

  const averageRiskScore = analyzedScans.length > 0
    ? Math.round(analyzedScans.reduce((sum, s) => sum + (s.riskScore || 0), 0) / analyzedScans.length)
    : 0;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRiskScoreBadge = (score = 0, status) => {
    if (status !== 'completed') {
      return <span className="text-xs text-[var(--color-text-muted)] italic">Not Analyzed</span>;
    }
    let colorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (score > 70) colorClass = 'bg-red-500/15 text-red-400 border-red-500/30';
    else if (score > 40) colorClass = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    else if (score > 20) colorClass = 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30';

    return (
      <span className={`px-3 py-1 rounded-lg text-xs font-bold font-mono border ${colorClass}`}>
        {score} / 100
      </span>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[var(--color-border)]/40">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight leading-snug">Security Dashboard</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Overview of your scanned API specifications & passive security analysis
          </p>
        </div>
        <Link
          to="/scans/new"
          className="self-start sm:self-auto px-5 py-2.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white text-sm font-semibold rounded-xl hover:opacity-90 hover:shadow-lg hover:shadow-[var(--color-primary)]/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Scan
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 rounded-xl text-[var(--color-error)] text-sm flex items-center gap-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Average Risk Score Card */}
        <div className="glass-card glass-card-hover stat-card">
          <div className="flex items-center justify-between gap-3 mb-4">
            <span className="stat-card-title">Avg Risk Score</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-lg shrink-0">
              🛡️
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="stat-card-value">{averageRiskScore}</span>
            <span className="text-xs text-[var(--color-text-muted)] font-medium">/ 100</span>
          </div>
        </div>

        {/* Total Security Findings */}
        <div className="glass-card glass-card-hover stat-card">
          <div className="flex items-center justify-between gap-3 mb-4">
            <span className="stat-card-title">Total Findings</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-lg shrink-0">
              ⚠️
            </div>
          </div>
          <span className="stat-card-value text-amber-400">{totalFindingsCount}</span>
        </div>

        {/* Endpoints Discovered */}
        <div className="glass-card glass-card-hover stat-card">
          <div className="flex items-center justify-between gap-3 mb-4">
            <span className="stat-card-title">Endpoints Found</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg shrink-0">
              🌐
            </div>
          </div>
          <span className="stat-card-value">{totalEndpointsCount}</span>
        </div>

        {/* Total Scans Card */}
        <div className="glass-card glass-card-hover stat-card">
          <div className="flex items-center justify-between gap-3 mb-4">
            <span className="stat-card-title">Total Scans</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-lg shrink-0">
              🔍
            </div>
          </div>
          <span className="stat-card-value">{totalScansCount}</span>
        </div>
      </div>

      {/* Recent Scans Table Section */}
      <div className="flex-1 flex flex-col min-h-0 glass-card rounded-2xl shadow-xl overflow-hidden border border-[var(--color-border)]">
        {/* Table Header */}
        <div className="px-8 py-5 border-b border-[var(--color-border)] bg-[var(--color-bg-input)]/40 flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-wide">Recent API Scans & Risk Analysis</h2>
          {totalScansCount > 0 && (
            <Link to="/scans/history" className="text-xs font-semibold text-[var(--color-primary-light)] hover:text-[var(--color-primary)] transition-colors">
              View All →
            </Link>
          )}
        </div>

        {/* Scans Content */}
        {scans.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-14 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-input)] border border-[var(--color-border)] flex items-center justify-center text-3xl mb-4 shadow-inner">
              📭
            </div>
            <h3 className="text-base font-semibold text-white">No scans found</h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-2 max-w-sm leading-relaxed">
              Upload an OpenAPI/Swagger definition file or provide a URL to discover API endpoints and run security analysis.
            </p>
            <Link
              to="/scans/new"
              className="mt-6 px-5 py-2.5 bg-[var(--color-bg-input)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary-light)] border border-[var(--color-border)] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              Get Started
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1 min-h-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--color-bg-input)]/30 border-b border-[var(--color-border)]">
                  <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">API Title</th>
                  <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Version</th>
                  <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Endpoints</th>
                  <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Risk Score</th>
                  <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Findings</th>
                  <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Scan Date</th>
                  <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {scans.slice(0, 6).map((scan) => (
                  <tr key={scan._id} className="hover:bg-[var(--color-bg-input)]/20 transition-colors">
                    <td className="px-8 py-4">
                      {scan.status === 'completed' ? (
                        <Link to={`/scans/${scan._id}`} className="font-semibold text-sm text-[var(--color-primary-light)] hover:underline truncate max-w-[220px] block">
                          {scan.apiTitle}
                        </Link>
                      ) : (
                        <span className="font-semibold text-sm text-[var(--color-text-muted)] truncate max-w-[220px] block">
                          {scan.fileName}
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-4 text-xs font-mono text-[var(--color-text)]">
                      {scan.status === 'completed' ? `v${scan.apiVersion}` : '—'}
                    </td>
                    <td className="px-8 py-4 text-xs font-semibold text-[var(--color-text)]">
                      {scan.status === 'completed' ? scan.endpointCount : '0'}
                    </td>
                    <td className="px-8 py-4 text-sm">
                      {getRiskScoreBadge(scan.riskScore, scan.analysisStatus)}
                    </td>
                    <td className="px-8 py-4 text-xs text-[var(--color-text-muted)]">
                      {scan.analysisStatus === 'completed' ? (
                        <span className="font-semibold text-amber-400">{scan.findingCount || 0} findings</span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-8 py-4 text-xs text-[var(--color-text-muted)]">
                      {formatDate(scan.uploadedAt)}
                    </td>
                    <td className="px-8 py-4 text-sm text-right">
                      {scan.status === 'completed' && (
                        <Link to={`/scans/${scan._id}`} className="px-3.5 py-1.5 bg-[var(--color-bg-input)] hover:bg-[var(--color-primary)] hover:text-white border border-[var(--color-border)] rounded-lg text-xs font-medium text-white transition-all cursor-pointer">
                          View Details
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
