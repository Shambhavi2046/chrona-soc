import { Organisation, User, Team, AuditLogEntry, Session } from "@/types";

export const mockOrganisations: Organisation[] = [
  { id: "ORG-001", name: "Acme Corp", plan: "Enterprise", users: 142, status: "Active", created: "2021-04-12" },
  { id: "ORG-002", name: "Globex Inc", plan: "Pro", users: 45, status: "Active", created: "2022-08-01" },
  { id: "ORG-003", name: "Initech", plan: "Standard", users: 12, status: "Trialing", created: "2023-10-15" },
];

export const mockUsers: User[] = [
  { id: "USR-101", name: "Alice Smith", email: "alice@acme.com", orgId: "ORG-001", role: "Super Admin", status: "Active", lastLogin: "10 mins ago", mfaEnabled: true },
  { id: "USR-102", name: "Bob Jones", email: "bob@acme.com", orgId: "ORG-001", role: "SOC Manager", status: "Active", lastLogin: "2 hours ago", mfaEnabled: true },
  { id: "USR-103", name: "Charlie Davis", email: "charlie@acme.com", orgId: "ORG-001", role: "Tier 1 Analyst", status: "Active", lastLogin: "1 day ago", mfaEnabled: true },
  { id: "USR-104", name: "Diana Prince", email: "diana@globex.com", orgId: "ORG-002", role: "Threat Hunter", status: "Active", lastLogin: "4 hours ago", mfaEnabled: false },
  { id: "USR-105", name: "Evan Wright", email: "evan@initech.com", orgId: "ORG-003", role: "Auditor", status: "Pending", lastLogin: "Never", mfaEnabled: false },
  { id: "USR-106", name: "Fiona Gallagher", email: "fiona@acme.com", orgId: "ORG-001", role: "Read Only", status: "Disabled", lastLogin: "3 months ago", mfaEnabled: false },
];

export const mockTeams: Team[] = [
  { id: "TM-01", name: "Alpha Response", members: 8, assignedCases: 14, lead: "Bob Jones", status: "Active" },
  { id: "TM-02", name: "Threat Hunting Unit", members: 4, assignedCases: 2, lead: "Diana Prince", status: "Active" },
  { id: "TM-03", name: "Compliance & Audit", members: 3, assignedCases: 0, lead: "Evan Wright", status: "Inactive" },
];

export const mockAuditLogs: AuditLogEntry[] = [
  { id: "AUD-991", timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), user: "Alice Smith", action: "Updated Role Permissions", resource: "Role: Tier 1 Analyst", ip: "192.168.1.45", result: "Success" },
  { id: "AUD-992", timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), user: "Bob Jones", action: "Invited User", resource: "User: john@acme.com", ip: "10.0.0.12", result: "Success" },
  { id: "AUD-993", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), user: "System", action: "Automated Backup", resource: "Database: Postgres", ip: "127.0.0.1", result: "Success" },
  { id: "AUD-994", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), user: "Unknown", action: "Failed Login", resource: "User: admin@acme.com", ip: "45.22.11.90", result: "Failure" },
];

export const mockSessions: Session[] = [
  { id: "SESS-01", user: "Alice Smith", device: "MacBook Pro", browser: "Chrome 118", location: "New York, US", loginTime: "08:14 AM", status: "Active" },
  { id: "SESS-02", user: "Bob Jones", device: "ThinkPad T14", browser: "Firefox 119", location: "London, UK", loginTime: "09:30 AM", status: "Idle" },
  { id: "SESS-03", user: "Alice Smith", device: "iPhone 14 Pro", browser: "Safari Mobile", location: "New York, US", loginTime: "Yest 10:00 PM", status: "Active" },
];
