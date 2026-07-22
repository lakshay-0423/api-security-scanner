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
