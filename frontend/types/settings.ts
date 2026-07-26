export interface UserProfile {
  name: string;
  email: string;
  jobTitle: string;
  organisation: string;
  timeZone: string;
  language: string;
  avatarUrl?: string;
}

export interface SecurityDevice {
  id: string;
  name: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface IntegrationStatus {
  id: string;
  name: string;
  status: "Connected" | "Disconnected" | "Error";
  lastSync?: string;
}

export interface SystemHealth {
  version: string;
  build: string;
  environment: string;
  license: string;
  status: "Healthy" | "Degraded" | "Offline";
  uptime: string;
}
