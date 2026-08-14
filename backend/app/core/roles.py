from enum import Enum
from typing import List

class Permission(str, Enum):
    # Alerts
    ALERTS_READ = "alerts:read"
    ALERTS_WRITE = "alerts:write"
    
    # Cases
    CASES_READ = "cases:read"
    CASES_WRITE = "cases:write"
    
    # Settings/Admin
    USERS_READ = "users:read"
    USERS_WRITE = "users:write"
    ROLES_WRITE = "roles:write"

    # Threat Intelligence
    THREAT_INTEL_READ = "threat_intel:read"
    THREAT_INTEL_WRITE = "threat_intel:write"
    
    # Dashboard/Analytics
    DASHBOARD_READ = "dashboard:read"

    # SOAR
    SOAR_READ = "soar:read"
    SOAR_WRITE = "soar:write"
    SOAR_DELETE = "soar:delete"
    SOAR_EXECUTE = "soar:execute"

    # Threat Hunting
    HUNTING_READ = "hunting:read"
    HUNTING_WRITE = "hunting:write"
    HUNTING_DELETE = "hunting:delete"
    HUNTING_EXECUTE = "hunting:execute"

class Role(str, Enum):
    SUPER_ADMIN = "Super Admin"
    SOC_MANAGER = "SOC Manager"
    TIER_2_ANALYST = "Tier 2 Analyst"
    TIER_1_ANALYST = "Tier 1 Analyst"
    THREAT_HUNTER = "Threat Hunter"
    READ_ONLY = "Read Only"

# Default permissions mapping for standard roles
ROLE_PERMISSIONS_MAPPING = {
    Role.SUPER_ADMIN: [e.value for e in Permission],
    Role.SOC_MANAGER: [
        Permission.ALERTS_READ, Permission.ALERTS_WRITE,
        Permission.CASES_READ, Permission.CASES_WRITE,
        Permission.USERS_READ,
        Permission.THREAT_INTEL_READ, Permission.THREAT_INTEL_WRITE,
        Permission.DASHBOARD_READ,
        Permission.SOAR_READ, Permission.SOAR_WRITE,
        Permission.SOAR_DELETE, Permission.SOAR_EXECUTE,
        Permission.HUNTING_READ, Permission.HUNTING_WRITE,
        Permission.HUNTING_DELETE, Permission.HUNTING_EXECUTE
    ],
    Role.THREAT_HUNTER: [
        Permission.ALERTS_READ, Permission.CASES_READ,
        Permission.THREAT_INTEL_READ, Permission.DASHBOARD_READ,
        Permission.HUNTING_READ, Permission.HUNTING_WRITE,
        Permission.HUNTING_DELETE, Permission.HUNTING_EXECUTE
    ],
    Role.TIER_2_ANALYST: [
        Permission.ALERTS_READ, Permission.ALERTS_WRITE,
        Permission.CASES_READ, Permission.CASES_WRITE,
        Permission.THREAT_INTEL_READ, Permission.DASHBOARD_READ,
        Permission.SOAR_READ, Permission.SOAR_WRITE, Permission.SOAR_EXECUTE,
        Permission.HUNTING_READ, Permission.HUNTING_EXECUTE
    ],
    Role.TIER_1_ANALYST: [
        Permission.ALERTS_READ, Permission.ALERTS_WRITE,
        Permission.CASES_READ,
        Permission.THREAT_INTEL_READ, Permission.DASHBOARD_READ,
        Permission.SOAR_READ, Permission.SOAR_EXECUTE,
        Permission.HUNTING_READ
    ],
    Role.READ_ONLY: [
        Permission.ALERTS_READ, Permission.CASES_READ, Permission.USERS_READ,
        Permission.THREAT_INTEL_READ, Permission.DASHBOARD_READ,
        Permission.SOAR_READ
    ]
}
