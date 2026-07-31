import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getScans, deleteScan } from '../services/scanService';
import LoadingSpinner from '../components/LoadingSpinner';

const ScanHistory = () => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await getScans();
      setScans(res.data || []);
    } catch (err) {
      setError('Failed to fetch scan history.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDeleteClick = (id) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    setError('');
    
    try {
      await deleteScan(deleteId);
      setScans(scans.filter(s => s._id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      setError('Failed to delete the scan report. Please try again.');
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="w-full max-w-6xl flex-1 flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Scan History</h1>
          <p className="text-[13px] text-[var(--color-text-muted)] mt-0.5">
            Review and manage your previous API security scans.
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

      {/* Main Table Container */}
      <div className="flex-1 flex flex-col glass-card overflow-hidden min-h-0">
        {scans.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-bg-input)] border border-[var(--color-border)] flex items-center justify-center mb-4 text-[var(--color-text-muted)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white">No scan history</h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-1.5 max-w-xs leading-relaxed">
              Your previous scan reports will appear here once you perform a scan.
            </p>
            <Link
              to="/scans/new"
              className="btn-secondary mt-5"
            >
              Start your first scan
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1 min-h-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">API Title</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Version</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Source</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Location</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Endpoints</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Scanned</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Status</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {scans.map((scan) => (
                  <tr key={scan._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      {scan.status === 'completed' ? (
                        <Link to={`/scans/${scan._id}`} className="font-medium text-[13px] text-[var(--color-primary-light)] hover:underline truncate max-w-[180px] block">
                          {scan.apiTitle}
                        </Link>
                      ) : (
                        <span className="font-medium text-[13px] text-[var(--color-text-muted)] truncate max-w-[180px] block">
                          {scan.fileName}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono text-[var(--color-text)]">
                      {scan.status === 'completed' ? `v${scan.apiVersion}` : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        scan.sourceType === 'url' 
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                          : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                      }`}>
                        {scan.sourceType}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[var(--color-text-muted)] max-w-[180px] truncate" title={scan.sourceLocation}>
                      {scan.sourceLocation}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-medium text-[var(--color-text)]">
                      {scan.status === 'completed' ? scan.endpointCount : '0'}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[var(--color-text-muted)]">
                      {formatDate(scan.uploadedAt)}
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${
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
                            : 'bg-[var(--color-warning)]'
                        }`} />
                        {scan.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      {scan.status === 'completed' && (
                        <Link to={`/scans/${scan._id}`} className="btn-secondary !py-1.2 !px-2.5 !text-xs">
                          View
                        </Link>
                      )}
                      <button
                        onClick={() => handleDeleteClick(scan._id)}
                        className="btn-secondary !py-1.2 !px-2.5 !text-xs hover:!text-[var(--color-error)] hover:!border-[var(--color-error)]/30"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="glass-card w-full max-w-md p-6 flex flex-col gap-4">
            <h3 className="text-base font-bold text-white">Delete Scan Report</h3>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              Are you sure you want to delete this scan report? This action is permanent and cannot be undone. All discovered endpoints will be removed from your database inventory.
            </p>
            <div className="flex gap-2.5 justify-end pt-2">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="btn-secondary !py-1.5 !px-3.5 !text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="btn-primary !bg-[var(--color-error)] hover:!bg-red-600 !py-1.5 !px-3.5 !text-xs"
              >
                {deleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Confirm Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanHistory;
