export interface Playbook {
  id: string;
  name: string;
  description: string;
  category: string;
  trigger_type: string;
  status: "Active" | "Disabled" | "Draft" | string;
  workflow_definition?: Record<string, any>;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ExecutionLog {
  id: string;
  playbookName: string;
  trigger: string;
  startTime: string;
  duration: string;
  status: "Success" | "Failed" | "Running" | "Pending Approval";
  initiatedBy: string;
  execution_logs?: any[];
}

export interface Integration {
  id: string;
  name: string;
  category: "EDR" | "SIEM" | "IAM" | "Cloud" | "Communication";
  status: "Connected" | "Disconnected" | "Error";
  lastSync: string;
}
