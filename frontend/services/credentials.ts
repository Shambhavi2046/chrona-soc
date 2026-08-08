import { API_URL } from './config';

export interface CredentialResponse {
  id: string;
  name: string;
  provider: string;
  created_at: string;
  updated_at: string;
}

export interface CredentialCreate {
  name: string;
  provider: string;
  secret: string;
}

export const listCredentials = async (): Promise<CredentialResponse[]> => {
  const response = await fetch(`${API_URL}/soar/credentials`);
  if (!response.ok) {
    throw new Error('Failed to fetch credentials');
  }
  return response.json();
};

export const createCredential = async (data: CredentialCreate): Promise<CredentialResponse> => {
  const response = await fetch(`${API_URL}/soar/credentials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create credential');
  }
  return response.json();
};

export const deleteCredential = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/soar/credentials/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete credential');
  }
};
