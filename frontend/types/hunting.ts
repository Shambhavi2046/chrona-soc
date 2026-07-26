export interface HuntEvent {
  id: string;
  timestamp: string;
  host: string;
  source: string;
  user: string;
  severity: string;
  mitre_tactic?: string;
  mitre_technique?: string;
  ioc_match?: string;
  description: string;
  status: string;
  raw_log: string;
}

export interface SavedHunt {
  id: string;
  name: string;
  description?: string;
  query: string;
  created_at: string;
  updated_at: string;
  mitre_mapping?: string;
  last_run?: string;
  author: string;
}

export interface HuntQueryRequest {
  query?: string;
  ioc?: string;
  hostname?: string;
  username?: string;
  severity?: string;
  mitre_tactic?: string;
  mitre_technique?: string;
  start_time?: string;
  end_time?: string;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_desc?: boolean;
}

export interface HuntExecuteResponse {
  events: HuntEvent[];
  total: number;
  page: number;
  page_size: number;
}
