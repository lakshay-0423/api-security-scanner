import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  Play,
  Download,
  Trash2,
  AlertTriangle,
  Globe,
  Lock,
  Layers,
  Clock,
  CheckCircle2,
  FileCode2,
} from 'lucide-react';
import { useScans } from '../hooks/useScans';
import { useAnalysis } from '../hooks/useAnalysis';
import { formatDate, formatRiskScore } from '../utils/formatters';
import { getSeverityStyle, getRiskScoreColor } from '../utils/severity';
import { METHOD_COLORS } from '../utils/constants';
import PageHeader from '../components/ui/PageHeader';
import Card, { CardHeader } from '../components/ui/Card';
import Table, { TableRow, TableCell } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import SearchBox from '../components/ui/SearchBox';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/LoadingSkeleton';

export const ScanDetails = () => {
  const { id } = useParams();
  const { currentScan: scan, loading, fetchScanById } = useScans();
  const {
    findings,
    analyzing,
    exporting,
    deleting,
    fetchFindings,
    executeAnalysis,
    removeFindings,
    downloadJsonReport,
  } = useAnalysis();

  const [activeSection, setActiveSection] = useState('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  useEffect(() => {
    fetchScanById(id).then((s) => {
      if (s && s.analysisStatus === 'completed') {
        fetchFindings(id);
      }
    });
  }, [id, fetchScanById, fetchFindings]);

  if (loading || !scan) {
    return (
      <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col gap-6 animate-fade-in">
        <TableSkeleton rows={4} cols={5} />
      </div>
    );
  }

  const riskScoreStyle = getRiskScoreColor(scan.riskScore);

  const filteredEndpoints = (scan.endpoints || []).filter((ep) => {
    const term = searchTerm.toLowerCase();
    return ep.path.toLowerCase().includes(term) || ep.method.toLowerCase().includes(term);
  });

  const filteredFindings = findings.filter((f) => {
    const term = searchTerm.toLowerCase();
    const matchesTerm =
      f.title?.toLowerCase().includes(term) ||
      f.ruleId?.toLowerCase().includes(term) ||
      f.description?.toLowerCase().includes(term);
    const matchesSev = severityFilter === 'ALL' || f.severity?.toUpperCase() === severityFilter;
    return matchesTerm && matchesSev;
  });

  const endpointTableHeaders = ['Method', 'Path', 'Authentication', 'Parameters', 'Responses'];
  const findingTableHeaders = ['Severity', 'Rule ID', 'Title', 'Description & Recommendation'];

  return (
    <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col gap-6 animate-fade-in pb-10">
      {/* Page Header */}
      <PageHeader
        title={scan.apiTitle || scan.fileName}
        description={`API Version: v${scan.apiVersion || '1.0.0'} • Spec: ${scan.specVersion || 'OpenAPI 3.0'} • Uploaded: ${formatDate(scan.uploadedAt)}`}
        action={
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" icon={ArrowLeft}>
                Back
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              icon={Play}
              loading={analyzing}
              onClick={() => executeAnalysis(id)}
            >
              {scan.analysisStatus === 'completed' ? 'Re-run Analysis' : 'Run Security Analysis'}
            </Button>
            {scan.analysisStatus === 'completed' && (
              <Button
                variant="secondary"
                size="sm"
                icon={Download}
                loading={exporting}
                onClick={() => downloadJsonReport(id, scan.apiTitle)}
              >
                Export JSON
              </Button>
            )}
          </div>
        }
      />

      {/* Overview & Metadata Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Risk Score & Summary Card */}
        <Card className="flex flex-col justify-between">
          <CardHeader title="Security Posture Summary" />
          <div className="flex items-center justify-between my-2">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Overall Risk Score</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-4xl font-extrabold ${riskScoreStyle.text}`}>
                  {formatRiskScore(scan.riskScore)}
                </span>
              </div>
            </div>
            <div className={`w-14 h-14 rounded-2xl ${riskScoreStyle.bg} border ${riskScoreStyle.border} flex items-center justify-center`}>
              <Shield className={`w-7 h-7 ${riskScoreStyle.text}`} />
            </div>
          </div>
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Status: <strong className="text-white capitalize">{scan.analysisStatus || 'Pending'}</strong></span>
            <span>Total Findings: <strong className="text-amber-400">{scan.findingCount || 0}</strong></span>
          </div>
        </Card>

        {/* API Metadata Card */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <CardHeader title="API Specification Metadata" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-1">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Spec Type</span>
              <span className="text-xs font-semibold text-white mt-1 block">{scan.specVersion || 'OpenAPI 3.0'}</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Endpoints</span>
              <span className="text-xs font-semibold text-white mt-1 block">{scan.endpointCount || 0} mapped</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Base Server</span>
              <span className="text-xs font-mono text-slate-300 mt-1 block truncate" title={scan.serverUrl}>
                {scan.serverUrl || '—'}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Auth Scheme</span>
              <span className="text-xs font-semibold text-blue-400 mt-1 block">
                {scan.authTypes?.length ? scan.authTypes.join(', ') : 'None Detected'}
              </span>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 truncate" title={scan.description}>
            Description: {scan.description || 'No description provided in specification.'}
          </div>
        </Card>
      </div>

      {/* Lifecycle Timeline */}
      <Card className="!py-4">
        <div className="flex items-center justify-between flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-white">Uploaded</span>
            <span className="text-slate-500">• {formatDate(scan.uploadedAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-white">Parsed</span>
            <span className="text-slate-500">• {scan.endpointCount} endpoints</span>
          </div>
          <div className="flex items-center gap-2">
            {scan.analysisStatus === 'completed' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Clock className="w-4 h-4 text-amber-400" />
            )}
            <span className="font-semibold text-white">Analyzed</span>
            <span className="text-slate-500">• {scan.analysisStatus === 'completed' ? 'Completed' : 'Pending'}</span>
          </div>
        </div>
      </Card>

      {/* Main Section Navigation */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-2">
        <div className="flex gap-2">
          <Button
            variant={activeSection === 'inventory' ? 'primary' : 'ghost'}
            size="sm"
            icon={Globe}
            onClick={() => setActiveSection('inventory')}
          >
            Endpoint Inventory ({scan.endpointCount || 0})
          </Button>
          <Button
            variant={activeSection === 'findings' ? 'primary' : 'ghost'}
            size="sm"
            icon={AlertTriangle}
            onClick={() => setActiveSection('findings')}
          >
            Security Findings ({findings.length})
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <SearchBox value={searchTerm} onChange={setSearchTerm} placeholder={`Search ${activeSection}...`} />
          {activeSection === 'findings' && findings.length > 0 && (
            <Button variant="ghost" size="sm" icon={Trash2} loading={deleting} onClick={() => removeFindings(id)}>
              Clear Findings
            </Button>
          )}
        </div>
      </div>

      {/* Section Content */}
      {activeSection === 'inventory' ? (
        <Card className="!p-0 overflow-hidden">
          {filteredEndpoints.length === 0 ? (
            <EmptyState
              icon={Globe}
              title="No endpoints found"
              description="No endpoint routes match your filter criteria."
            />
          ) : (
            <Table headers={endpointTableHeaders}>
              {filteredEndpoints.map((ep, idx) => {
                const methodStyle = METHOD_COLORS[ep.method?.toUpperCase()] || METHOD_COLORS.GET;
                return (
                  <TableRow key={idx}>
                    <TableCell>
                      <Badge variant="neutral" className={`${methodStyle.bg} ${methodStyle.text} ${methodStyle.border}`}>
                        {ep.method?.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-white">{ep.path}</TableCell>
                    <TableCell>
                      {ep.secured ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                          <Lock className="w-3 h-3" /> {ep.authType || 'Secured'}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">Unauthenticated</span>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-400 text-xs font-mono">
                      {ep.parameterCount || 0} params
                    </TableCell>
                    <TableCell className="text-slate-400 text-xs font-mono">
                      {ep.responses ? Object.keys(ep.responses).join(', ') : '200'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </Table>
          )}
        </Card>
      ) : (
        <Card className="!p-0 overflow-hidden">
          {filteredFindings.length === 0 ? (
            <EmptyState
              icon={Shield}
              title={scan.analysisStatus === 'completed' ? 'No findings detected' : 'Analysis not executed'}
              description={
                scan.analysisStatus === 'completed'
                  ? 'No security vulnerabilities detected for this API spec based on Phase 2 static rules.'
                  : 'Run static security analysis to generate security findings for this API specification.'
              }
              actionLabel={scan.analysisStatus !== 'completed' ? 'Run Security Analysis' : null}
              onAction={() => executeAnalysis(id)}
            />
          ) : (
            <Table headers={findingTableHeaders}>
              {filteredFindings.map((f, idx) => {
                const sevStyle = getSeverityStyle(f.severity);
                return (
                  <TableRow key={idx}>
                    <TableCell>
                      <Badge variant="neutral" className={`${sevStyle.bg} ${sevStyle.text} ${sevStyle.border}`}>
                        {sevStyle.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-slate-300">{f.ruleId}</TableCell>
                    <TableCell className="font-bold text-xs text-white max-w-[220px] truncate">{f.title}</TableCell>
                    <TableCell className="text-xs text-slate-300 leading-relaxed">
                      <p className="font-medium text-slate-200">{f.description}</p>
                      {f.remediation && (
                        <p className="text-[11px] text-blue-400 mt-1 font-mono">
                          Fix: {f.remediation}
                        </p>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </Table>
          )}
        </Card>
      )}
    </div>
  );
};

export default ScanDetails;
