export interface Playbook {
  id: string;
  name: string;
  description: string;
  trigger: string;
  lastRun: string;
  status: "Active" | "Inactive" | "Draft";
}

export interface ExecutionLog {
  id: string;
  playbookName: string;
  trigger: string;
  startTime: string;
  duration: string;
  status: "Success" | "Failed" | "Running" | "Pending Approval";
  initiatedBy: string;
}

export interface Integration {
  id: string;
  name: string;
  category: "EDR" | "SIEM" | "IAM" | "Cloud" | "Communication";
  status: "Connected" | "Disconnected" | "Error";
  lastSync: string;
}
