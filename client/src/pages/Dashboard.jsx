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
      return <span className="text-xs text-[var(--color-text-muted)]">—</span>;
    }
    let colorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (score > 70) colorClass = 'bg-red-500/10 text-red-400 border-red-500/20';
    else if (score > 40) colorClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    else if (score > 20) colorClass = 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20';

    return (
      <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold font-mono border ${colorClass}`}>
        {score}/100
      </span>
    );
  };

  const kpiCards = [
    {
      label: 'Avg Risk Score',
      value: averageRiskScore,
      suffix: '/100',
      color: 'text-blue-400',
      iconBg: 'bg-blue-500/10 text-blue-400',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      )
    },
    {
      label: 'Security Findings',
      value: totalFindingsCount,
      color: 'text-amber-400',
      iconBg: 'bg-amber-500/10 text-amber-400',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    {
      label: 'Endpoints Found',
      value: totalEndpointsCount,
      color: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      )
    },
    {
      label: 'Total Scans',
      value: totalScansCount,
      color: 'text-purple-400',
      iconBg: 'bg-purple-500/10 text-purple-400',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      )
    }
  ];

  return (
    <div className="w-full max-w-6xl flex-1 flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Security Dashboard</h1>
          <p className="text-[13px] text-[var(--color-text-muted)] mt-0.5">
            API specification scan overview &amp; passive security analysis
          </p>
        </div>
        <Link
          to="/scans/new"
          className="btn-primary shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Scan
        </Link>
      </div>

      {error && (
        <div className="p-3.5 bg-[var(--color-error)]/8 border border-[var(--color-error)]/20 rounded-lg text-[var(--color-error)] text-[13px] flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpiCards.map((card) => (
          <div key={card.label} className="glass-card glass-card-hover stat-card">
            <div className="flex items-center justify-between">
              <span className="stat-card-label">{card.label}</span>
              <div className={`w-8 h-8 rounded-lg ${card.iconBg} flex items-center justify-center shrink-0`}>
                {card.icon}
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={`stat-card-value ${card.color}`}>{card.value}</span>
              {card.suffix && <span className="text-xs text-[var(--color-text-muted)] font-medium">{card.suffix}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Scans Table */}
      <div className="flex-1 flex flex-col min-h-0 glass-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[var(--color-border)] flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-white">Recent Scans</h2>
          {totalScansCount > 0 && (
            <Link to="/scans/history" className="text-xs font-medium text-[var(--color-primary-light)] hover:text-[var(--color-primary)] transition-colors">
              View all →
            </Link>
          )}
        </div>

        {scans.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-bg-input)] border border-[var(--color-border)] flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white">No scans yet</h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-1.5 max-w-xs leading-relaxed">
              Upload an OpenAPI or Swagger specification to discover endpoints and run passive security analysis.
            </p>
            <Link
              to="/scans/new"
              className="btn-secondary mt-5"
            >
              Get started
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1 min-h-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">API Title</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Version</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Endpoints</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Risk Score</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Findings</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Scanned</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {scans.slice(0, 6).map((scan) => (
                  <tr key={scan._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      {scan.status === 'completed' ? (
                        <Link to={`/scans/${scan._id}`} className="font-medium text-[13px] text-[var(--color-primary-light)] hover:underline truncate max-w-[200px] block">
                          {scan.apiTitle}
                        </Link>
                      ) : (
                        <span className="font-medium text-[13px] text-[var(--color-text-muted)] truncate max-w-[200px] block">
                          {scan.fileName}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono text-[var(--color-text)]">
                      {scan.status === 'completed' ? `v${scan.apiVersion}` : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-medium text-[var(--color-text)]">
                      {scan.status === 'completed' ? scan.endpointCount : '0'}
                    </td>
                    <td className="px-5 py-3.5">
                      {getRiskScoreBadge(scan.riskScore, scan.analysisStatus)}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[var(--color-text-muted)]">
                      {scan.analysisStatus === 'completed' ? (
                        <span className="font-medium text-amber-400">{scan.findingCount || 0}</span>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[var(--color-text-muted)]">
                      {formatDate(scan.uploadedAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {scan.status === 'completed' && (
                        <Link to={`/scans/${scan._id}`} className="btn-secondary !py-1.5 !px-3 !text-xs">
                          View
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
