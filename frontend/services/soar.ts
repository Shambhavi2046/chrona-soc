import { API_URL } from "./config";
import { Playbook } from "@/types";

export async function getPlaybooks(): Promise<Playbook[]> {
  const response = await fetch(`${API_URL}/soar/playbooks`, {
    cache: "no-store"
  });
  if (!response.ok) throw new Error("Failed to fetch playbooks");
  return response.json();
}

export async function getPlaybook(id: string): Promise<Playbook> {
  const response = await fetch(`${API_URL}/soar/playbooks/${id}`, {
    cache: "no-store"
  });
  if (!response.ok) throw new Error("Failed to fetch playbook");
  return response.json();
}

export async function createPlaybook(data: Partial<Playbook>): Promise<Playbook> {
  const response = await fetch(`${API_URL}/soar/playbooks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create playbook");
  return response.json();
}

export async function updatePlaybook(id: string, data: Partial<Playbook>): Promise<Playbook> {
  const response = await fetch(`${API_URL}/soar/playbooks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update playbook");
  return response.json();
}

export async function deletePlaybook(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/soar/playbooks/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete playbook");
}

export async function activatePlaybook(id: string): Promise<Playbook> {
  const response = await fetch(`${API_URL}/soar/playbooks/${id}/activate`, {
    method: "PATCH",
  });
  if (!response.ok) throw new Error("Failed to activate playbook");
  return response.json();
}

export async function deactivatePlaybook(id: string): Promise<Playbook> {
  const response = await fetch(`${API_URL}/soar/playbooks/${id}/deactivate`, {
    method: "PATCH",
  });
  if (!response.ok) throw new Error("Failed to deactivate playbook");
  return response.json();
}

export const executePlaybook = async (id: string): Promise<any> => {
  const response = await fetch(`${API_URL}/soar/playbooks/${id}/execute`, {
    method: "POST",
  });
  if (!response.ok) throw new Error("Failed to execute playbook");
  return response.json();
};

export const getExecutions = async (): Promise<any[]> => {
  const response = await fetch(`${API_URL}/soar/executions`, {
    cache: "no-store"
  });
  if (!response.ok) throw new Error("Failed to fetch executions");
  const data = await response.json();
  return data.map((ex: any) => ({
    id: ex.id,
    playbookName: ex.playbookName || 'Unknown',
    trigger: ex.trigger || 'Unknown',
    startTime: ex.started_at,
    duration: ex.duration || '0s',
    status: ex.status,
    initiatedBy: ex.initiated_by,
    execution_logs: ex.execution_logs
  }));
};
