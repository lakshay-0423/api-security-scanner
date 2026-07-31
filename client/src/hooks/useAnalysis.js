import { useState, useCallback } from 'react';
import { runAnalysis, getFindings, deleteFindings, exportJsonReport } from '../services/scanService';
import { useToast } from './useToast';

export const useAnalysis = () => {
  const [findings, setFindings] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  const fetchFindings = useCallback(async (scanId) => {
    try {
      const res = await getFindings(scanId);
      setFindings(res.data || []);
      return res.data;
    } catch (err) {
      console.error(err);
      return [];
    }
  }, []);

  const executeAnalysis = useCallback(async (scanId) => {
    setAnalyzing(true);
    try {
      const res = await runAnalysis(scanId);
      toast.success(`Static security analysis completed! ${res.summary?.totalFindings || 0} findings generated.`);
      await fetchFindings(scanId);
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to execute security analysis.';
      toast.error(msg);
      throw err;
    } finally {
      setAnalyzing(false);
    }
  }, [fetchFindings, toast]);

  const removeFindings = useCallback(async (scanId) => {
    setDeleting(true);
    try {
      await deleteFindings(scanId);
      setFindings([]);
      toast.success('Security findings cleared.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to clear findings.';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  }, [toast]);

  const downloadJsonReport = useCallback(async (scanId, apiTitle = 'scan') => {
    setExporting(true);
    try {
      const blobData = await exportJsonReport(scanId);
      const url = window.URL.createObjectURL(new Blob([blobData], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `security-report-${apiTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success('JSON security report downloaded!');
    } catch (err) {
      toast.error('Failed to export JSON report.');
      console.error(err);
    } finally {
      setExporting(false);
    }
  }, [toast]);

  return {
    findings,
    analyzing,
    exporting,
    deleting,
    fetchFindings,
    executeAnalysis,
    removeFindings,
    downloadJsonReport,
  };
};

export default useAnalysis;
