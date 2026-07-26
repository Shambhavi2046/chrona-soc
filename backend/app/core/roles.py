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
        Permission.USERS_READ
    ],
    Role.TIER_1_ANALYST: [
        Permission.ALERTS_READ, Permission.ALERTS_WRITE,
        Permission.CASES_READ
    ],
    Role.READ_ONLY: [
        Permission.ALERTS_READ, Permission.CASES_READ, Permission.USERS_READ
    ]
}
