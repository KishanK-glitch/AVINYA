/**
 * mockData.js — Initial fresh state for a new user
 */

import { MarkerType } from '@xyflow/react';

// ─── Heatmap ─────────────────────────────────────────────────────────────────
export const heatmapData = (() => {
  const data = [];
  const now = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    data.push({ date: dateStr, count: 0 }); // Fresh user has 0 activity
  }
  return data;
})();

// ─── GNN Concept Mastery (Radar) ─────────────────────────────────────────────
export const masteryData = []; // Empty for new user

// ─── Credits History ─────────────────────────────────────────────────────────
export const creditsHistory = []; // Empty for new user

// ─────────────────────────────────────────────────────────────────────────────
// React Flow graph data
// ─────────────────────────────────────────────────────────────────────────────

export const initialFlowNodes = []; // Empty graph initially
export const initialFlowEdges = [];

const E = (id, s, t) => ({
  id,
  source: s,
  target: t,
  type: 'smoothstep',
  markerEnd: { type: MarkerType.ArrowClosed, color: '#cbd5e1', width: 16, height: 16 },
  style: { stroke: '#cbd5e1', strokeWidth: 1.5 },
  animated: false,
});

// ─── Uploaded-syllabus demo data (3 generic nodes) ──────────
export const uploadedFlowNodes = [
  { id: 'm1', type: 'concept', position: { x: 200, y: 0 }, data: { label: 'Module 1', status: 'active' } },
  { id: 'm2', type: 'concept', position: { x: 80,  y: 130 }, data: { label: 'Module 2', status: 'unlearned' } },
  { id: 'm3', type: 'concept', position: { x: 320, y: 130 }, data: { label: 'Module 3', status: 'unlearned' } },
];

export const uploadedFlowEdges = [
  E('e-m1-m2', 'm1', 'm2'),
  E('e-m1-m3', 'm1', 'm3'),
];

// ─── Tutor Chat History ───────────────────────────────────────────────────────
export const tutorChatHistory = []; // Empty initially

// ─── Examiner Session ─────────────────────────────────────────────────────────
export const examSession = {
  topic: 'No topic selected',
  totalNodes: 0,
  masteredNodes: 0,
  currentQuestion: {
    id: 'q_placeholder',
    node: 'Waiting for exam',
    text: 'Please upload a syllabus to generate a topic graph and start an exam.',
    expectedConcept: '',
  },
  log: [],
};

// ─── User Profile ─────────────────────────────────────────────────────────────
export const userProfile = {
  name: 'New Student',
  initials: 'NS',
  role: 'New Learner',
  credits: 0,
  streak: 0,
  masteryPercent: 0,
  totalSessions: 0,
  hoursStudied: 0,
  rank: 'Unranked',
  canBeTutor: false,
};
