from pydantic import BaseModel, ConfigDict
from typing import List, Dict, Any, Optional

class GraphNodeSchema(BaseModel):
    id: str
    type: str # case, alert, asset, user, ip, domain, url, hash, threat_actor, malware, mitre
    data: Dict[str, Any] # label, icon, risk_score, severity, description, status, etc.
    
    model_config = ConfigDict(from_attributes=True)

class GraphEdgeSchema(BaseModel):
    id: str
    source: str
    target: str
    type: str = "default" # default, solid, dashed, animated
    label: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class GraphTopologySchema(BaseModel):
    nodes: List[GraphNodeSchema]
    edges: List[GraphEdgeSchema]
    
    model_config = ConfigDict(from_attributes=True)
