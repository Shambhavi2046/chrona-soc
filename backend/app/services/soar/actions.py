from typing import Dict, Any
from app.services.soar.context import ExecutionContext

class ActionHandler:
    """Base class for all SOAR action handlers."""
    def execute(self, context: ExecutionContext, config: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError("Subclasses must implement execute()")

class LogActionHandler(ActionHandler):
    def execute(self, context: ExecutionContext, config: Dict[str, Any]) -> Dict[str, Any]:
        message = config.get("message")
        if not message:
            return {
                "status": "failed",
                "output": {},
                "message": "Missing required field: 'message'"
            }

        return {
            "status": "success",
            "output": {},
            "message": str(message)
        }

class SetVariableActionHandler(ActionHandler):
    def execute(self, context: ExecutionContext, config: Dict[str, Any]) -> Dict[str, Any]:
        name = config.get("name")
        value = config.get("value")

        if not name:
            return {
                "status": "failed",
                "output": {},
                "message": "Missing required field: 'name'"
            }

        context.set_variable(name, value)

        return {
            "status": "success",
            "output": {"name": name, "value": value},
            "message": f"Variable '{name}' set successfully"
        }

class ConditionActionHandler(ActionHandler):
    def execute(self, context: ExecutionContext, config: Dict[str, Any]) -> Dict[str, Any]:
        variable = config.get("variable")
        operator = config.get("operator")
        expected_value = config.get("value")

        if not variable or not operator:
            return {
                "status": "failed",
                "output": {},
                "message": "Missing required fields: 'variable' or 'operator'"
            }

        actual_value = context.get_variable(variable)
        passed = False

        if operator == "equals":
            passed = actual_value == expected_value
        elif operator == "not_equals":
            passed = actual_value != expected_value
        elif operator == "contains":
            if isinstance(actual_value, (str, list, dict)):
                passed = expected_value in actual_value
            else:
                passed = False
        elif operator == "exists":
            passed = actual_value is not None
        else:
            return {
                "status": "failed",
                "output": {},
                "message": f"Unsupported operator: '{operator}'"
            }

        return {
            "status": "success" if passed else "failed",
            "output": {
                "variable": variable,
                "operator": operator,
                "expected": expected_value,
                "actual": actual_value,
                "passed": passed
            },
            "message": f"Condition evaluated to {passed}"
        }

import httpx

class HTTPRequestActionHandler(ActionHandler):
    def execute(self, context: ExecutionContext, config: Dict[str, Any]) -> Dict[str, Any]:
        url = config.get("url")
        method = config.get("method", "GET").upper()
        headers = config.get("headers", {})
        body = config.get("body", None)
        timeout = float(config.get("timeout", 10.0))

        if not url:
            return {
                "status": "failed",
                "output": {},
                "message": "Missing required field: 'url'"
            }

        if not url.startswith(("http://", "https://")):
            return {
                "status": "failed",
                "output": {},
                "message": "URL must start with http:// or https://"
            }

        allowed_methods = {"GET", "POST", "PUT", "DELETE", "PATCH"}
        if method not in allowed_methods:
            return {
                "status": "failed",
                "output": {},
                "message": f"Unsupported HTTP method: {method}"
            }

        # Redact secrets
        forbidden_headers = {"authorization", "api-key", "bearer"}
        for h in headers.keys():
            if h.lower() in forbidden_headers:
                return {
                    "status": "failed",
                    "output": {},
                    "message": f"Header '{h}' is forbidden in playbook configuration to prevent credential exposure."
                }

        # SSRF Protection
        try:
            import urllib.parse
            import socket
            import ipaddress

            parsed = urllib.parse.urlparse(url)
            hostname = parsed.hostname
            if not hostname:
                return {
                    "status": "failed",
                    "output": {},
                    "message": "Invalid URL: missing hostname"
                }

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
        except socket.gaierror as e:
            return {
                "status": "failed",
                "output": {},
                "message": f"DNS Resolution Failed: Cannot resolve hostname '{hostname}'"
            }
        except Exception as e:
            return {
                "status": "failed",
                "output": {},
                "message": f"SSRF Protection: Validation error for '{hostname}'"
            }

        try:
            with httpx.Client(timeout=timeout) as client:
                response = client.request(method=method, url=url, headers=headers, json=body if isinstance(body, dict) else None, data=body if not isinstance(body, dict) else None)

                status_code = response.status_code
                try:
                    resp_data = response.json()
                except Exception:
                    # Read up to 1MB
                    resp_data = response.text[:1048576]

                passed = 200 <= status_code < 300

                return {
                    "status": "success" if passed else "failed",
                    "output": {
                        "status_code": status_code,
                        "body": resp_data
                    },
                    "message": f"HTTP {method} returned {status_code}"
                }
        except httpx.TimeoutException:
            return {
                "status": "failed",
                "output": {},
                "message": f"HTTP request timed out after {timeout} seconds"
            }
        except httpx.RequestError as exc:
            return {
                "status": "failed",
                "output": {},
                "message": f"HTTP request failed: {str(exc)}"
            }

ACTION_REGISTRY: Dict[str, ActionHandler] = {
    "log": LogActionHandler(),
    "set_variable": SetVariableActionHandler(),
    "condition": ConditionActionHandler(),
    "http_request": HTTPRequestActionHandler()
}
