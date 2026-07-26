from fastapi import APIRouter
from app.api.v1 import health, auth, users, organizations, roles, permissions, audit_logs
from app.api.v1 import alerts, investigations, cases, dashboard, events, detections, graph

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(organizations.router, prefix="/organizations", tags=["organizations"])
api_router.include_router(roles.router, prefix="/roles", tags=["roles"])
api_router.include_router(permissions.router, prefix="/permissions", tags=["permissions"])
api_router.include_router(audit_logs.router, prefix="/audit-logs", tags=["audit-logs"])

api_router.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
api_router.include_router(investigations.router, prefix="/investigations", tags=["investigations"])
api_router.include_router(cases.router, prefix="/cases", tags=["cases"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(events.router, prefix="/events", tags=["events"])
api_router.include_router(detections.router, prefix="/detections", tags=["detections"])
api_router.include_router(graph.router, prefix="/graph", tags=["graph"])
from app.api.v1 import hunting, reports
api_router.include_router(hunting.router, prefix="/hunting", tags=["hunting"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
