export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const readErrorDetail = async (response: Response, fallback: string) => {
  try {
    const body = await response.json();
    if (body?.detail) return String(body.detail);
  } catch {

  }
  return fallback;
};

export const fetchConfig = async () => {
  const response = await fetch(`${API_BASE_URL}/config`);
  if (!response.ok) throw new Error('Failed to fetch config');
  return response.json();
};


export const uploadDocument = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_BASE_URL}/upload`, { method: 'POST', body: formData });
  if (!response.ok) throw new Error('Failed to upload document');
  return response.json();
};

export const analyzeDocument = async (clauses: any[], userId?: string) => {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clauses, user_id: userId }),
  });
  if (!response.ok) {
    throw new ApiError(await readErrorDetail(response, 'Failed to analyze document'), response.status);
  }
  return response.json();
};

export const generateReport = async (analyzed_clauses: any[], executive_summary: any = {}) => {
  const response = await fetch(`${API_BASE_URL}/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ analyzed_clauses, executive_summary }),
  });
  if (!response.ok) throw new Error('Failed to generate report');
  return response.json();
};



export const upsertUser = async (user: {
  id: string; email: string; name: string; photo?: string; plan: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/auth/upsert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (!response.ok) throw new Error('Failed to upsert user');
  return response.json();
};

export const fetchProfile = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/profile/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch profile');
  return response.json();
};

export const updateProfile = async (
  userId: string,
  updates: {
    name?: string;
    phone?: string;
    email_alerts?: boolean;
    weekly_digest?: boolean;
    risk_alerts?: boolean;
  }
) => {
  const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update profile');
  return response.json();
};



export const fetchContracts = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/contracts/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch contracts');
  return response.json();
};

export const fetchContractDetail = async (contractId: string) => {
  const response = await fetch(`${API_BASE_URL}/contracts/detail/${contractId}`);
  if (!response.ok) throw new Error('Failed to fetch contract');
  return response.json();
};

export const saveContract = async (payload: {
  user_id: string;
  filename: string;
  risk_score: number;
  risk_level: string;
  clauses: any[];
  summary: any;
  status?: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/contracts/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Failed to save contract');
  return response.json();
};



export const chatWithContract = async (payload: {
  message: string;
  clauses: any[];
  history: { role: string; content: string }[];
}) => {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Failed to get chat response');
  return response.json();
};

