from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.models.operations import Case, Alert, Investigation, Evidence, Asset, MitreTechnique, ThreatActor, Malware, IOC, alert_assets_table, alert_mitre_table, threat_actor_malware_table, threat_actor_iocs_table, malware_iocs_table
from app.schemas.graph_schema import GraphNodeSchema, GraphEdgeSchema, GraphTopologySchema
import uuid

async def generate_topology(db: AsyncSession, org_id: uuid.UUID) -> GraphTopologySchema:
    nodes_dict = {}
    edges_dict = {}

    def add_node(node_id: str, node_type: str, data: dict):
        if node_id not in nodes_dict:
            nodes_dict[node_id] = GraphNodeSchema(id=node_id, type=node_type, data=data)

    def add_edge(source: str, target: str, edge_type: str = "default", label: str = None):
        edge_id = f"{source}-{target}"
        if edge_id not in edges_dict:
            edges_dict[edge_id] = GraphEdgeSchema(id=edge_id, source=source, target=target, type=edge_type, label=label)

    # 1. Transactional Entities (Cases, Alerts, Investigations, Evidence) - Tenant Isolated
    cases_result = await db.execute(select(Case).filter(Case.status != "Closed", Case.org_id == org_id))
    cases = cases_result.scalars().all()
    case_ids = [c.id for c in cases]

    # Fetch active alerts
    alerts_result = await db.execute(select(Alert).filter(Alert.status != "Closed", Alert.org_id == org_id))
    alerts = list(alerts_result.scalars().all())
    alert_ids = [a.id for a in alerts]

    if case_ids:
        linked_alerts_result = await db.execute(select(Alert).filter(Alert.case_id.in_(case_ids), Alert.org_id == org_id))
        linked_alerts = linked_alerts_result.scalars().all()
        for a in linked_alerts:
            if a.id not in alert_ids:
                alerts.append(a)
                alert_ids.append(a.id)

    investigations = []
    if alert_ids:
        inv_result = await db.execute(select(Investigation).filter(Investigation.alert_id.in_(alert_ids)))
        investigations = inv_result.scalars().all()

    evidence_list = []
    if case_ids:
        ev_result = await db.execute(select(Evidence).filter(Evidence.case_id.in_(case_ids)))
        evidence_list = ev_result.scalars().all()

    # 2. Knowledge Base Entities (Attack Graph Entities) - Global / Shared
    assets = []
    mitres = []
    if alert_ids:
        assets_res = await db.execute(
            select(Asset)
            .join(alert_assets_table)
            .filter(alert_assets_table.c.alert_id.in_(alert_ids))
        )
        assets = assets_res.scalars().all()

        mitres_res = await db.execute(
            select(MitreTechnique)
            .join(alert_mitre_table)
            .filter(alert_mitre_table.c.alert_id.in_(alert_ids))
        )
        mitres = mitres_res.scalars().all()

    ioc_values = set()
    for ev in evidence_list:
        ioc_values.add(ev.value)
    for alert in alerts:
        if alert.raw_log and "ioc_matches" in alert.raw_log:
            ioc_values.update(alert.raw_log["ioc_matches"].keys())

    iocs = []
    if ioc_values:
        ioc_res = await db.execute(
            select(IOC).filter(
                IOC.value.in_(ioc_values),
                or_(IOC.org_id == org_id, IOC.org_id.is_(None))
            )
        )
        iocs = ioc_res.scalars().all()

    malwares = []
    threat_actors = []
    
    if iocs:
        ioc_ids = [ioc.id for ioc in iocs]
        
        mal_res = await db.execute(
            select(Malware)
            .join(malware_iocs_table)
            .filter(
                malware_iocs_table.c.ioc_id.in_(ioc_ids),
                or_(Malware.org_id == org_id, Malware.org_id.is_(None))
            )
        )
        malwares = mal_res.scalars().all()
        malware_ids = [mal.id for mal in malwares]
        
        ta_query = select(ThreatActor).filter(
            or_(ThreatActor.org_id == org_id, ThreatActor.org_id.is_(None))
        )
        
        conditions = []
        if ioc_ids:
            conditions.append(
                ThreatActor.id.in_(
                    select(threat_actor_iocs_table.c.threat_actor_id)
                    .filter(threat_actor_iocs_table.c.ioc_id.in_(ioc_ids))
                )
            )
        if malware_ids:
            conditions.append(
                ThreatActor.id.in_(
                    select(threat_actor_malware_table.c.threat_actor_id)
                    .filter(threat_actor_malware_table.c.malware_id.in_(malware_ids))
                )
            )
            
        if conditions:
            ta_res = await db.execute(ta_query.filter(or_(*conditions)))
            threat_actors = ta_res.scalars().all()

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
            "label": f"Alert: {alert.title or alert.threat_type or 'Unknown'}",
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
        alert_asset_res = await db.execute(select(alert_assets_table).filter(alert_assets_table.c.alert_id.in_(alert_ids)))
        for link in alert_asset_res.all():
            add_edge(f"alert-{link.alert_id}", f"asset-{link.asset_id}", "dashed", "Affects")

        alert_mitre_res = await db.execute(select(alert_mitre_table).filter(alert_mitre_table.c.alert_id.in_(alert_ids)))
        for link in alert_mitre_res.all():
            add_edge(f"alert-{link.alert_id}", f"mitre-{link.mitre_id}", "dashed", "Maps To")

    ta_ioc_res = await db.execute(select(threat_actor_iocs_table))
    for link in ta_ioc_res.all():
        add_edge(f"threat_actor-{link.threat_actor_id}", f"ioc-{link.ioc_id}", "dashed", "Associated With")

    mal_ioc_res = await db.execute(select(malware_iocs_table))
    for link in mal_ioc_res.all():
        add_edge(f"malware-{link.malware_id}", f"ioc-{link.ioc_id}", "dashed", "Associated With")

    ta_mal_res = await db.execute(select(threat_actor_malware_table))
    for link in ta_mal_res.all():
        add_edge(f"threat_actor-{link.threat_actor_id}", f"malware-{link.malware_id}", "solid", "Uses")

    return GraphTopologySchema(
        nodes=list(nodes_dict.values()),
        edges=list(edges_dict.values())
    )


