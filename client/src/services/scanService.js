import api from './api';

export const uploadScan = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post('/scans/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
  return data;
};

export const uploadScanFromUrl = async (url) => {
  const { data } = await api.post('/scans/url', { url });
  return data;
};

export const getScans = async () => {
  const { data } = await api.get('/scans');
  return data;
};

export const getScanById = async (id) => {
  const { data } = await api.get(`/scans/${id}`);
  return data;
};

export const deleteScan = async (id) => {
  const { data } = await api.delete(`/scans/${id}`);
  return data;
};

// Phase 2: Static Security Analysis API
export const runAnalysis = async (scanId) => {
  const { data } = await api.post(`/analysis/${scanId}`);
  return data;
};

export const getFindings = async (scanId) => {
  const { data } = await api.get(`/findings/${scanId}`);
  return data;
};

export const deleteFindings = async (scanId) => {
  const { data } = await api.delete(`/findings/${scanId}`);
  return data;
};

export const exportJsonReport = async (scanId) => {
  const response = await api.get(`/reports/${scanId}/json`, {
    responseType: 'blob'
  });
  return response.data;
};
