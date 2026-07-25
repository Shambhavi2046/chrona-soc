from sqlalchemy.orm import Session
from app.models.case_model import Case, Evidence
from app.models.alert_model import Alert
from app.schemas.graph_schema import GraphNodeSchema, GraphEdgeSchema, GraphTopologySchema

def generate_topology(db: Session) -> GraphTopologySchema:
    cases = db.query(Case).all()
    alerts = db.query(Alert).all()
    
    nodes_dict = {}
    edges_dict = {}
    
    def add_node(node_id: str, node_type: str, data: dict):
        if node_id not in nodes_dict:
            nodes_dict[node_id] = GraphNodeSchema(id=node_id, type=node_type, data=data)
            
    def add_edge(source: str, target: str, edge_type: str = "default", label: str = None):
        edge_id = f"{source}-{target}"
        if edge_id not in edges_dict:
            edges_dict[edge_id] = GraphEdgeSchema(id=edge_id, source=source, target=target, type=edge_type, label=label)

    # Core Assets (Hardcoded for enterprise context based on previous endpoints, but linked dynamically)
    core_assets = {
        "DB-Cluster-01": {"type": "asset", "icon": "Database", "severity": "critical"},
        "Web-Server-EU": {"type": "asset", "icon": "Server", "severity": "high"},
        "Admin-Laptop": {"type": "asset", "icon": "Laptop", "severity": "medium"},
    }
    
    for asset_name, props in core_assets.items():
        add_node(f"asset-{asset_name}", "asset", {"label": asset_name, "severity": props["severity"]})

    # Process Alerts
    for alert in alerts:
        alert_id = f"alert-{alert.id}"
        add_node(alert_id, "alert", {
            "label": f"Alert: {alert.threat_type}",
            "risk_score": alert.risk_score,
            "status": alert.status
        })

    # Process Cases
    for case in cases:
        case_id = f"case-{case.id}"
        add_node(case_id, "case", {
            "label": f"CASE-{case.id}: {case.title}",
            "priority": case.priority,
            "status": case.status
        })
        
        # Link Case -> Alert
        if case.alert_id:
            add_edge(case_id, f"alert-{case.alert_id}", "solid", "Investigates")
            
        # Dynamically link case to assets based on title
        if "Exfiltration" in case.title or "Data" in case.title:
            add_edge(case_id, "asset-DB-Cluster-01", "animated", "Targets")
        else:
            add_edge(case_id, "asset-Web-Server-EU", "dashed", "Affects")

        # Threat Context generation (matching logic in cases.py)
        if "Brute Force" in case.title or "Login" in case.title:
            add_node("ta-apt29", "threat_actor", {"label": "APT-29", "reputation": "Malicious"})
            add_node("mitre-t1110", "mitre", {"label": "T1110 Credential Access"})
            add_edge("ta-apt29", case_id, "solid", "Suspected")
            add_edge(case_id, "mitre-t1110", "dashed", "Maps To")
            add_edge("ta-apt29", "asset-Admin-Laptop", "animated", "Compromised")
            
        elif "Exfiltration" in case.title or "Ransomware" in case.title:
            add_node("ta-lockbit", "threat_actor", {"label": "LockBit Group", "reputation": "Malicious"})
            add_node("mal-lockbit3", "malware", {"label": "LockBit 3.0"})
            add_node("mitre-t1048", "mitre", {"label": "T1048 Exfiltration"})
            add_edge("ta-lockbit", "mal-lockbit3", "solid", "Uses")
            add_edge("mal-lockbit3", case_id, "solid", "Detected")
            add_edge(case_id, "mitre-t1048", "dashed", "Maps To")

        # Process Evidence (IOCs)
        for ev in case.evidence:
            ioc_id = f"ioc-{ev.id}"
            ev_type = ev.evidence_type.lower()
            confidence = "High" if ev_type in ["ip", "domain", "url"] else "Critical" if ev_type == "hash" else "Medium"
            
            add_node(ioc_id, "ioc", {
                "label": ev.value,
                "ioc_type": ev_type,
                "confidence": confidence
            })
            
            add_edge(ioc_id, case_id, "dashed", "Evidence")
            
            # Connect IOCs back to malware/threat actors if applicable
            if "LockBit" in case.title and ev_type == "hash":
                add_edge("mal-lockbit3", ioc_id, "solid", "Signature")
            if "Brute Force" in case.title and ev_type == "ip":
                add_edge(ioc_id, "ta-apt29", "solid", "Infrastructure")

    return GraphTopologySchema(
        nodes=list(nodes_dict.values()),
        edges=list(edges_dict.values())
    )
