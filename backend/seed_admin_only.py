import asyncio
import uuid
from sqlalchemy.future import select
from app.db.session import async_session_maker
from app.models.identity import Organization, User, Role, UserRole
from app.core.security import get_password_hash
from app.core.roles import Role as RoleEnum, ROLE_PERMISSIONS_MAPPING

async def seed_admin():
    async with async_session_maker() as db:
        print("Seeding admin and RBAC roles...")
        
        # 1. Get or create organization
        result = await db.execute(select(Organization).where(Organization.name == "Chrona Security"))
        org = result.scalars().first()
        if not org:
            org = Organization(
                id=uuid.uuid4(),
                name="Chrona Security",
                plan="Enterprise",
                status="Active"
            )
            db.add(org)
            await db.flush()
            print("Created Chrona Security organization.")

        # 2. Sync all roles
        role_map = {}
        for role_enum in RoleEnum:
            res = await db.execute(select(Role).where(Role.name == role_enum.value))
            role = res.scalars().first()
            if not role:
                role = Role(
                    id=uuid.uuid4(),
                    name=role_enum.value,
                    description=f"{role_enum.value} Role",
                    permissions=ROLE_PERMISSIONS_MAPPING.get(role_enum, [])
                )
                db.add(role)
                print(f"Created role: {role.name}")
            else:
                # Update permissions to ensure they match current mapping
                role.permissions = ROLE_PERMISSIONS_MAPPING.get(role_enum, [])
            role_map[role_enum.value] = role
            
        await db.flush()

        import os
        admin_pwd = os.environ.get("ADMIN_PASSWORD", "Admin123!@#")

        # 3. Get or create admin user
        result = await db.execute(select(User).where(User.email == "admin@chrona.local"))
        admin_user = result.scalars().first()
        if not admin_user:
            admin_user = User(
                id=uuid.uuid4(),
                email="admin@chrona.local",
                name="System Administrator",
                hashed_password=get_password_hash(admin_pwd),
                org_id=org.id,
                status="Active"
            )
            db.add(admin_user)
            await db.flush()
            print("Created admin@chrona.local user.")
        else:
            print("User admin@chrona.local already exists.")

        # 4. Assign Super Admin role to admin user if not already assigned
        super_admin_role = role_map[RoleEnum.SUPER_ADMIN.value]
        res = await db.execute(
            select(UserRole).where(
                UserRole.user_id == admin_user.id, 
                UserRole.role_id == super_admin_role.id
            )
        )
        user_role = res.scalars().first()
        if not user_role:
            db.add(UserRole(user_id=admin_user.id, role_id=super_admin_role.id))
            print("Assigned Super Admin role to admin@chrona.local.")
        else:
            print("Admin already has Super Admin role.")

        await db.commit()
        print("Admin user and RBAC seeded successfully.")

if __name__ == "__main__":
    asyncio.run(seed_admin())
