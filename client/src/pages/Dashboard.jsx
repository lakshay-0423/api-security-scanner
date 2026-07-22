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

  // Calculate stats
  const completedScans = scans.filter(s => s.status === 'completed');
  const totalScansCount = scans.length;
  
  const totalEndpointsCount = completedScans.reduce(
    (sum, scan) => sum + (scan.endpointCount || 0),
    0
  );

  const latestScan = scans[0] || null;

  // Compile unique authentication types found across all completed scans
  const authTypesSet = new Set();
  completedScans.forEach(scan => {
    if (scan.authTypes && Array.isArray(scan.authTypes)) {
      scan.authTypes.forEach(type => authTypesSet.add(type));
    }
  });
  const authTypesFound = Array.from(authTypesSet);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 w-full flex-1 flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-wide">Security Dashboard</h1>
          <p className="text-[var(--color-text-muted)] mt-1">Overview of your scanned API specifications</p>
        </div>
        <Link
          to="/scans/new"
          className="self-start sm:self-auto px-5 py-2.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white font-medium rounded-xl hover:opacity-90 hover:shadow-lg hover:shadow-[var(--color-primary)]/10 transition-all duration-200 flex items-center gap-2 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Scan
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 rounded-xl text-[var(--color-error)] text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Total Scans Card */}
        <div className="glass-card glass-card-hover rounded-2xl p-6 relative overflow-hidden group">
          <p className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Total Scans</p>
          <p className="text-4xl font-extrabold text-white mt-2">{totalScansCount}</p>
          <div className="absolute right-4 bottom-4 text-3xl opacity-10 group-hover:opacity-20 transition-opacity">🔍</div>
        </div>

        {/* Total Endpoints Discovered */}
        <div className="glass-card glass-card-hover rounded-2xl p-6 relative overflow-hidden group">
          <p className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Endpoints Discovered</p>
          <p className="text-4xl font-extrabold text-white mt-2">{totalEndpointsCount}</p>
          <div className="absolute right-4 bottom-4 text-3xl opacity-10 group-hover:opacity-20 transition-opacity">🌐</div>
        </div>

        {/* Latest Scan */}
        <div className="glass-card glass-card-hover rounded-2xl p-6 relative overflow-hidden group">
          <p className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Latest Scan</p>
          {latestScan ? (
            <div className="mt-2.5">
              <p className="text-lg font-bold text-white truncate max-w-[190px]" title={latestScan.apiTitle}>{latestScan.apiTitle}</p>
              <p className="text-xs text-[var(--color-text-muted)] truncate mt-1">v{latestScan.apiVersion} • {latestScan.endpointCount} endpoints</p>
            </div>
          ) : (
            <p className="text-2xl font-bold text-[var(--color-text-muted)] mt-2">No scans yet</p>
          )}
          <div className="absolute right-4 bottom-4 text-3xl opacity-10 group-hover:opacity-20 transition-opacity">🕒</div>
        </div>

        {/* Authentication Types Found */}
        <div className="glass-card glass-card-hover rounded-2xl p-6 relative overflow-hidden group">
          <p className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Auth Schemes Found</p>
          {authTypesFound.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-3 max-h-[52px] overflow-hidden">
              {authTypesFound.map(type => (
                <span
                  key={type}
                  className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[var(--color-primary)]/10 text-[var(--color-primary-light)] border border-[var(--color-primary)]/20"
                >
                  {type}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-2xl font-bold text-[var(--color-text-muted)] mt-2">None detected</p>
          )}
          <div className="absolute right-4 bottom-4 text-3xl opacity-10 group-hover:opacity-20 transition-opacity">🛡️</div>
        </div>
      </div>

      {/* Main Section */}
      <div className="flex-1 flex flex-col min-h-0 glass-card rounded-2xl shadow-xl overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-5 border-b border-[var(--color-border)] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Scans</h2>
          {totalScansCount > 0 && (
            <Link to="/scans/history" className="text-xs font-semibold text-[var(--color-primary-light)] hover:text-[var(--color-primary)] transition-colors">
              View History →
            </Link>
          )}
        </div>

        {/* Scans Content */}
        {scans.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--color-bg-input)] border border-[var(--color-border)] flex items-center justify-center text-2xl mb-4">
              📭
            </div>
            <h3 className="text-lg font-semibold text-white">No scans found</h3>
            <p className="text-sm text-[var(--color-text-muted)] mt-1.5 max-w-sm">
              Upload an OpenAPI/Swagger definition file or provide a URL to discover API endpoints.
            </p>
            <Link
              to="/scans/new"
              className="mt-6 px-4 py-2.5 bg-[var(--color-bg-input)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary-light)] hover:border-[var(--color-primary)]/30 border border-[var(--color-border)] text-white text-sm font-medium rounded-xl transition-all cursor-pointer"
            >
              Get Started
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1 min-h-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--color-bg-input)]/30 border-b border-[var(--color-border)]">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">API Title</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Version</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Endpoints</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Source</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Scan Date</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {scans.slice(0, 5).map((scan) => (
                  <tr key={scan._id} className="hover:bg-[var(--color-bg-input)]/20 transition-colors">
                    <td className="px-6 py-4">
                      {scan.status === 'completed' ? (
                        <Link to={`/scans/${scan._id}`} className="font-semibold text-[var(--color-primary-light)] hover:underline truncate max-w-[200px] block">
                          {scan.apiTitle}
                        </Link>
                      ) : (
                        <span className="font-semibold text-[var(--color-text-muted)] truncate max-w-[200px] block">
                          {scan.fileName}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-text)]">
                      {scan.status === 'completed' ? `v${scan.apiVersion}` : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-text)]">
                      {scan.status === 'completed' ? scan.endpointCount : '0'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        scan.sourceType === 'url' 
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                          : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                      }`}>
                        {scan.sourceType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-text-muted)]">
                      {formatDate(scan.uploadedAt)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        scan.status === 'completed' 
                          ? 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20'
                          : scan.status === 'failed'
                          ? 'bg-[var(--color-error)]/10 text-[var(--color-error)] border-[var(--color-error)]/20'
                          : 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          scan.status === 'completed' 
                            ? 'bg-[var(--color-success)]'
                            : scan.status === 'failed'
                            ? 'bg-[var(--color-error)]'
                            : 'bg-[var(--color-warning)] animate-pulse'
                        }`} />
                        {scan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      {scan.status === 'completed' && (
                        <Link to={`/scans/${scan._id}`} className="px-3 py-1.5 bg-[var(--color-bg-input)] hover:bg-[var(--color-primary)] hover:text-white border border-[var(--color-border)] rounded-lg text-xs font-medium text-white transition-all cursor-pointer">
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
