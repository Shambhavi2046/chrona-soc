from fastapi import APIRouter, Depends
from app.api.v1 import health, auth, users, organizations, roles, permissions, audit_logs
from app.api.v1 import alerts, investigations, cases, dashboard, events, detections, graph
from app.api.v1 import hunting, reports, soar, analytics
from app.middleware.auth import get_current_user

api_router = APIRouter()

# Public routes
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

# Protected routes (require valid JWT)
protected_dependencies = [Depends(get_current_user)]

api_router.include_router(users.router, prefix="/users", tags=["users"], dependencies=protected_dependencies)
api_router.include_router(organizations.router, prefix="/organizations", tags=["organizations"], dependencies=protected_dependencies)
api_router.include_router(roles.router, prefix="/roles", tags=["roles"], dependencies=protected_dependencies)
api_router.include_router(permissions.router, prefix="/permissions", tags=["permissions"], dependencies=protected_dependencies)
api_router.include_router(audit_logs.router, prefix="/audit-logs", tags=["audit-logs"], dependencies=protected_dependencies)
api_router.include_router(alerts.router, prefix="/alerts", tags=["alerts"], dependencies=protected_dependencies)
api_router.include_router(investigations.router, prefix="/investigations", tags=["investigations"], dependencies=protected_dependencies)
api_router.include_router(cases.router, prefix="/cases", tags=["cases"], dependencies=protected_dependencies)
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"], dependencies=protected_dependencies)
api_router.include_router(events.router, prefix="/events", tags=["events"], dependencies=protected_dependencies)
api_router.include_router(detections.router, prefix="/detections", tags=["detections"], dependencies=protected_dependencies)
api_router.include_router(graph.router, prefix="/graph", tags=["graph"], dependencies=protected_dependencies)
api_router.include_router(hunting.router, prefix="/hunting", tags=["hunting"], dependencies=protected_dependencies)
api_router.include_router(reports.router, prefix="/reports", tags=["reports"], dependencies=protected_dependencies)
api_router.include_router(soar.router, prefix="/soar", tags=["soar"], dependencies=protected_dependencies)
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"], dependencies=protected_dependencies)

from app.api.routes import copilot
api_router.include_router(copilot.router, prefix="/copilot", tags=["copilot"])
