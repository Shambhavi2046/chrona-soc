from sqlalchemy.orm import Session
from app.models.operations import Case, Alert, Investigation, Evidence, Asset, MitreTechnique, ThreatActor, Malware, IOC, alert_assets_table, alert_mitre_table, threat_actor_malware_table, threat_actor_iocs_table, malware_iocs_table
from app.schemas.graph_schema import GraphNodeSchema, GraphEdgeSchema, GraphTopologySchema

def generate_topology(db: Session) -> GraphTopologySchema:
    nodes_dict = {}
    edges_dict = {}
    
    def add_node(node_id: str, node_type: str, data: dict):
        if node_id not in nodes_dict:
            nodes_dict[node_id] = GraphNodeSchema(id=node_id, type=node_type, data=data)
            
    def add_edge(source: str, target: str, edge_type: str = "default", label: str = None):
        edge_id = f"{source}-{target}"
        if edge_id not in edges_dict:
            edges_dict[edge_id] = GraphEdgeSchema(id=edge_id, source=source, target=target, type=edge_type, label=label)

    # 1. Transactional Entities (Cases, Alerts, Investigations, Evidence)
    cases = db.query(Case).filter(Case.status != "Closed").all()
    case_ids = [c.id for c in cases]
    
    # Fetch active alerts, plus alerts linked to the active cases
    alerts = db.query(Alert).filter(Alert.status != "Closed").all()
    alert_ids = [a.id for a in alerts]
    
    if case_ids:
        linked_alerts = db.query(Alert).filter(Alert.case_id.in_(case_ids)).all()
        for a in linked_alerts:
            if a.id not in alert_ids:
                alerts.append(a)
                alert_ids.append(a.id)
                
    investigations = db.query(Investigation).filter(Investigation.alert_id.in_(alert_ids)).all() if alert_ids else []
    evidence_list = db.query(Evidence).filter(Evidence.case_id.in_(case_ids)).all() if case_ids else []
    
    # 2. Knowledge Base Entities (Attack Graph Entities)
    # We fetch these comprehensively to represent the threat landscape regardless of active cases.
    assets = db.query(Asset).all()
    mitres = db.query(MitreTechnique).all()
    threat_actors = db.query(ThreatActor).all()
    malwares = db.query(Malware).all()
    iocs = db.query(IOC).all()

    # 3. Add Nodes
    for case in cases:
        case_id = f"case-{case.id}"
        add_node(case_id, "case", {
            "label": f"CASE-{str(case.id)[:8]}: {case.title}",
            "priority": case.priority,
            "status": case.status
        })
        if case.assignee_id:
            user_id = f"user-{case.assignee_id}"
            add_node(user_id, "user", {"label": str(case.assignee_id)})
            add_edge(user_id, case_id, "solid", "Assigned To")

    for alert in alerts:
        alert_id = f"alert-{alert.id}"
        add_node(alert_id, "alert", {
            "label": f"Alert: {alert.threat_type}",
            "risk_score": alert.risk_score,
            "status": alert.status,
            "threat_type": alert.threat_type
        })
        if alert.case_id:
            add_edge(f"case-{alert.case_id}", alert_id, "solid", "Contains")

    for inv in investigations:
        inv_id = f"investigation-{inv.id}"
        add_node(inv_id, "investigation", {
            "label": f"INV-{str(inv.id)[:8]}",
            "status": inv.status,
            "summary": inv.summary
        })
        add_edge(f"alert-{inv.alert_id}", inv_id, "solid", "Investigated By")
        if inv.assignee_id:
            user_id = f"user-{inv.assignee_id}"
            add_node(user_id, "user", {"label": str(inv.assignee_id)})
            add_edge(user_id, inv_id, "solid", "Investigating")

    for ev in evidence_list:
        ev_id = f"evidence-{ev.id}"
        add_node(ev_id, "evidence", {
            "label": ev.value,
            "evidence_type": ev.evidence_type
        })
        add_edge(f"case-{ev.case_id}", ev_id, "solid", "Has Evidence")

    for asset in assets:
        asset_id = f"asset-{asset.id}"
        add_node(asset_id, "asset", {
            "label": asset.name,
            "type": asset.type,
            "ip_address": asset.ip_address,
            "hostname": asset.hostname,
            "status": asset.status,
            "criticality": asset.criticality
        })
        
    for mitre in mitres:
        mitre_id = f"mitre-{mitre.id}"
        add_node(mitre_id, "mitre", {
            "label": f"{mitre.technique_id} - {mitre.name}",
            "technique_id": mitre.technique_id,
            "tactic": mitre.tactic
        })

    for ta in threat_actors:
        ta_id = f"threat_actor-{ta.id}"
        add_node(ta_id, "threat_actor", {
            "label": ta.name,
            "reputation": ta.reputation
        })

    for mal in malwares:
        mal_id = f"malware-{mal.id}"
        add_node(mal_id, "malware", {
            "label": mal.name,
            "family": mal.family
        })

    ioc_by_value = {}
    for ioc in iocs:
        ioc_id = f"ioc-{ioc.id}"
        add_node(ioc_id, "ioc", {
            "label": ioc.value,
            "type": ioc.type,
            "confidence": ioc.confidence
        })
        ioc_by_value[ioc.value] = ioc_id

    # Cross-references (Derived Edges)
    for ev in evidence_list:
        if ev.value in ioc_by_value:
            add_edge(f"evidence-{ev.id}", ioc_by_value[ev.value], "solid", "Matches IOC")

    # 4. Association Table Edges
    if alert_ids:
        alert_asset_links = db.query(alert_assets_table).filter(alert_assets_table.c.alert_id.in_(alert_ids)).all()
        for link in alert_asset_links:
            add_edge(f"alert-{link.alert_id}", f"asset-{link.asset_id}", "dashed", "Affects")
            
        alert_mitre_links = db.query(alert_mitre_table).filter(alert_mitre_table.c.alert_id.in_(alert_ids)).all()
        for link in alert_mitre_links:
            add_edge(f"alert-{link.alert_id}", f"mitre-{link.mitre_id}", "dashed", "Maps To")

    ta_ioc_links = db.query(threat_actor_iocs_table).all()
    for link in ta_ioc_links:
        add_edge(f"threat_actor-{link.threat_actor_id}", f"ioc-{link.ioc_id}", "dashed", "Associated With")

    mal_ioc_links = db.query(malware_iocs_table).all()
    for link in mal_ioc_links:
        add_edge(f"malware-{link.malware_id}", f"ioc-{link.ioc_id}", "dashed", "Associated With")

    ta_mal_links = db.query(threat_actor_malware_table).all()
    for link in ta_mal_links:
        add_edge(f"threat_actor-{link.threat_actor_id}", f"malware-{link.malware_id}", "solid", "Uses")

    return GraphTopologySchema(
        nodes=list(nodes_dict.values()),
        edges=list(edges_dict.values())
    )


