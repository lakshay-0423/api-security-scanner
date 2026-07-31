import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, Plus, Trash2, ExternalLink } from 'lucide-react';
import { useScans } from '../hooks/useScans';
import { formatDate } from '../utils/formatters';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Table, { TableRow, TableCell } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import SearchBox from '../components/ui/SearchBox';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/LoadingSkeleton';

export const ScanHistory = () => {
  const { scans, loading, fetchScans, removeScan } = useScans();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchScans();
  }, [fetchScans]);

  const filteredScans = scans.filter((scan) => {
    const term = searchQuery.toLowerCase();
    return (
      (scan.apiTitle && scan.apiTitle.toLowerCase().includes(term)) ||
      (scan.fileName && scan.fileName.toLowerCase().includes(term)) ||
      (scan.sourceLocation && scan.sourceLocation.toLowerCase().includes(term))
    );
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    await removeScan(deleteId);
    setDeleting(false);
    setDeleteId(null);
  };

  const headers = ['API Title', 'Version', 'Source', 'Location', 'Endpoints', 'Scanned Date', 'Status', { label: 'Actions', align: 'right' }];

  return (
    <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col gap-6 animate-fade-in">
      <PageHeader
        title="Scan History"
        description="Review, search, and manage your previously analyzed API specifications inventory."
        action={
          <Link to="/scans/new">
            <Button icon={Plus}>New Scan</Button>
          </Link>
        }
      />

      {loading ? (
        <TableSkeleton rows={6} cols={7} />
      ) : (
        <Card className="flex-1 flex flex-col min-h-0 !p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">All Scans ({scans.length})</h3>
            <SearchBox value={searchQuery} onChange={setSearchQuery} placeholder="Search scans by title or location..." />
          </div>

          {filteredScans.length === 0 ? (
            <EmptyState
              icon={History}
              title={searchQuery ? 'No matching scans found' : 'No scan history recorded'}
              description={
                searchQuery
                  ? `No scans match "${searchQuery}". Try clearing your search.`
                  : 'Your previous scan reports will appear here once you run your first API scan.'
              }
              actionLabel={searchQuery ? 'Clear Search' : 'Start your first scan'}
              onAction={() => (searchQuery ? setSearchQuery('') : null)}
              actionTo={searchQuery ? null : '/scans/new'}
            />
          ) : (
            <Table headers={headers}>
              {filteredScans.map((scan) => (
                <TableRow key={scan._id}>
                  <TableCell>
                    {scan.status === 'completed' ? (
                      <Link to={`/scans/${scan._id}`} className="font-semibold text-xs text-blue-400 hover:underline flex items-center gap-1.5 truncate max-w-[180px]">
                        {scan.apiTitle}
                        <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" />
                      </Link>
                    ) : (
                      <span className="font-semibold text-xs text-slate-400 truncate max-w-[180px] block">
                        {scan.fileName}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-300">
                    {scan.status === 'completed' ? `v${scan.apiVersion}` : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={scan.sourceType === 'url' ? 'purple' : 'neutral'} size="sm">
                      {scan.sourceType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-400 text-xs truncate max-w-[180px]" title={scan.sourceLocation}>
                    {scan.sourceLocation}
                  </TableCell>
                  <TableCell className="font-semibold text-xs">
                    {scan.status === 'completed' ? scan.endpointCount : '0'}
                  </TableCell>
                  <TableCell className="text-slate-400 text-xs">{formatDate(scan.uploadedAt)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={scan.status === 'completed' ? 'success' : scan.status === 'failed' ? 'danger' : 'warning'}
                      dot
                    >
                      {scan.status}
                    </Badge>
                  </TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-2">
                      {scan.status === 'completed' && (
                        <Link to={`/scans/${scan._id}`}>
                          <Button variant="secondary" size="sm">
                            View
                          </Button>
                        </Link>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        onClick={() => setDeleteId(scan._id)}
                        className="hover:text-red-400"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          )}
        </Card>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        title="Delete Scan Report"
        description="Are you sure you want to delete this scan report? This action is permanent and will remove all mapped endpoints and findings from inventory."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" loading={deleting} onClick={handleDelete}>
              Confirm Delete
            </Button>
          </>
        }
      />
    </div>
  );
};

export default ScanHistory;
