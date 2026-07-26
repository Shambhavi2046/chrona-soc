import { UserProfile, SecurityDevice, IntegrationStatus, SystemHealth } from "@/types";

export const mockProfile: UserProfile = {
  name: "Alex Mercer",
  email: "alex.mercer@chronasoc.internal",
  jobTitle: "Lead Security Analyst",
  organisation: "Acme Corp",
  timeZone: "(UTC-08:00) Pacific Time (US & Canada)",
  language: "English (UK)",
};

export const mockDevices: SecurityDevice[] = [
  { id: "DEV-1", name: "MacBook Pro 16\"", ip: "192.168.1.105", location: "San Francisco, US", lastActive: "Just now", isCurrent: true },
  { id: "DEV-2", name: "iPhone 14 Pro", ip: "10.0.0.42", location: "San Jose, US", lastActive: "2 hours ago", isCurrent: false },
  { id: "DEV-3", name: "Windows 11 VM", ip: "45.22.11.90", location: "London, UK", lastActive: "5 days ago", isCurrent: false },
];

export const mockIntegrationStatuses: IntegrationStatus[] = [
  { id: "INT-1", name: "Microsoft Defender", status: "Connected", lastSync: "2 mins ago" },
  { id: "INT-2", name: "Microsoft Sentinel", status: "Connected", lastSync: "5 mins ago" },
  { id: "INT-3", name: "CrowdStrike", status: "Disconnected" },
  { id: "INT-4", name: "Splunk", status: "Connected", lastSync: "1 min ago" },
  { id: "INT-5", name: "Okta", status: "Connected", lastSync: "Online" },
  { id: "INT-6", name: "Azure AD", status: "Error", lastSync: "1 hour ago" },
  { id: "INT-7", name: "AWS", status: "Connected", lastSync: "15 mins ago" },
  { id: "INT-8", name: "Slack", status: "Connected", lastSync: "Online" },
  { id: "INT-9", name: "Microsoft Teams", status: "Disconnected" },
  { id: "INT-10", name: "SMTP Server", status: "Connected", lastSync: "Online" },
];

export const mockHealth: SystemHealth = {
  version: "2.4.1",
  build: "b-89122x",
  environment: "Production (US-West-2)",
  license: "Enterprise (Valid until 2028-01-01)",
  status: "Healthy",
  uptime: "42 Days, 14 Hrs, 22 Mins",
};
