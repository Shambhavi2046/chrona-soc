"use client";

import React, { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
  Controls,
  Background,
  MarkerType,
  Position,
  ConnectionLineType,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { GraphTopology } from '@/lib/api';

import { CaseNode, AlertNode, AssetNode, IocNode, ThreatActorNode, MalwareNode, MitreNode } from './CustomNodes';
import NodeDetailPanel from './NodeDetailPanel';
import { RefreshCw } from 'lucide-react';

const nodeTypes = {
  case: CaseNode,
  alert: AlertNode,
  asset: AssetNode,
  ioc: IocNode,
  threat_actor: ThreatActorNode,
  malware: MalwareNode,
  mitre: MitreNode,
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: any[], edges: any[], direction = 'LR') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction, align: 'DL', nodesep: 100, ranksep: 250 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 250, height: 80 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - 250 / 2,
        y: nodeWithPosition.y - 80 / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

interface AttackGraphViewerProps {
  topology: GraphTopology;
}

export default function AttackGraphViewer({ topology }: AttackGraphViewerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  useEffect(() => {
    // Transform backend topology into React Flow format
    const rfNodes = topology.nodes.map(n => ({
      id: n.id,
      type: n.type,
      data: { ...n.data, id: n.id },
      position: { x: 0, y: 0 } // handled by layout
    }));
    
    const rfEdges = topology.edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: e.type === 'animated',
      style: { stroke: e.type === 'dashed' ? '#6b7280' : '#4b5563', strokeWidth: 2, strokeDasharray: e.type === 'dashed' ? '5,5' : 'none' },
      markerEnd: { type: MarkerType.ArrowClosed, color: e.type === 'dashed' ? '#6b7280' : '#4b5563' },
      labelStyle: { fill: '#9ca3af', fontWeight: 700, fontSize: 10, fontFamily: 'monospace' },
      labelBgStyle: { fill: '#1f2937', color: '#fff', fillOpacity: 0.8 },
      type: 'smoothstep'
    }));

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(rfNodes, rfEdges, 'LR');
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [topology]);

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge({ ...params, type: ConnectionLineType.SmoothStep, animated: true }, eds)), []);

  const onNodeClick = (_: any, node: any) => {
    setSelectedNode(node);
  };

  const onLayout = useCallback((direction: string) => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, direction);
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
  }, [nodes, edges]);

  return (
    <div className="w-full h-full relative bg-soc-bg border border-soc-border rounded-xl overflow-hidden glass-card">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        className="bg-soc-bg"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#374151" gap={24} size={2} />
        <Controls className="!bg-soc-card !border-soc-border !text-gray-300 fill-gray-300" />
        <MiniMap 
          nodeColor={(n) => {
            if (n.type === 'alert' || n.type === 'threat_actor') return '#ef4444';
            if (n.type === 'case' || n.type === 'ioc') return '#3b82f6';
            if (n.type === 'asset') return '#22c55e';
            return '#6b7280';
          }}
          maskColor="rgba(17, 24, 39, 0.7)"
          className="!bg-soc-bg !border !border-soc-border rounded-lg shadow-xl"
        />
        
        <Panel position="top-left" className="m-4">
          <div className="flex gap-2">
            <button onClick={() => onLayout('LR')} className="px-3 py-1.5 bg-soc-card border border-soc-border hover:border-soc-accent rounded text-xs text-gray-300 hover:text-white transition-colors flex items-center gap-2">
              <RefreshCw className="w-3 h-3" /> Horizontal
            </button>
            <button onClick={() => onLayout('TB')} className="px-3 py-1.5 bg-soc-card border border-soc-border hover:border-soc-accent rounded text-xs text-gray-300 hover:text-white transition-colors flex items-center gap-2">
              <RefreshCw className="w-3 h-3" /> Vertical
            </button>
          </div>
        </Panel>

      </ReactFlow>

      {selectedNode && (
        <NodeDetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
      )}
    </div>
  );
}
