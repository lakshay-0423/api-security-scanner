import { useState, useCallback } from 'react';
import { getScans, getScanById, deleteScan, uploadScan, uploadScanFromUrl } from '../services/scanService';
import { useToast } from './useToast';

export const useScans = () => {
  const [scans, setScans] = useState([]);
  const [currentScan, setCurrentScan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const fetchScans = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getScans();
      setScans(res.data || []);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load scans list.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchScanById = useCallback(async (id) => {
    setLoading(true);
    setError('');
    try {
      const res = await getScanById(id);
      setCurrentScan(res.data);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch scan details.';
      setError(msg);
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const removeScan = useCallback(async (id) => {
    try {
      await deleteScan(id);
      setScans((prev) => prev.filter((s) => s._id !== id));
      toast.success('Scan report deleted successfully.');
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete scan report.';
      toast.error(msg);
      return false;
    }
  }, [toast]);

  const uploadFileSpec = useCallback(async (file, onProgress) => {
    setLoading(true);
    try {
      const res = await uploadScan(file, onProgress);
      toast.success('Specification parsed & inventory generated!');
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to upload specification.';
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const uploadUrlSpec = useCallback(async (url) => {
    setLoading(true);
    try {
      const res = await uploadScanFromUrl(url);
      toast.success('Specification imported from URL successfully!');
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to import specification from URL.';
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    scans,
    currentScan,
    loading,
    error,
    fetchScans,
    fetchScanById,
    removeScan,
    uploadFileSpec,
    uploadUrlSpec,
  };
};

export default useScans;
