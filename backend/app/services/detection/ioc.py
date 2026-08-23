from typing import Optional, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.models.event_model import SecurityEvent
from app.models.operations import IOC

class IOCMatcher:
    @staticmethod
    async def check_event(db: AsyncSession, event: SecurityEvent, org_id: Optional[Any] = None) -> dict:
        """
        Check event fields against known IOCs in the database.
        Returns a dict of matched IOCs if found.
        """
        matches = {}
        
        # Collect potential IOC values from the event
        potential_values = []
        if event.ip_address:
            potential_values.append(event.ip_address)
        if event.destination_ip:
            potential_values.append(event.destination_ip)
            
        # Check hashes if present in normalized data
        if event.normalized_data and "hash" in event.normalized_data:
            potential_values.append(event.normalized_data["hash"])
            
        if not potential_values:
            return matches
            
        query = select(IOC).filter(
            IOC.value.in_(potential_values),
            IOC.status == "Active"
        )
        
        if org_id:
            query = query.filter(or_(IOC.org_id == org_id, IOC.org_id.is_(None)))
        else:
            query = query.filter(IOC.org_id.is_(None))
            
        result = await db.execute(query)
        iocs = result.scalars().all()
        
        for ioc in iocs:
            matches[ioc.value] = {
                "type": ioc.type,
                "threat": ioc.category or "Unknown",
                "confidence": ioc.confidence,
                "source": ioc.source
            }
                
        return matches

ioc_matcher = IOCMatcher()
