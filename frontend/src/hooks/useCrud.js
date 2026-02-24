import { useEffect, useState } from 'react';
import api from '../api/client';

export default function useCrud(endpoint) {
  const [rows, setRows] = useState([]);
  const refresh = () => api.get(endpoint).then((r) => setRows(r.data));
  useEffect(refresh, [endpoint]);
  const create = async (payload, isFormData = false) => {
    await api.post(endpoint, payload, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined);
    refresh();
  };
  return { rows, create, refresh };
}
