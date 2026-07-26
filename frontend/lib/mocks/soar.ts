import { Playbook, ExecutionLog, Integration } from "@/types";

export const mockPlaybooks: Playbook[] = [
  { id: "PB-001", name: "Phishing Response", description: "Automated extraction of indicators from suspected phishing emails, IP enrichment, and auto-quarantine.", trigger: "Email Alert", lastRun: "10 mins ago", status: "Active" },
  { id: "PB-002", name: "Malware Containment", description: "Isolates infected endpoints via EDR upon High severity malware detection.", trigger: "EDR Alert", lastRun: "2 hours ago", status: "Active" },
  { id: "PB-003", name: "Ransomware Response", description: "Critical rapid-response protocol disabling user accounts and isolating entire subnets.", trigger: "Multiple EDR Alerts", lastRun: "5 days ago", status: "Active" },
  { id: "PB-004", name: "Privileged Account Compromise", description: "Forces password reset, terminates active sessions, and alerts security management.", trigger: "Impossible Travel", lastRun: "1 day ago", status: "Active" },
  { id: "PB-005", name: "IOC Enrichment", description: "Automatically queries VirusTotal and ThreatFox for newly ingested hashes.", trigger: "New Hash Ingested", lastRun: "2 mins ago", status: "Active" },
  { id: "PB-006", name: "Endpoint Isolation", description: "Manually triggered workflow to sever endpoint network connectivity.", trigger: "Manual", lastRun: "1 week ago", status: "Inactive" },
  { id: "PB-007", name: "Disable User Account", description: "Disables AD/Okta account pending HR review.", trigger: "Manual", lastRun: "3 weeks ago", status: "Draft" },
];

export const mockExecutions: ExecutionLog[] = [
  { id: "EXEC-8891", playbookName: "Phishing Response", trigger: "Email (Reported)", startTime: new Date(Date.now() - 1000 * 60 * 10).toISOString(), duration: "45s", status: "Success", initiatedBy: "System" },
  { id: "EXEC-8892", playbookName: "IOC Enrichment", trigger: "Hash: 8a9b...", startTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(), duration: "12s", status: "Success", initiatedBy: "System" },
  { id: "EXEC-8893", playbookName: "Malware Containment", trigger: "CrowdStrike Alert", startTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), duration: "3m 12s", status: "Failed", initiatedBy: "System" },
  { id: "EXEC-8894", playbookName: "Privileged Account Compromise", trigger: "Okta: Impossible Travel", startTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), duration: "N/A", status: "Pending Approval", initiatedBy: "System" },
  { id: "EXEC-8895", playbookName: "Endpoint Isolation", trigger: "Manual Action", startTime: new Date(Date.now() - 1000 * 10).toISOString(), duration: "10s", status: "Running", initiatedBy: "Alice Smith" },
];

export const mockIntegrations: Integration[] = [
  { id: "INT-01", name: "Microsoft Defender", category: "EDR", status: "Connected", lastSync: "2 mins ago" },
  { id: "INT-02", name: "CrowdStrike Falcon", category: "EDR", status: "Connected", lastSync: "1 min ago" },
  { id: "INT-03", name: "SentinelOne", category: "EDR", status: "Disconnected", lastSync: "3 days ago" },
  { id: "INT-04", name: "Microsoft Sentinel", category: "SIEM", status: "Connected", lastSync: "5 mins ago" },
  { id: "INT-05", name: "Splunk", category: "SIEM", status: "Connected", lastSync: "1 min ago" },
  { id: "INT-06", name: "Okta", category: "IAM", status: "Connected", lastSync: "Syncing..." },
  { id: "INT-07", name: "Azure AD", category: "IAM", status: "Error", lastSync: "1 hour ago" },
  { id: "INT-08", name: "AWS", category: "Cloud", status: "Connected", lastSync: "15 mins ago" },
  { id: "INT-09", name: "Slack", category: "Communication", status: "Connected", lastSync: "Online" },
  { id: "INT-10", name: "Microsoft Exchange", category: "Communication", status: "Connected", lastSync: "Online" },
];
