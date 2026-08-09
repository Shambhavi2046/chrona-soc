import asyncio
import sqlite3
import uuid
import datetime
import json
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.future import select
from app.core.config import settings
from app.models.identity import User, Organization, Role
from app.models.operations import Case, Alert, TimelineEvent

def map_to_uuid(id_val):
    if not id_val:
        return "00000000-0000-0000-0000-000000000000"
    
    id_str = str(id_val)
    hash_val = 0
    for char in id_str:
        hash_val = ((hash_val << 5) - hash_val) + ord(char)
        hash_val &= 0xFFFFFFFF
    
    if hash_val & 0x80000000:
        hash_val = hash_val - 0x100000000
    
    hex_str = f"{abs(hash_val):08x}"
    return f"{hex_str}-aaaa-4000-8000-a00000000000"

async def migrate_legacy_data():
    print("Starting legacy data migration...")
    
    # 1. Connect to legacy database directly using sqlite3
    legacy_conn = sqlite3.connect("chrona.db")
    legacy_conn.row_factory = sqlite3.Row
    cursor = legacy_conn.cursor()
    
    # Fetch legacy records
    cursor.execute("SELECT * FROM cases;")
    legacy_cases = cursor.fetchall()
    
    cursor.execute("SELECT * FROM alerts;")
    legacy_alerts = cursor.fetchall()
    
    cursor.execute("SELECT * FROM timeline_events;")
    legacy_events = cursor.fetchall()
    
    cursor.execute("SELECT * FROM logs;")
    legacy_logs = cursor.fetchall()
    
    legacy_logs_dict = {str(log['id']): dict(log) for log in legacy_logs}
    
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = async_sessionmaker(engine, expire_on_commit=False)
    
    async with async_session() as db:
        async with db.begin():
            stats = {"cases": 0, "alerts": 0, "events": 0, "skipped": 0, "failed": 0}
            
            # Map of old integer id -> translated UUID string
            case_id_map = {}
            
            # Migrate Cases
            for l_case in legacy_cases:
                old_id = l_case['id']
                new_id_str = map_to_uuid(old_id)
                new_id_uuid = uuid.UUID(new_id_str)
                case_id_map[old_id] = new_id_uuid
                
                # Check idempotency
                existing_case = await db.execute(select(Case).filter(Case.id == new_id_uuid))
                if existing_case.scalars().first():
                    print(f"Skipping case {old_id} -> {new_id_uuid} (already exists)")
                    stats["skipped"] += 1
                    continue
                
                # Set severity mapping based on priority/risk_score
                priority = l_case['priority'] or "Medium"
                severity = priority # Fallback for V1
                
                created_dt = datetime.datetime.fromisoformat(l_case['created_at']) if l_case['created_at'] else datetime.datetime.utcnow()
                updated_dt = datetime.datetime.fromisoformat(l_case['updated_at']) if l_case['updated_at'] else created_dt
                
                new_case = Case(
                    id=new_id_uuid,
                    title=l_case['title'],
                    description=l_case['description'] or "",
                    status=l_case['status'],
                    priority=priority,
                    severity=severity,
                    risk_score=l_case['risk_score'],
                    created_at=created_dt,
                    updated_at=updated_dt,
                    is_deleted=False
                )
                db.add(new_case)
                stats["cases"] += 1
                
            # Migrate Alerts
            for l_alert in legacy_alerts:
                old_id = l_alert['id']
                new_id_str = map_to_uuid(old_id)
                new_id_uuid = uuid.UUID(new_id_str)
                
                # Check idempotency
                existing_alert = await db.execute(select(Alert).filter(Alert.id == new_id_uuid))
                if existing_alert.scalars().first():
                    print(f"Skipping alert {old_id} -> {new_id_uuid} (already exists)")
                    stats["skipped"] += 1
                    continue
                
                # Find matching case mapping
                # Legacy Alert didn't store case_id, Case stored alert_id
                matched_case_uuid = None
                for l_case in legacy_cases:
                    if l_case['alert_id'] == old_id:
                        matched_case_uuid = case_id_map.get(l_case['id'])
                        break
                
                # Embed log
                raw_log = None
                log_id = l_alert['log_id']
                if log_id and str(log_id) in legacy_logs_dict:
                    raw_log = legacy_logs_dict[str(log_id)]
                
                severity = "Medium"
                if l_alert['risk_score']:
                    if l_alert['risk_score'] >= 80: severity = "Critical"
                    elif l_alert['risk_score'] >= 60: severity = "High"
                
                created_dt = datetime.datetime.fromisoformat(l_alert['created_at']) if l_alert['created_at'] else datetime.datetime.utcnow()
                
                new_alert = Alert(
                    id=new_id_uuid,
                    title=f"Alert: {l_alert['threat_type']}",
                    threat_type=l_alert['threat_type'],
                    risk_score=l_alert['risk_score'],
                    status=l_alert['status'],
                    severity=severity,
                    case_id=matched_case_uuid,
                    raw_log=raw_log,
                    created_at=created_dt,
                    updated_at=created_dt,
                )
                db.add(new_alert)
                stats["alerts"] += 1
                
            # Migrate Timeline Events
            for l_event in legacy_events:
                old_id = l_event['id']
                new_id_str = map_to_uuid(old_id)
                new_id_uuid = uuid.UUID(new_id_str)
                
                existing_ev = await db.execute(select(TimelineEvent).filter(TimelineEvent.id == new_id_uuid))
                if existing_ev.scalars().first():
                    print(f"Skipping timeline event {old_id} -> {new_id_uuid} (already exists)")
                    stats["skipped"] += 1
                    continue
                
                mapped_case_uuid = case_id_map.get(l_event['case_id'])
                if not mapped_case_uuid:
                    print(f"Skipping event {old_id} (missing case_id mapping)")
                    stats["failed"] += 1
                    continue
                
                content = l_event['content']
                if l_event['author']:
                    content = f"[{l_event['author']}] {content}"
                    
                created_dt = datetime.datetime.fromisoformat(l_event['created_at']) if l_event['created_at'] else datetime.datetime.utcnow()
                
                new_event = TimelineEvent(
                    id=new_id_uuid,
                    case_id=mapped_case_uuid,
                    action_type=l_event['event_type'],
                    content=content,
                    created_at=created_dt,
                    updated_at=created_dt
                )
                db.add(new_event)
                stats["events"] += 1

            print(f"Migration finished. Stats: {stats}")

if __name__ == "__main__":
    asyncio.run(migrate_legacy_data())
