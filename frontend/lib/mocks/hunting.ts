import { HuntEvent, SavedHunt } from "@/types";

export const mockHuntEvents: HuntEvent[] = [
  {
    id: "EVT-8374-291",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    host: "CORP-LAPTOP-042",
    source: "CrowdStrike Falcon",
    user: "jdoe",
    severity: "Critical",
    mitre_tactic: "Execution",
    mitre_technique: "T1059.001 - PowerShell",
    ioc_match: "powershell.exe -enc JABz...",
    description: "Encoded PowerShell command executed",
    status: "Open",
    raw_log: '{"event": "ProcessExecution", "process": "powershell.exe", "commandLine": "powershell.exe -enc JABz...", "parent": "cmd.exe", "user": "jdoe", "host": "CORP-LAPTOP-042"}'
  },
  {
    id: "EVT-8374-292",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    host: "DB-PROD-01",
    source: "Windows Security Logs",
    user: "SYSTEM",
    severity: "High",
    mitre_tactic: "Credential Access",
    mitre_technique: "T1003.001 - LSASS Memory",
    ioc_match: "rundll32.exe (comsvcs.dll)",
    description: "Suspicious LSASS memory dump attempt",
    status: "Investigating",
    raw_log: '{"eventID": 4656, "process": "rundll32.exe", "target": "lsass.exe", "access": "0x1000", "user": "SYSTEM", "host": "DB-PROD-01"}'
  },
  {
    id: "EVT-8374-293",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    host: "WEB-DMZ-EU",
    source: "Linux Audit Logs",
    user: "www-data",
    severity: "Medium",
    mitre_tactic: "Persistence",
    mitre_technique: "T1053.003 - Cron",
    description: "New crontab entry for www-data",
    status: "Resolved",
    raw_log: '{"type": "SYSCALL", "syscall": "open", "file": "/var/spool/cron/crontabs/www-data", "user": "www-data", "host": "WEB-DMZ-EU"}'
  },
  {
    id: "EVT-8374-294",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    host: "FIREWALL-FW01",
    source: "Palo Alto Networks",
    user: "N/A",
    severity: "Critical",
    mitre_tactic: "Command & Control",
    mitre_technique: "T1571 - Non-Standard Port",
    ioc_match: "198.51.100.44",
    description: "Outbound connection to known malicious C2 infrastructure",
    status: "Open",
    raw_log: '{"type": "TRAFFIC", "src_ip": "10.0.5.15", "dst_ip": "198.51.100.44", "dst_port": 4444, "action": "allow"}'
  },
  {
    id: "EVT-8374-295",
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    host: "CORP-DESKTOP-99",
    source: "Okta",
    user: "asmith",
    severity: "High",
    mitre_tactic: "Initial Access",
    mitre_technique: "T1078 - Valid Accounts",
    ioc_match: "203.0.113.15",
    description: "Multiple failed logins followed by successful login (Impossible Travel)",
    status: "Investigating",
    raw_log: '{"event": "user.session.start", "outcome": "SUCCESS", "user": "asmith", "ip": "203.0.113.15", "location": "RU"}'
  }
];

export const mockSavedHunts: SavedHunt[] = [
  {
    id: "HUNT-001",
    name: "Encoded PowerShell Execution",
    query: "powershell.exe -enc",
    created_at: "2023-10-15T08:30:00Z",
    updated_at: "2023-10-15T08:30:00Z",
    mitre_mapping: "T1059.001",
    last_run: "2023-10-15T08:30:00Z",
    author: "System"
  },
  {
    id: "HUNT-002",
    name: "Suspicious LSASS Access",
    query: "lsass.exe AND access=0x1000",
    created_at: "2023-10-12T14:15:00Z",
    updated_at: "2023-10-12T14:15:00Z",
    mitre_mapping: "T1003.001",
    last_run: "2023-10-15T08:30:00Z",
    author: "Security Team"
  },
  {
    id: "HUNT-003",
    name: "Impossible Travel Logins",
    query: "event='user.session.start' outcome='SUCCESS'",
    created_at: "2023-09-28T09:00:00Z",
    updated_at: "2023-09-28T09:00:00Z",
    mitre_mapping: "T1078",
    last_run: "2023-10-15T08:30:00Z",
    author: "Identity Team"
  }
];
