import asyncio
import asyncpg
import sqlite3
import uuid
from datetime import datetime

def parse_dt(dt_str):
    if not dt_str:
        return datetime.utcnow()
    # SQLite datetime is like '2026-08-09 11:54:39.655391'
    return datetime.fromisoformat(dt_str)

async def run_migration():
    pg_conn = await asyncpg.connect(user="shambhavisinha", database="chrona_db", host="127.0.0.1", port=5432)
    sq_conn = sqlite3.connect('chrona_soc.db')
    sq_conn.row_factory = sqlite3.Row
    cur = sq_conn.cursor()

    required_emails = ['admin@chrona.local', 'shambhavi1691@gmail.com']
    
    print("--- 1. PRE-FLIGHT VERIFICATION ---")
    users_to_migrate = []
    orgs_to_migrate = {}
    roles_to_migrate = []

    for email in required_emails:
        cur.execute("SELECT * FROM users WHERE email=?", (email,))
        u = cur.fetchone()
        if not u:
            print(f"User {email} not found in SQLite.")
            return

        uid = str(uuid.UUID(u['id']))
        org_id = str(uuid.UUID(u['org_id']))
        
        # Check conflict in PG
        if await pg_conn.fetchval("SELECT 1 FROM users WHERE id=$1 OR email=$2", uid, email):
            print(f"CONFLICT: User {email} or ID {uid} already exists in PG.")
            return
            
        users_to_migrate.append((u, uid, org_id))
        
        # Organization
        cur.execute("SELECT * FROM organizations WHERE id=?", (u['org_id'],))
        org = cur.fetchone()
        if org_id not in orgs_to_migrate:
            # Check if org exists in PG
            org_exists = await pg_conn.fetchval("SELECT 1 FROM organizations WHERE id=$1", org_id)
            if not org_exists:
                orgs_to_migrate[org_id] = org
        
        # Roles
        cur.execute("SELECT r.id as role_id, r.name as role_name, ur.created_at, ur.updated_at FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id=?", (u['id'],))
        for r in cur.fetchall():
            role_name = r['role_name']
            # Check if role exists in PG by name
            pg_role_id = await pg_conn.fetchval("SELECT id FROM roles WHERE name=$1", role_name)
            if not pg_role_id:
                print(f"ERROR: Role {role_name} does NOT exist in PG. Cannot assign.")
                return
            roles_to_migrate.append({
                'user_id': uid,
                'role_id': pg_role_id,
                'created_at': r['created_at'],
                'updated_at': r['updated_at']
            })

    print("Pre-flight successful. No conflicts.")

    print("\n--- TRANSACTIONAL EXECUTION ---")
    async with pg_conn.transaction():
        # Insert Orgs
        for oid, org in orgs_to_migrate.items():
            print(f"Inserting Organization: {org['name']}")
            await pg_conn.execute(
                "INSERT INTO organizations (id, name, plan, status, is_deleted, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)",
                oid, org['name'], org['plan'], org['status'], bool(org['is_deleted']), parse_dt(org['created_at']), parse_dt(org['updated_at'])
            )

        # Insert Users
        for u, uid, org_id in users_to_migrate:
            print(f"Inserting User: {u['email']}")
            mfa = bool(u['mfa_enabled']) if u['mfa_enabled'] is not None else False
            is_del = bool(u['is_deleted']) if u['is_deleted'] is not None else False
            await pg_conn.execute(
                "INSERT INTO users (id, email, name, hashed_password, status, mfa_enabled, org_id, session_version, created_at, updated_at, is_deleted) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
                uid, u['email'], u['name'], u['hashed_password'], u['status'], mfa, org_id, getattr(u, 'session_version', 1) if 'session_version' in u.keys() else 1, parse_dt(u['created_at']), parse_dt(u['updated_at']), is_del
            )

        # Insert UserRoles
        for ur in roles_to_migrate:
            print(f"Inserting UserRole link for user {ur['user_id']}")
            await pg_conn.execute(
                "INSERT INTO user_roles (user_id, role_id, created_at, updated_at) VALUES ($1, $2, $3, $4)",
                ur['user_id'], ur['role_id'], parse_dt(ur['created_at']), parse_dt(ur['updated_at'])
            )

    print("\n--- POST-MIGRATION VERIFICATION ---")
    for email in required_emails:
        pg_user = await pg_conn.fetchrow("SELECT id, email, status, org_id, hashed_password IS NOT NULL as has_pwd FROM users WHERE email=$1", email)
        if pg_user:
            role = await pg_conn.fetchval("SELECT r.name FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id=$1", pg_user['id'])
            print(f"Verified PG: {pg_user['email']} | ID: {pg_user['id']} | Org: {pg_user['org_id']} | Role: {role} | Status: {pg_user['status']} | Has Hash: {pg_user['has_pwd']}")
        else:
            print(f"Failed to verify PG: {email}")

    test_user = await pg_conn.fetchrow("SELECT email FROM users WHERE email='chrona.functional.test@example.com'")
    print(f"Functional Test User Exists: {'Yes' if test_user else 'No'}")

    await pg_conn.close()
    sq_conn.close()

asyncio.run(run_migration())
