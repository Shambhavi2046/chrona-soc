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

import asyncio
import uuid
from app.db.session import async_session_maker
from app.services.credentials_service import credentials_service
from app.core.crypto import decrypt_secret
from app.services.soar.providers import get_provider

class IntegrationActionHandler(ActionHandler):
    def execute(self, context: ExecutionContext, config: Dict[str, Any]) -> Dict[str, Any]:
        return asyncio.run(self._execute_async(context, config))

    async def _execute_async(self, context: ExecutionContext, config: Dict[str, Any]) -> Dict[str, Any]:
        integration_name = config.get("integration")
        credential_id_str = config.get("credential_id")

        if not integration_name or not credential_id_str:
            return {
                "status": "failed",
                "output": {},
                "message": "Missing required fields: 'integration' or 'credential_id'"
            }

        try:
            credential_id = uuid.UUID(credential_id_str)
        except ValueError:
            return {
                "status": "failed",
                "output": {},
                "message": "Invalid credential_id format"
            }

        # Securely retrieve the credential
        async with async_session_maker() as db:
            cred = await credentials_service.get_by_id(db, credential_id)

        if not cred:
            return {
                "status": "failed",
                "output": {},
                "message": f"Credential not found for ID {credential_id_str}"
            }

        if cred.provider != integration_name:
            return {
                "status": "failed",
                "output": {},
                "message": f"Credential provider '{cred.provider}' does not match integration '{integration_name}'"
            }

        # Decrypt secret in memory
        try:
            secret = decrypt_secret(cred.encrypted_secret)
        except Exception:
            return {
                "status": "failed",
                "output": {},
                "message": "Failed to decrypt integration secret"
            }

        provider = get_provider(integration_name)
        if not provider:
            return {
                "status": "failed",
                "output": {},
                "message": f"Integration provider '{integration_name}' is not registered."
            }

        # Execute provider
        try:
            # We assume provider execute can be async or we await it.
            # wait, the base class was `async def execute`
            result = await provider.execute(config, secret, context.variables)

            # Ensure the secret is never accidentally placed in the output
            # We serialize to string, check if secret is in there, if so, redact it.
            import json
            result_str = json.dumps(result)
            if secret in result_str:
                result_str = result_str.replace(secret, "***REDACTED***")
                result = json.loads(result_str)

            return result
        except Exception as e:
            # Redact from exception message
            err_msg = str(e)
            if secret in err_msg:
                err_msg = err_msg.replace(secret, "***REDACTED***")
            return {
                "status": "failed",
                "output": {},
                "message": f"Integration execution failed: {err_msg}"
            }

ACTION_REGISTRY: Dict[str, ActionHandler] = {
    "log": LogActionHandler(),
    "set_variable": SetVariableActionHandler(),
    "condition": ConditionActionHandler(),
    "http_request": HTTPRequestActionHandler(),
    "integration": IntegrationActionHandler()
}
