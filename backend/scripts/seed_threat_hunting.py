import argparse
from sqlalchemy.orm import Session
from app.db.session import engine
from app.core.database import SessionLocal
from app.models.hunting_model import SavedHunt

def seed_threat_hunting():
    print("Starting safe development-only seed for Threat Hunting...")
    db: Session = SessionLocal()
    try:
        # Check if already seeded to maintain idempotency
        existing = db.query(SavedHunt).filter(SavedHunt.name.like("[DEMO]%")).first()
        if existing:
            print("Development seed data already exists. Skipping insertion.")
            return

        print("Inserting development seed records...")

        hunts = [
            SavedHunt(
                name="[DEMO] RDP Brute Force Hunt",
                description="Hunts for multiple failed RDP logins followed by a success.",
                query="event_type:logon AND process_name:svchost.exe",
                mitre_mapping="T1110 - Brute Force",
                author="soc_admin"
            ),
            SavedHunt(
                name="[DEMO] Suspicious PowerShell Downloads",
                description="Hunts for PowerShell executing WebClient or Invoke-WebRequest.",
                query="process_name:powershell.exe AND (command_line:Net.WebClient OR command_line:Invoke-WebRequest)",
                mitre_mapping="T1059.001 - PowerShell",
                author="analyst_1"
            ),
            SavedHunt(
                name="[DEMO] C2 Beaconing Activity",
                description="Hunts for continuous outbound traffic to unknown IPs.",
                query="event_type:network_traffic AND ioc",
                mitre_mapping="T1571 - Non-Standard Port",
                author="threat_intel_team"
            )
        ]

        for h in hunts:
            db.add(h)
            
        db.commit()
        print("Development seed successfully completed!")
        print(f"Created {len(hunts)} Saved Hunts.")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise
    finally:
        db.close()

def reset_threat_hunting():
    print("Removing development seed for Threat Hunting...")
    db: Session = SessionLocal()
    try:
        hunts = db.query(SavedHunt).filter(SavedHunt.name.like("[DEMO]%")).all()
        for hunt in hunts:
            db.delete(hunt)

        db.commit()
        print("Development seed data successfully removed.")
    except Exception as e:
        db.rollback()
        print(f"Error during reset: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Manage Threat Hunting development seed data.")
    parser.add_argument("--reset", action="store_true", help="Remove the development seed data.")
    args = parser.parse_args()

    if args.reset:
        reset_threat_hunting()
    else:
        seed_threat_hunting()
