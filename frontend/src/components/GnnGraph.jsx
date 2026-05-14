/**
 * GnnGraph.jsx
 * Interactive React Flow knowledge graph with custom concept nodes.
 *
 * Props:
 *   nodes  — array of React Flow node objects (type: 'concept')
 *   edges  — array of React Flow edge objects
 *   height — container height in px (default 480)
 */

import { useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// ─── Status Config ────────────────────────────────────────────────────────────

const STATUS = {
  mastered: {
    ring:   'ring-2 ring-emerald-400',
    bg:     'bg-emerald-50',
    border: 'border-emerald-300',
    dot:    'bg-emerald-500',
    label:  'text-emerald-800',
    tag:    'bg-emerald-100 text-emerald-700',
    tagTxt: 'Mastered',
    glow:   '0 0 0 3px rgba(16,185,129,0.25)',
  },
  active: {
    ring:   'ring-2 ring-indigo-400',
    bg:     'bg-indigo-50',
    border: 'border-indigo-300',
    dot:    'bg-indigo-500 animate-pulse',
    label:  'text-indigo-800',
    tag:    'bg-indigo-100 text-indigo-700',
    tagTxt: 'In Progress',
    glow:   '0 0 0 3px rgba(99,102,241,0.3)',
  },
  failing: {
    ring:   'ring-2 ring-red-400',
    bg:     'bg-red-50',
    border: 'border-red-300',
    dot:    'bg-red-500',
    label:  'text-red-800',
    tag:    'bg-red-100 text-red-700',
    tagTxt: 'Needs Review',
    glow:   '0 0 0 3px rgba(239,68,68,0.25)',
  },
  pending: {
    ring:   '',
    bg:     'bg-amber-50',
    border: 'border-amber-200',
    dot:    'bg-amber-400',
    label:  'text-amber-800',
    tag:    'bg-amber-100 text-amber-700',
    tagTxt: 'Pending',
    glow:   'none',
  },
  unlearned: {
    ring:   '',
    bg:     'bg-slate-50',
    border: 'border-slate-200',
    dot:    'bg-slate-300',
    label:  'text-slate-500',
    tag:    'bg-slate-100 text-slate-500',
    tagTxt: 'Unlearned',
    glow:   'none',
  },
};

// ─── Custom Concept Node ──────────────────────────────────────────────────────

function ConceptNode({ data, selected }) {
  const cfg = STATUS[data.status] || STATUS.unlearned;
  return (
    <div
      style={{
        boxShadow: selected
          ? '0 0 0 3px rgba(99,102,241,0.5), 0 4px 12px rgba(0,0,0,0.12)'
          : cfg.glow !== 'none'
            ? `${cfg.glow}, 0 2px 8px rgba(0,0,0,0.06)`
            : '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.15s',
      }}
      className={`
        min-w-[130px] max-w-[160px] rounded-xl border px-3 py-2.5
        ${cfg.bg} ${cfg.border} ${selected ? cfg.ring : ''}
        cursor-pointer select-none
      `}
    >
      {/* Source handle (top) */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-slate-300 !border-slate-200"
      />

      <div className="flex items-start gap-2">
        {/* Status dot */}
        <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
        {/* Label */}
        <span className={`text-[11px] font-semibold leading-tight ${cfg.label}`}>
          {data.label}
        </span>
      </div>

      {/* Status tag */}
      <div className="mt-1.5 ml-4">
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${cfg.tag}`}>
          {cfg.tagTxt}
        </span>
      </div>

      {/* Target handle (bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-slate-300 !border-slate-200"
      />
    </div>
  );
}

// Custom node type registry (must be outside the component to be stable)
const nodeTypes = { concept: ConceptNode };

// ─── MiniMap node color ───────────────────────────────────────────────────────

function minimapColor(node) {
  const map = {
    mastered:  '#10b981',
    active:    '#6366f1',
    failing:   '#ef4444',
    pending:   '#f59e0b',
    unlearned: '#cbd5e1',
  };
  return map[node.data?.status] ?? '#cbd5e1';
}

// ─── Legend ───────────────────────────────────────────────────────────────────

const LEGEND = [
  { status: 'mastered',  label: 'Mastered',     color: 'bg-emerald-500' },
  { status: 'active',    label: 'In Progress',   color: 'bg-indigo-500'  },
  { status: 'failing',   label: 'Needs Review',  color: 'bg-red-500'     },
  { status: 'pending',   label: 'Pending',       color: 'bg-amber-400'   },
  { status: 'unlearned', label: 'Unlearned',     color: 'bg-slate-300'   },
];

// ─── Selected Node Detail Panel ───────────────────────────────────────────────

function NodeDetail({ node, onClose }) {
  if (!node) return null;
  const cfg = STATUS[node.data.status] || STATUS.unlearned;
  return (
    <div className="absolute bottom-3 left-3 z-10 bg-white rounded-xl border border-slate-200 shadow-lg p-3 w-52 animate-slide-up">
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cfg.tag}`}>
          {cfg.tagTxt}
        </span>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xs leading-none px-1">✕</button>
      </div>
      <p className={`text-xs font-bold ${cfg.label} mb-1`}>{node.data.label}</p>
      <p className="text-[10px] text-slate-500">Node ID: <code className="font-mono">{node.id}</code></p>
    </div>
  );
}

// ─── GnnGraph ─────────────────────────────────────────────────────────────────

export default function GnnGraph({ nodes: propNodes, edges: propEdges, height = 480 }) {
  const [nodes, , onNodesChange] = useNodesState(propNodes);
  const [edges, , onEdgesChange] = useEdgesState(propEdges);
  const [selectedNode, setSelectedNode] = useState(null);

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(prev => prev?.id === node.id ? null : node);
  }, []);

  const masteredCount  = nodes.filter(n => n.data?.status === 'mastered').length;
  const failingCount   = nodes.filter(n => n.data?.status === 'failing').length;
  const activeCount    = nodes.filter(n => n.data?.status === 'active').length;

  return (
    <div className="flex flex-col gap-3">
      {/* Stats strip */}
      <div className="flex items-center gap-3 text-[11px] flex-wrap">
        <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
          ✓ {masteredCount} mastered
        </span>
        {activeCount > 0 && (
          <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
            ● {activeCount} active
          </span>
        )}
        {failingCount > 0 && (
          <span className="font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
            ✗ {failingCount} needs review
          </span>
        )}
        <span className="text-slate-400 ml-auto">
          {nodes.length} total concepts · Click a node to inspect
        </span>
      </div>

      {nodes.length === 0 ? (
        <div 
          className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-400" 
          style={{ height }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2 text-slate-300"><rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/></svg>
          <p className="text-sm font-semibold text-slate-600">No Graph Data</p>
          <p className="text-xs text-slate-400 mt-1">Upload a syllabus to generate your concept map.</p>
        </div>
      ) : (
        <>
          {/* Flow canvas */}
          <div
            className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50"
            style={{ height }}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              onNodeClick={onNodeClick}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              minZoom={0.3}
              maxZoom={2}
              proOptions={{ hideAttribution: true }}
              className="bg-slate-50"
            >
              <Background
                variant={BackgroundVariant.Dots}
                gap={20}
                size={1}
                color="#e2e8f0"
              />
              <Controls
                className="!border-slate-200 !shadow-sm !rounded-lg !overflow-hidden"
                showInteractive={false}
              />
              <MiniMap
                nodeColor={minimapColor}
                maskColor="rgba(248,250,252,0.85)"
                className="!border-slate-200 !rounded-lg !shadow-sm"
                style={{ width: 110, height: 70 }}
              />
            </ReactFlow>

            {/* Selected node detail */}
            <NodeDetail node={selectedNode} onClose={() => setSelectedNode(null)} />
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 flex-wrap">
            {LEGEND.map(({ label, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`} />
                <span className="text-[10px] font-medium text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}
