import { fetchApi } from "./api";
import { API_URL } from "./config";
import { CopilotMessage, CopilotResponse, CopilotQuickAction } from "@/types";

export async function sendCopilotMessage(prompt: string, history: CopilotMessage[]): Promise<CopilotResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetchApi(`${API_URL}/copilot/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, history }),
      signal: controller.signal,
    });

    if (!response.ok) throw new Error("Failed to send copilot message");
    const data = await response.json();
    return {
      ...data,
      suggested_prompts: data.suggested_prompts || [],
      quick_actions: data.quick_actions || [],
    };
  } catch (error) {
    console.warn("Copilot API unavailable:", error);

    return {
      response: "I'm currently unable to connect to the SOC intelligence fabric. Please check your network connection or try again later.",
      suggested_prompts: ["Retry connection"],
      quick_actions: []
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
