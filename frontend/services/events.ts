import { mapToUuid } from "@/utils/idMapping";
import { API_URL } from "./config";

export interface SecurityEvent {
  id: string;
  event_id: string;
  timestamp: string;
  created_at: string;
  source: string;
  vendor?: string;
  product?: string;
  hostname?: string;
  asset?: string;
  user_account?: string;
  ip_address?: string;
  destination_ip?: string;
  process_name?: string;
  command_line?: string;
  event_type: string;
  severity: string;
  status?: string;
  raw_event: Record<string, any>;
  normalized_data?: Record<string, any>;
  mitre_techniques?: string[];
  tags?: string[];
}

export interface EventStats {
  total_events: number;
  by_severity: Record<string, number>;
  by_source: Record<string, number>;
}

export const getEvents = async (skip = 0, limit = 100): Promise<SecurityEvent[]> => {
  try {
    const response = await fetch(`${API_URL}/events?skip=${skip}&limit=${limit}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Failed to fetch events");
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return [];
  }
};

export const getEventStats = async (): Promise<EventStats> => {
  try {
    const response = await fetch(`${API_URL}/events/stats`, { cache: "no-store" });
    if (!response.ok) throw new Error("Failed to fetch event stats");
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch event stats:', error);
    return {
      total_events: 0,
      by_severity: {},
      by_source: {}
    };
  }
};

export const searchEvents = async (params: Record<string, any>): Promise<SecurityEvent[]> => {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/events/search?${query}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Failed to search events");
    return await response.json();
  } catch (error) {
    console.error('Failed to search events:', error);
    return [];
  }
};

export const getEventById = async (id: string): Promise<SecurityEvent | null> => {
  try {
    const uuid = mapToUuid(id);
    const response = await fetch(`${API_URL}/events/${uuid}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Failed to fetch event");
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch event ${id}:`, error);
    return null;
  }
};
