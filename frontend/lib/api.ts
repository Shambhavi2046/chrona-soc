const API_URL = "http://127.0.0.1:8000/api/v1";

export interface Alert {
  id: number;
  log_id: number;
  threat_type: string;
  risk_score: number;
  status: string;
  created_at: string;
}

export async function getDashboardStats() {
  const response = await fetch(
    `${API_URL}/dashboard`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data");
  }

  return response.json();
}

export async function getAlerts(): Promise<Alert[]> {
  const response = await fetch(
    `${API_URL}/alerts`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch alerts data");
  }

  return response.json();
}

export interface InvestigationResponse {
  alert_id: number;
  threat_type: string;
  risk_score: number;
  status: string;
  investigation: {
    analysis: string;
    recommendations: string[];
  };
}

export async function getInvestigation(alertId: string | number): Promise<InvestigationResponse> {
  const response = await fetch(
    `${API_URL}/alerts/${alertId}/investigate`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch investigation data");
  }

  return response.json();
}