import asyncio
import uuid
import random
from app.db.session import async_session_maker
from app.models.identity import Organization, Role, User, UserRole
from app.models.operations import Case, Alert, Investigation, Evidence, TimelineEvent
from app.models.event_model import SecurityEvent
from app.core.security import get_password_hash
from app.core.roles import Role as RoleEnum, ROLE_PERMISSIONS_MAPPING
from app.schemas.operations import AlertCreate, CaseCreate

async def seed_data():
    async with async_session_maker() as db:
        # Create Default Organization
        org = Organization(
            id=uuid.uuid4(),
            name="Chrona Security",
            plan="Enterprise",
            status="Active"
        )
        db.add(org)
        await db.flush()

        # Create Roles
        role_map = {}
        for role_enum in RoleEnum:
            role = Role(
                id=uuid.uuid4(),
                name=role_enum.value,
                description=f"{role_enum.value} Role",
                permissions=ROLE_PERMISSIONS_MAPPING.get(role_enum, [])
            )
            db.add(role)
            role_map[role_enum.value] = role
        await db.flush()

        # Create Default Admin User
        admin_user = User(
            id=uuid.uuid4(),
            email="admin@chrona.local",
            name="System Administrator",
            hashed_password=get_password_hash("Admin123!@#"),
            org_id=org.id,
            status="Active"
        )
        db.add(admin_user)
        
        # Create SOC Analyst
        analyst_user = User(
            id=uuid.uuid4(),
            email="analyst@chrona.local",
            name="Alice SOC Analyst",
            hashed_password=get_password_hash("Analyst123!@#"),
            org_id=org.id,
            status="Active"
        )
        db.add(analyst_user)
        await db.flush()
        
        db.add(UserRole(user_id=admin_user.id, role_id=role_map[RoleEnum.SUPER_ADMIN.value].id))
        db.add(UserRole(user_id=analyst_user.id, role_id=role_map[RoleEnum.TIER_2_ANALYST.value].id))
        await db.flush()

        # Create Cases
        case1 = Case(
            id=uuid.uuid4(),
            title="Suspicious Login Activity from Russia",
            status="Open",
            severity="High",
            priority="High",
            risk_score=75,
            description="Multiple failed login attempts followed by a successful login from an unusual geographic location.",
            assignee_id=analyst_user.id
        )
        
        case2 = Case(
            id=uuid.uuid4(),
            title="Potential Ransomware Execution on DEV-SRV-01",
            status="In Progress",
            severity="Critical",
            priority="Critical",
            risk_score=98,
            description="Mass file encryption activity detected by EDR alongside known ransomware IOCs.",
            assignee_id=admin_user.id
        )
        db.add_all([case1, case2])
        await db.flush()

        # Create Alerts
        alert1 = Alert(
            id=uuid.uuid4(),
            title="Impossible Travel Detected",
            threat_type="Credential Access",
            risk_score=70,
            severity="High",
            status="Open",
            source="Azure AD",
            mitre_tactic="Initial Access",
            mitre_technique="Valid Accounts",
            raw_log={"ip": "45.22.11.9", "location": "Moscow, RU", "user": "exec@chrona.local"},
            case_id=case1.id
        )
        
        alert2 = Alert(
            id=uuid.uuid4(),
            title="EDR: Ransomware Behavior Blocked",
            threat_type="Malware",
            risk_score=95,
            severity="Critical",
            status="In Progress",
            source="CrowdStrike",
            mitre_tactic="Impact",
            mitre_technique="Data Encrypted for Impact",
            raw_log={"host": "DEV-SRV-01", "process": "encryptor.exe", "action": "blocked"},
            case_id=case2.id
        )
        db.add_all([alert1, alert2])
        await db.flush()
        
        # Create Investigations
        inv1 = Investigation(
            id=uuid.uuid4(),
            alert_id=alert2.id,
            status="In Progress",
            summary="Analyzing the process tree of encryptor.exe to determine initial infection vector.",
            findings=[{"type": "hash", "value": "a1b2c3d4e5f6g7h8i9j0"}],
            assignee_id=admin_user.id
        )
        db.add(inv1)
        
        # Create Evidence
        ev1 = Evidence(
            id=uuid.uuid4(),
            case_id=case2.id,
            evidence_type="File Hash",
            value="a1b2c3d4e5f6g7h8i9j0",
            storage_path="s3://chrona/evidence/encryptor.exe"
        )
        db.add(ev1)
        
        # Create Timeline Events
        tl1 = TimelineEvent(
            id=uuid.uuid4(),
            case_id=case2.id,
            user_id=admin_user.id,
            action_type="Status Change",
            content="Changed case status to In Progress"
        )
        db.add(tl1)

        await db.commit()
        print("Seed data loaded successfully with operational records!")

        # Seed Security Events
        await seed_events(db)
        
from datetime import datetime, timezone

async def seed_events(db):
    print("Seeding 150 realistic security events...")
    events = []
    
    # 1. Windows Logons
    for i in range(50):
        events.append(SecurityEvent(
            id=uuid.uuid4(),
            event_id=f"win-logon-{i}",
            timestamp=datetime(2026, 7, 25, 10, i%60, 0, tzinfo=timezone.utc),
            source="windows_event_log",
            vendor="Microsoft",
            product="Windows",
            hostname="DESKTOP-FIN-01",
            user_account="jdoe",
            ip_address=f"192.168.1.{100 + i}",
            event_type="logon",
            severity="info",
            status="success",
            raw_event={"EventID": 4624, "LogonType": 3, "AccountName": "jdoe"},
            normalized_data={"action": "login", "outcome": "success"},
            tags=["authentication", "internal"]
        ))
        
    # 2. Failed Logins (Brute Force Simulation)
    for i in range(30):
        events.append(SecurityEvent(
            id=uuid.uuid4(),
            event_id=f"win-failed-logon-{i}",
            timestamp=datetime(2026, 7, 25, 11, i%60, 0, tzinfo=timezone.utc),
            source="windows_event_log",
            vendor="Microsoft",
            product="Windows",
            hostname="SRV-DB-01",
            user_account="admin",
            ip_address="45.22.11.9",
            event_type="logon",
            severity="high",
            status="failure",
            raw_event={"EventID": 4625, "LogonType": 3, "AccountName": "admin"},
            normalized_data={"action": "login", "outcome": "failure", "threat": "brute_force"},
            mitre_techniques=["T1110"],
            tags=["authentication", "external", "suspicious"]
        ))

    # 3. CrowdStrike Alerts
    for i in range(40):
        events.append(SecurityEvent(
            id=uuid.uuid4(),
            event_id=f"cs-alert-{i}",
            timestamp=datetime(2026, 7, 25, 12, i%60, 0, tzinfo=timezone.utc),
            source="crowdstrike",
            vendor="CrowdStrike",
            product="Falcon",
            hostname="DEV-SRV-01",
            user_account="SYSTEM",
            process_name="powershell.exe",
            command_line="powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -EncodedCommand JABz...",
            event_type="process_creation",
            severity="critical",
            status="blocked",
            raw_event={"DetectId": f"ld_{i}", "FileName": "powershell.exe", "Behavior": "Suspicious execution"},
            normalized_data={"action": "process_execution", "outcome": "blocked"},
            mitre_techniques=["T1059.001", "T1027"],
            tags=["edr", "malware", "powershell"]
        ))
        
    # 4. Firewall Blocks
    for i in range(30):
        events.append(SecurityEvent(
            id=uuid.uuid4(),
            event_id=f"fw-block-{i}",
            timestamp=datetime(2026, 7, 25, 13, i%60, 0, tzinfo=timezone.utc),
            source="syslog",
            vendor="PaloAlto",
            product="PAN-OS",
            ip_address=f"10.0.0.{i}",
            destination_ip="185.15.22.1",
            event_type="network_traffic",
            severity="medium",
            status="blocked",
            raw_event={"rule": "Block_Malicious_IPs", "action": "deny", "src": f"10.0.0.{i}", "dst": "185.15.22.1", "port": 443},
            normalized_data={"action": "network_connection", "outcome": "blocked"},
            tags=["network", "firewall"]
        ))

    db.add_all(events)
    await db.commit()
    print("Successfully seeded 150 security events!")

if __name__ == "__main__":
    asyncio.run(seed_data())
