export interface Organisation {
  id: string;
  name: string;
  plan: "Enterprise" | "Pro" | "Standard";
  users: number;
  status: "Active" | "Suspended" | "Trialing";
  created: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  orgId: string;
  role: string;
  status: "Active" | "Disabled" | "Pending";
  lastLogin: string;
  mfaEnabled: boolean;
}

export interface Team {
  id: string;
  name: string;
  members: number;
  assignedCases: number;
  lead: string;
  status: "Active" | "Inactive";
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  ip: string;
  result: "Success" | "Failure";
}

export interface Session {
  id: string;
  user: string;
  device: string;
  browser: string;
  location: string;
  loginTime: string;
  status: "Active" | "Idle";
}
