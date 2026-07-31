import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, Globe, Search, Plus, ArrowRight, FileText } from 'lucide-react';
import { useScans } from '../hooks/useScans';
import { formatDate, formatRiskScore } from '../utils/formatters';
import { getRiskScoreColor } from '../utils/severity';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import Table, { TableRow, TableCell } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { StatCardsSkeleton, TableSkeleton } from '../components/ui/LoadingSkeleton';

export const Dashboard = () => {
  const { scans, loading, error, fetchScans } = useScans();

  useEffect(() => {
    fetchScans();
  }, [fetchScans]);

  const completedScans = scans.filter((s) => s.status === 'completed');
  const analyzedScans = completedScans.filter((s) => s.analysisStatus === 'completed');

  const totalScansCount = scans.length;
  const totalEndpointsCount = completedScans.reduce((sum, scan) => sum + (scan.endpointCount || 0), 0);
  const totalFindingsCount = completedScans.reduce((sum, scan) => sum + (scan.findingCount || 0), 0);
  const averageRiskScore =
    analyzedScans.length > 0
      ? Math.round(analyzedScans.reduce((sum, s) => sum + (s.riskScore || 0), 0) / analyzedScans.length)
      : 0;

  const tableHeaders = ['API Title', 'Version', 'Endpoints', 'Risk Score', 'Findings', 'Scanned Date', { label: 'Action', align: 'right' }];

  return (
    <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col gap-6 animate-fade-in">
      <PageHeader
        title="Security Dashboard"
        description="Overview of your API inventory, endpoint stats, and passive security posture."
        action={
          <Link to="/scans/new">
            <Button icon={Plus}>New Scan</Button>
          </Link>
        }
      />

      {loading ? (
        <>
          <StatCardsSkeleton />
          <TableSkeleton rows={4} cols={6} />
        </>
      ) : (
        <>
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Avg Risk Score"
              value={averageRiskScore}
              suffix="/100"
              icon={Shield}
              color={getRiskScoreColor(averageRiskScore).text}
              iconBg="bg-blue-500/10 text-blue-400"
            />
            <StatCard
              label="Security Findings"
              value={totalFindingsCount}
              icon={AlertTriangle}
              color="text-amber-400"
              iconBg="bg-amber-500/10 text-amber-400"
            />
            <StatCard
              label="Endpoints Found"
              value={totalEndpointsCount}
              icon={Globe}
              color="text-emerald-400"
              iconBg="bg-emerald-500/10 text-emerald-400"
            />
            <StatCard
              label="Total Scans"
              value={totalScansCount}
              icon={Search}
              color="text-purple-400"
              iconBg="bg-purple-500/10 text-purple-400"
            />
          </div>

          {/* Recent Scans Inventory */}
          <Card className="flex-1 flex flex-col min-h-0 !p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Recent API Inventory</h3>
              {totalScansCount > 0 && (
                <Link to="/scans/history" className="text-xs font-medium text-blue-400 hover:underline flex items-center gap-1">
                  View All Scans <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {scans.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No API specifications analyzed yet"
                description="Upload an OpenAPI or Swagger specification to begin passive security analysis and map your API inventory."
                actionLabel="Upload Specification"
                onAction={() => {}}
                actionTo="/scans/new"
              />
            ) : (
              <Table headers={tableHeaders}>
                {scans.slice(0, 6).map((scan) => {
                  const riskStyle = getRiskScoreColor(scan.riskScore);
                  return (
                    <TableRow key={scan._id}>
                      <TableCell>
                        {scan.status === 'completed' ? (
                          <Link to={`/scans/${scan._id}`} className="font-semibold text-xs text-blue-400 hover:underline block truncate max-w-[200px]">
                            {scan.apiTitle}
                          </Link>
                        ) : (
                          <span className="font-semibold text-xs text-slate-400 block truncate max-w-[200px]">
                            {scan.fileName}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-300">
                        {scan.status === 'completed' ? `v${scan.apiVersion}` : '—'}
                      </TableCell>
                      <TableCell className="font-semibold text-xs">
                        {scan.status === 'completed' ? scan.endpointCount : '0'}
                      </TableCell>
                      <TableCell>
                        {scan.analysisStatus === 'completed' ? (
                          <Badge variant="neutral" className={`${riskStyle.bg} ${riskStyle.text} ${riskStyle.border}`}>
                            {formatRiskScore(scan.riskScore)}
                          </Badge>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {scan.analysisStatus === 'completed' ? (
                          <span className="font-semibold text-amber-400">{scan.findingCount || 0} findings</span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-400 text-xs">{formatDate(scan.uploadedAt)}</TableCell>
                      <TableCell align="right">
                        {scan.status === 'completed' && (
                          <Link to={`/scans/${scan._id}`}>
                            <Button variant="secondary" size="sm">
                              View
                            </Button>
                          </Link>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </Table>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default Dashboard;
