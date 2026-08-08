import httpx
import urllib.parse
import socket
import ipaddress
from typing import Dict, Any
from app.services.soar.providers.base import IntegrationProvider

class ThreatFoxProvider(IntegrationProvider):
    async def execute(self, config: Dict[str, Any], secret: str, execution_context: Dict[str, Any]) -> Dict[str, Any]:
        ioc = config.get("ioc")
        if not ioc:
            return {
                "status": "failed",
                "output": {},
                "message": "Missing required configuration field: 'ioc'"
            }

        url = "https://threatfox-api.abuse.ch/api/v1/"

        # SSRF Protection
        try:
            parsed = urllib.parse.urlparse(url)
            hostname = parsed.hostname
            addr_info = socket.getaddrinfo(hostname, None)
            ips = [info[4][0] for info in addr_info]
            for ip_str in ips:
                ip = ipaddress.ip_address(ip_str)
                if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_multicast or ip.is_reserved or str(ip) == '0.0.0.0':
                    return {
                        "status": "failed",
                        "output": {},
                        "message": f"SSRF Protection: Access to internal or reserved IP address ({ip_str}) is blocked."
                    }
        except socket.gaierror:
            return {
                "status": "failed",
                "output": {},
                "message": f"DNS Resolution Failed: Cannot resolve hostname '{hostname}'"
            }
        except Exception:
            return {
                "status": "failed",
                "output": {},
                "message": f"SSRF Protection: Validation error for '{hostname}'"
            }

        headers = {
            "Auth-Key": secret,
            "Content-Type": "application/json"
        }

        payload = {
            "query": "search_ioc",
            "search_term": ioc
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(url, headers=headers, json=payload)
                status_code = response.status_code

                if status_code != 200:
                    return {
                        "status": "failed",
                        "output": {"status_code": status_code},
                        "message": f"ThreatFox API returned HTTP {status_code}"
                    }

                resp_data = response.json()

                # Normalization
                success = resp_data.get("query_status") == "ok"
                data_list = resp_data.get("data", [])

                normalized = {
                    "success": success,
                    "ioc": ioc,
                    "tags": [],
                    "malware": "unknown",
                    "confidence": 0
                }

                if success and data_list:
                    first_match = data_list[0]
                    normalized["tags"] = first_match.get("tags", [])
                    normalized["malware"] = first_match.get("malware_printable", "unknown")
                    normalized["confidence"] = first_match.get("confidence_level", 0)

                return {
                    "status": "success" if success else "failed",
                    "output": normalized,
                    "message": "ThreatFox enrichment completed successfully" if success else "No results found or error"
                }
        except httpx.TimeoutException:
            return {
                "status": "failed",
                "output": {},
                "message": "ThreatFox request timed out"
            }
        except httpx.RequestError:
            return {
                "status": "failed",
                "output": {},
                "message": "ThreatFox request failed due to a network error"
            }
        except Exception:
            return {
                "status": "failed",
                "output": {},
                "message": "An error occurred while processing the ThreatFox response"
            }
