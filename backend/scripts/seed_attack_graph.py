import sys
import os
from sqlalchemy.orm import Session
import uuid

# Add the project root to the python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal, engine
from app.models.identity import User
from app.models.operations import (
    Asset, ThreatActor, Malware, IOC, MitreTechnique, Alert, Case, Investigation, Evidence,
    alert_assets_table, alert_mitre_table, threat_actor_malware_table,
    threat_actor_iocs_table, malware_iocs_table
)

def seed_attack_graph():
    print("Starting safe development-only seed for Attack Graph...")
    db: Session = SessionLocal()
    
    try:
        # Check if seed data already exists to be idempotent
        existing_ta = db.query(ThreatActor).filter(ThreatActor.name == "[DEMO] APT-29 (Cozy Bear)").first()
        if existing_ta:
            print("Development seed data already exists. Skipping insertion to avoid duplicates.")
            return

        print("Inserting development seed records...")

        # 1. Assets
        asset_db = Asset(
            name="[DEMO] DB-Cluster-01",
            type="Database",
            ip_address="10.0.50.100",
            hostname="db-prod-01",
            status="Active",
            criticality="critical"
        )
        asset_web = Asset(
            name="[DEMO] Web-Server-DMZ",
            type="Server",
            ip_address="172.16.20.15",
            hostname="dmz-web-01",
            status="Active",
            criticality="high"
        )
        db.add_all([asset_db, asset_web])
        
        # 2. Mitre Techniques
        mitre_1 = MitreTechnique(
            technique_id="T1190",
            name="[DEMO] Exploit Public-Facing Application",
            tactic="Initial Access"
        )
        mitre_2 = MitreTechnique(
            technique_id="T1059.001",
            name="[DEMO] PowerShell",
            tactic="Execution"
        )
        db.add_all([mitre_1, mitre_2])

        # 3. Threat Actor
        ta = ThreatActor(
            name="[DEMO] APT-29 (Cozy Bear)",
            aliases=["The Dukes", "YTTRIUM"],
            reputation="Known APT"
        )
        db.add(ta)

        # 4. Malware
        malware = Malware(
            name="[DEMO] SUNBURST",
            family="Backdoor"
        )
        db.add(malware)

        # 5. IOCs
        ioc_ip = IOC(
            type="ip",
            value="198.51.100.42",
            confidence=95,
            source="ThreatFox"
        )
        ioc_hash = IOC(
            type="hash",
            value="5b4bf3e5dfd41762cfafb3cebf74f57b",
            confidence=100,
            source="Internal Hunt"
        )
        db.add_all([ioc_ip, ioc_hash])
        
        # Flush to get IDs
        db.flush()

        # Build KB Relationships
        # Threat Actor -> Malware
        db.execute(threat_actor_malware_table.insert().values(threat_actor_id=ta.id, malware_id=malware.id))
        
        # Threat Actor -> IOC
        db.execute(threat_actor_iocs_table.insert().values(threat_actor_id=ta.id, ioc_id=ioc_ip.id))
        
        # Malware -> IOC
        db.execute(malware_iocs_table.insert().values(malware_id=malware.id, ioc_id=ioc_hash.id))

        # 6. Case
        case = Case(
            title="[DEMO] Suspected Sunburst Activity in DMZ",
            status="Open",
            severity="critical",
            priority="High",
            risk_score=95,
            description="Detected multiple anomalies originating from external IP tied to APT-29."
        )
        db.add(case)
        db.flush()

        # 7. Evidence
        ev = Evidence(
            case_id=case.id,
            evidence_type="IP",
            value="198.51.100.42",
            storage_path="/evidences/198.51.100.42.json"
        )
        db.add(ev)

        # 8. Alert
        alert = Alert(
            title="[DEMO] High Volume Data Exfiltration",
            threat_type="Exfiltration",
            risk_score=90,
            severity="critical",
            status="Open",
            source="Firewall Logs",
            case_id=case.id
        )
        db.add(alert)
        db.flush()

        # Alert -> Assets
        db.execute(alert_assets_table.insert().values(alert_id=alert.id, asset_id=asset_web.id))
        db.execute(alert_assets_table.insert().values(alert_id=alert.id, asset_id=asset_db.id))
        
        # Alert -> Mitre
        db.execute(alert_mitre_table.insert().values(alert_id=alert.id, mitre_id=mitre_1.id))
        db.execute(alert_mitre_table.insert().values(alert_id=alert.id, mitre_id=mitre_2.id))

        # 9. Investigation
        inv = Investigation(
            alert_id=alert.id,
            status="In Progress",
            summary="[DEMO] Security Analyst is actively investigating the DMZ web server compromise."
        )
        db.add(inv)

        db.commit()
        print("Development seed successfully completed!")
        print(f"Created Case: {case.title}")
        print(f"Created Alert: {alert.title}")
        print(f"Linked {len([asset_db, asset_web])} Assets, {len([mitre_1, mitre_2])} Mitre Techniques, 1 Threat Actor, 1 Malware, 2 IOCs.")
        
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise
    finally:
        db.close()

import argparse

def reset_attack_graph():
    print("Removing development seed for Attack Graph...")
    db: Session = SessionLocal()
    try:
        # Delete only [DEMO] tagged records safely
        cases = db.query(Case).filter(Case.title.like("[DEMO]%")).all()
        for case in cases:
            db.delete(case)
            
        alerts = db.query(Alert).filter(Alert.title.like("[DEMO]%")).all()
        for alert in alerts:
            db.delete(alert)
            
        assets = db.query(Asset).filter(Asset.name.like("[DEMO]%")).all()
        for asset in assets:
            db.delete(asset)
            
        mitres = db.query(MitreTechnique).filter(MitreTechnique.name.like("[DEMO]%")).all()
        for mitre in mitres:
            db.delete(mitre)
            
        tas = db.query(ThreatActor).filter(ThreatActor.name.like("[DEMO]%")).all()
        for ta in tas:
            db.delete(ta)
            
        mals = db.query(Malware).filter(Malware.name.like("[DEMO]%")).all()
        for mal in mals:
            db.delete(mal)
            
        # IOCs don't have titles, they are seeded with specific IPs
        iocs = db.query(IOC).filter(IOC.value.in_(["198.51.100.42", "5b4bf3e5dfd41762cfafb3cebf74f57b"])).all()
        for ioc in iocs:
            db.delete(ioc)
            
        invs = db.query(Investigation).filter(Investigation.summary.like("[DEMO]%")).all()
        for inv in invs:
            db.delete(inv)
            
        evidences = db.query(Evidence).filter(Evidence.storage_path == "/evidences/198.51.100.42.json").all()
        for ev in evidences:
            db.delete(ev)

        db.commit()
        print("Development seed data successfully removed.")
    except Exception as e:
        db.rollback()
        print(f"Error during reset: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Manage Attack Graph development seed data.")
    parser.add_argument("--reset", action="store_true", help="Remove the development seed data.")
    args = parser.parse_args()

    if args.reset:
        reset_attack_graph()
    else:
        seed_attack_graph()
