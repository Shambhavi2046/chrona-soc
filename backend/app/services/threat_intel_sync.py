import logging
import re
import ipaddress
import uuid
import httpx
import socket
from urllib.parse import urlparse, urljoin
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from app.models.operations import ThreatFeed, IOC
from app.repositories.threat_intel import threat_feed_repo, ioc_repo

logger = logging.getLogger(__name__)

class ThreatFeedSyncService:
    def _is_safe_url(self, url: str) -> bool:
        """Prevent SSRF by rejecting local and private IP addresses."""
        try:
            parsed = urlparse(url)
            hostname = parsed.hostname
            if not hostname:
                return False
                
            # Block obvious localhost names and metadata
            if hostname.lower() in ["localhost", "metadata.google.internal", "169.254.169.254"]:
                return False
                
            # Resolve to IP
            try:
                ip = ipaddress.ip_address(hostname)
            except ValueError:
                try:
                    resolved_ip = socket.gethostbyname(hostname)
                    ip = ipaddress.ip_address(resolved_ip)
                except socket.gaierror:
                    return False
                
            if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_multicast:
                return False
                
            return True
        except Exception:
            return False

    def _parse_indicators(self, content: str) -> list:
        """Parse IPs, Domains, and Hashes from text content."""
        indicators = []
        lines = content.splitlines()
        
        for line in lines:
            line = line.strip()
            # Ignore comments and empty lines
            if not line or line.startswith("#"):
                continue
                
            # Extract first word to handle inline comments
            indicator = line.split()[0]
            
            # 1. Check IP
            try:
                ipaddress.ip_address(indicator)
                indicators.append({"type": "ip", "value": indicator})
                continue
            except ValueError:
                pass
                
            # 2. Check MD5/SHA1/SHA256
            if re.match(r'^[a-fA-F0-9]{32}$|^[a-fA-F0-9]{40}$|^[a-fA-F0-9]{64}$', indicator):
                indicators.append({"type": "hash", "value": indicator.lower()})
                continue
                
            # 3. Check simple domain (basic regex)
            if re.match(r'^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$', indicator):
                indicators.append({"type": "domain", "value": indicator.lower()})
                continue
                
        return indicators

    async def sync_feed(self, db: AsyncSession, feed_id: uuid.UUID, org_id: uuid.UUID = None) -> dict:
        """Manually trigger a sync for a specific ThreatFeed."""
        feed = await threat_feed_repo.get(db, id=feed_id, org_id=org_id)
        if not feed:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="ThreatFeed not found")
            
        if feed.status != "Active":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot sync inactive feed")
            
        if not self._is_safe_url(feed.url):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsafe or invalid feed URL")

        logger.info(f"Starting sync for ThreatFeed: {feed.name} ({feed.url})")
        
        try:
            current_url = feed.url
            max_redirects = 5
            content = ""
            
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=False) as client:
                for _ in range(max_redirects + 1):
                    if not self._is_safe_url(current_url):
                        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Unsafe or invalid feed URL: {current_url}")
                        
                    async with client.stream("GET", current_url) as response:
                        if response.status_code in (301, 302, 303, 307, 308):
                            current_url = response.headers.get("location")
                            if not current_url:
                                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid redirect missing location")
                            current_url = urljoin(str(response.url), current_url)
                            continue
                            
                        response.raise_for_status()
                        
                        bytes_received = 0
                        max_bytes = 5 * 1024 * 1024  # 5 MB limit
                        
                        async for chunk in response.aiter_text():
                            bytes_received += len(chunk.encode('utf-8'))
                            if bytes_received > max_bytes:
                                raise HTTPException(status_code=400, detail="Feed response exceeds 5MB limit")
                            content += chunk
                        
                        break # Success
                else:
                    raise HTTPException(status_code=400, detail="Too many redirects")
                        
        except httpx.RequestError as exc:
            logger.error(f"Error fetching feed {feed.name}: {exc}")
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Failed to fetch feed: {exc}")
            
        indicators = self._parse_indicators(content)
        
        inserted_count = 0
        updated_count = 0
        
        # Process and upsert
        for item in indicators:
            value = item["value"]
            ioc_type = item["type"]
            
            # Check if IOC already exists for this tenant (or globally if this feed is global)
            query = select(IOC).filter(IOC.value == value)
            if feed.org_id:
                query = query.filter(IOC.org_id == feed.org_id)
            else:
                query = query.filter(IOC.org_id.is_(None))
                
            result = await db.execute(query)
            existing_ioc = result.scalars().first()
            
            if existing_ioc:
                # Update existing (ensure it's active)
                if existing_ioc.status != "Active":
                    existing_ioc.status = "Active"
                    existing_ioc.confidence = 50  # reset default confidence
                    updated_count += 1
            else:
                # Create new
                new_ioc = IOC(
                    id=uuid.uuid4(),
                    org_id=feed.org_id,
                    type=ioc_type,
                    value=value,
                    confidence=50,
                    source=feed.name,
                    status="Active",
                    category="Threat Feed Indicator"
                )
                db.add(new_ioc)
                inserted_count += 1
                
        # Update feed timestamp
        feed.last_sync = datetime.utcnow()
        db.add(feed)
        await db.commit()
        
        logger.info(f"Sync complete for {feed.name}. Inserted: {inserted_count}, Updated: {updated_count}")
        return {
            "status": "success",
            "feed_id": str(feed.id),
            "inserted": inserted_count,
            "updated": updated_count,
            "total_extracted": len(indicators)
        }

threat_feed_sync_service = ThreatFeedSyncService()
