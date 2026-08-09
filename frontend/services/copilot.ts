import { fetchApi } from "./api";
import { API_URL } from "./config";
import { CopilotMessage, CopilotResponse, CopilotQuickAction } from "@/types";

export async function sendCopilotMessage(prompt: string, history: CopilotMessage[]): Promise<CopilotResponse> {
  try {
    const response = await fetchApi(`${API_URL}/copilot/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, history }),
    });
    if (!response.ok) throw new Error("Failed to send copilot message");
    const data = await response.json();
    return {
      ...data,
      suggested_prompts: data.suggested_prompts || [],
      quick_actions: data.quick_actions || [],
    };
  } catch (error) {
    console.warn("Copilot API unavailable, falling back to mock mode");
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const p = prompt.toLowerCase();
    let responseText = "";
    let suggested = ["What are the latest threats?", "Analyze this IP address", "Map to MITRE ATT&CK"];
    let quick_actions: CopilotQuickAction[] = [];

    if (p.includes("summary") || p.includes("latest") || p.includes("threat")) {
      responseText = `**[Development Mock Mode] Latest Threat Summary:**\n\nOver the last 24 hours, Chrona SOC has detected a 15% increase in **Initial Access** attempts targeting public-facing web applications. We're observing a coordinated campaign originating from AS13335 (Cloudflare) using exploit payloads associated with CVE-2023-46805. \n\nI recommend reviewing the \`WEB-DMZ-EU\` cluster logs for abnormal spawning of \`cmd.exe\` or \`powershell.exe\`.`;
      suggested = ["Show related alerts", "What is CVE-2023-46805?", "Recommend mitigation steps"];
      quick_actions = [{ label: "View Alerts", url: "/alerts", action_type: "navigate" }];
    } else if (p.includes("ip") || p.includes("192.") || p.includes("10.") || p.includes("address")) {
      responseText = `**[Development Mock Mode] IP Reputation Analysis:**\n\nThe requested IP address is marked as **Malicious** across 3 threat intelligence feeds (AlienVault, AbuseIPDB, CrowdStrike).\n\n- **ISP:** DigitalOcean, LLC\n- **Country:** 🇳🇱 Netherlands\n- **Recent Activity:** Known for brute-force SSH attacks and hosting C2 infrastructure for the Cobalt Strike framework.\n\n*Confidence Score: 92/100*`;
      suggested = ["Block IP on Firewall", "Find related internal assets", "Create a case"];
      quick_actions = [{ label: "Block IP", url: "/soar", action_type: "execute_playbook" }];
    } else if (p.includes("ioc") || p.includes("hash") || p.includes("file")) {
      responseText = `**[Development Mock Mode] IOC Analysis:**\n\nThe provided file hash \`8739c76e681f900923b900c9df0ef75cf421d39cabb54650c4b9ad19b6a76d85\` matches the **LockBit 3.0 Ransomware** family.\n\n- **File Type:** Win32 EXE\n- **First Seen:** 2023-08-14\n- **Behavior:** Attempts to disable Windows Defender, deletes shadow copies via \`vssadmin.exe\`, and encrypts local drives.\n\nI strongly recommend isolating any endpoint where this hash was detected.`;
      suggested = ["Isolate affected endpoints", "Search all logs for this hash", "Generate incident report"];
    } else if (p.includes("mitre") || p.includes("attack") || p.includes("tactic")) {
      responseText = `**[Development Mock Mode] MITRE ATT&CK Mapping:**\n\nBased on the detected behavior, here is the mapped attack path:\n\n1. **Initial Access:** Valid Accounts (T1078)\n2. **Persistence:** Scheduled Task/Job (T1053)\n3. **Privilege Escalation:** Process Injection (T1055)\n4. **Credential Access:** OS Credential Dumping (T1003)\n5. **Command and Control:** Ingress Tool Transfer (T1105)\n\nThe adversary appears to be in the lateral movement phase.`;
      suggested = ["Show detection rules for T1055", "List compromised accounts", "Recommend countermeasures"];
    } else if (p.includes("recommend") || p.includes("action") || p.includes("remediate")) {
      responseText = `**[Development Mock Mode] Recommended Analyst Actions:**\n\nBased on the current case context, I recommend the following immediate actions:\n\n1. **Containment:** Isolate host \`CORP-LAPTOP-042\` from the corporate network.\n2. **Eradication:** Terminate the unauthorized \`powershell.exe\` process and its children.\n3. **Investigation:** Query Active Directory logs for any recent password resets or privilege changes for user \`jdoe\`.\n4. **Recovery:** Reset the credentials for \`jdoe\` and enforce MFA.`;
      suggested = ["Run containment playbook", "Draft email to user", "Close case as True Positive"];
      quick_actions = [{ label: "Run Playbook", url: "/soar", action_type: "execute_playbook" }];
    } else {
      responseText = `**[Development Mock Mode] SOC AI Copilot:**\n\nI am analyzing your request: "${prompt}".\n\nI can help you summarize recent threats, analyze IP addresses, investigate IOCs, map activities to MITRE ATT&CK, or recommend remediation actions. What would you like to do?`;
    }

    return {
      response: responseText,
      suggested_prompts: suggested,
      quick_actions: quick_actions
    };
  }
}
