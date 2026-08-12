import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { AlertCircle, Activity, Globe, Hash, ShieldAlert, Skull, Bug, Network, Target, Database, Laptop, Server } from 'lucide-react';

// Wrapper for common SOC node styling
const BaseNode = ({ icon: Icon, label, type, selected, color, badge }: any) => {
  return (
    <div className={`relative px-4 py-3 rounded-lg border-2 bg-soc-bg shadow-lg transition-all min-w-[150px]
      ${selected ? `border-${color} shadow-${color}/20 scale-105` : 'border-soc-border hover:border-gray-500'}
    `}>
      <Handle type="target" position={Position.Top} className="!bg-gray-500 !w-2 !h-2 !border-none" />
      
      <div className="flex items-center gap-3">
        <div className={`p-1.5 rounded bg-soc-card border border-${color}/30 text-${color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] uppercase tracking-wider font-semibold text-soc-text-muted">{type}</span>
          <span className="text-xs font-bold text-soc-text-primary truncate max-w-[150px]">{label}</span>
        </div>
      </div>
      
      {badge && (
        <div className={`absolute -top-2 -right-2 text-[8px] uppercase font-bold px-1.5 py-0.5 rounded-full border bg-soc-bg border-${color} text-${color}`}>
          {badge}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-gray-500 !w-2 !h-2 !border-none" />
    </div>
  );
};

export const CaseNode = ({ data, selected }: any) => {
  const color = data.priority === 'Critical' ? 'soc-danger' : data.priority === 'High' ? 'soc-warning' : 'soc-accent';
  return <BaseNode icon={Activity} label={data.label} type="Case" selected={selected} color={color} badge={data.status} />;
};

export const AlertNode = ({ data, selected }: any) => {
  return <BaseNode icon={AlertCircle} label={data.label} type="Alert" selected={selected} color="soc-danger" badge={`Risk: ${data.risk_score}`} />;
};

export const AssetNode = ({ data, selected }: any) => {
  let Icon = Database;
  if (data.icon === 'Server') Icon = Server;
  if (data.icon === 'Laptop') Icon = Laptop;
  
  const color = data.severity === 'critical' ? 'soc-danger' : data.severity === 'high' ? 'soc-warning' : 'soc-success';
  return <BaseNode icon={Icon} label={data.label} type="Asset" selected={selected} color={color} badge={data.severity} />;
};

export const IocNode = ({ data, selected }: any) => {
  let Icon = Network;
  if (data.ioc_type === 'ip') Icon = Globe;
  if (data.ioc_type === 'hash') Icon = Hash;
  
  const color = data.confidence === 'Critical' ? 'soc-danger' : data.confidence === 'High' ? 'soc-warning' : 'soc-accent';
  return <BaseNode icon={Icon} label={data.label} type="IOC" selected={selected} color={color} badge={data.confidence} />;
};

export const ThreatActorNode = ({ data, selected }: any) => {
  return <BaseNode icon={Skull} label={data.label} type="Threat Actor" selected={selected} color="soc-danger" />;
};

export const MalwareNode = ({ data, selected }: any) => {
  return <BaseNode icon={Bug} label={data.label} type="Malware" selected={selected} color="soc-warning" />;
};

export const MitreNode = ({ data, selected }: any) => {
  return <BaseNode icon={Target} label={data.label} type="MITRE Tactic" selected={selected} color="purple-400" />;
};

import { Search, FileText, User } from 'lucide-react';

export const InvestigationNode = ({ data, selected }: any) => {
  return <BaseNode icon={Search} label={data.label} type="Investigation" selected={selected} color="soc-accent" badge={data.status} />;
};

export const EvidenceNode = ({ data, selected }: any) => {
  return <BaseNode icon={FileText} label={data.label} type="Evidence" selected={selected} color="soc-muted" badge={data.evidence_type} />;
};

export const UserNode = ({ data, selected }: any) => {
  return <BaseNode icon={User} label={data.label} type="User" selected={selected} color="gray-400" />;
};
