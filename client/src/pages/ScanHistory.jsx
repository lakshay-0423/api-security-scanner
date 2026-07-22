import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getScans, deleteScan } from '../services/scanService';
import LoadingSpinner from '../components/LoadingSpinner';

const ScanHistory = () => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null); // ID for confirmation
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
    <div className="max-w-7xl mx-auto px-6 py-8 w-full flex-1 flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-wide">Scan History</h1>
        <p className="text-[var(--color-text-muted)] mt-1">Review and manage past API inventory inventories.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 rounded-xl text-[var(--color-error)] text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}

      {/* Main Table Container */}
      <div className="flex-1 flex flex-col bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-xl overflow-hidden min-h-0">
        {scans.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--color-bg-input)] border border-[var(--color-border)] flex items-center justify-center text-2xl mb-4">
              📚
            </div>
            <h3 className="text-lg font-semibold text-white">No scans recorded</h3>
            <p className="text-sm text-[var(--color-text-muted)] mt-1.5 max-w-sm">
              Your previous scan reports will appear here once you create them.
            </p>
            <Link
              to="/scans/new"
              className="mt-6 px-4 py-2.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white text-sm font-medium rounded-xl transition-all cursor-pointer"
            >
              Start Your First Scan
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1 min-h-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--color-bg-input)]/30 border-b border-[var(--color-border)]">
                  <th className="px-6 py-4.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">API Title</th>
                  <th className="px-6 py-4.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Version</th>
                  <th className="px-6 py-4.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Source</th>
                  <th className="px-6 py-4.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Location</th>
                  <th className="px-6 py-4.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Endpoints</th>
                  <th className="px-6 py-4.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Scanned On</th>
                  <th className="px-6 py-4.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Status</th>
                  <th className="px-6 py-4.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {scans.map((scan) => (
                  <tr key={scan._id} className="hover:bg-[var(--color-bg-input)]/20 transition-colors">
                    <td className="px-6 py-4.5">
                      {scan.status === 'completed' ? (
                        <Link to={`/scans/${scan._id}`} className="font-semibold text-[var(--color-primary-light)] hover:underline truncate max-w-[180px] block">
                          {scan.apiTitle}
                        </Link>
                      ) : (
                        <span className="font-semibold text-[var(--color-text-muted)] truncate max-w-[180px] block">
                          {scan.fileName}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4.5 text-sm text-[var(--color-text)]">
                      {scan.status === 'completed' ? `v${scan.apiVersion}` : '—'}
                    </td>
                    <td className="px-6 py-4.5 text-sm">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        scan.sourceType === 'url' 
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                          : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                      }`}>
                        {scan.sourceType}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-sm text-[var(--color-text-muted)] max-w-[200px] truncate" title={scan.sourceLocation}>
                      {scan.sourceLocation}
                    </td>
                    <td className="px-6 py-4.5 text-sm text-[var(--color-text)]">
                      {scan.status === 'completed' ? scan.endpointCount : '0'}
                    </td>
                    <td className="px-6 py-4.5 text-sm text-[var(--color-text-muted)]">
                      {formatDate(scan.uploadedAt)}
                    </td>
                    <td className="px-6 py-4.5 text-sm">
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
                            : 'bg-[var(--color-warning)]'
                        }`} />
                        {scan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-sm text-right space-x-2">
                      {scan.status === 'completed' && (
                        <Link to={`/scans/${scan._id}`} className="px-2.5 py-1.5 bg-[var(--color-bg-input)] hover:bg-[var(--color-primary)] hover:text-white border border-[var(--color-border)] rounded-lg text-xs font-medium text-white transition-all cursor-pointer">
                          View
                        </Link>
                      )}
                      <button
                        onClick={() => handleDeleteClick(scan._id)}
                        className="px-2.5 py-1.5 bg-[var(--color-bg-input)] hover:bg-[var(--color-error)]/10 hover:text-[var(--color-error)] border border-[var(--color-border)] hover:border-[var(--color-error)]/30 rounded-lg text-xs font-medium text-[var(--color-text-muted)] transition-all cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-white">Delete Scan Report</h3>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
              Are you sure you want to delete this scan report? This action is permanent and cannot be undone. All discovered endpoints will be removed from your database inventory.
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="px-4 py-2 border border-[var(--color-border)] text-sm font-medium rounded-xl text-[var(--color-text-muted)] hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-4 py-2 bg-[var(--color-error)] text-white text-sm font-medium rounded-xl hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
