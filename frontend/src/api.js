/**
 * api.js — Central API wrapper for Avinya Frontend
 * All functions point to the FastAPI backend at http://127.0.0.1:8000.
 * The Vite dev proxy rewrites /api/* → http://127.0.0.1:8000/*
 * Replace the stub bodies with real fetch() calls when wiring up.
 */

const BASE = '/api';

// ─── Helpers ────────────────────────────────────────────────────────────────

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

// ─── Session ────────────────────────────────────────────────────────────────

/**
 * Create a new learning session.
 * @param {{ user_id: string, topic: string, difficulty: string }} payload
 * @returns {{ session_id: string, created_at: string }}
 */
export async function createSession(payload) {
  return post('/session/start', payload);
}

/**
 * Fetch an existing session's metadata.
 * @param {string} sessionId
 */
export async function getSession(sessionId) {
  return get(`/session/${sessionId}`);
}

// ─── Chat / Tutor ────────────────────────────────────────────────────────────

/**
 * Send a message to the Tutor agent (non-streaming REST fallback).
 * @param {{ session_id: string, message: string }} payload
 * @returns {{ agent: string, content: string }}
 */
export async function sendTutorMessage(payload) {
  return post('/chat/message', payload);
}

// ─── Exam ────────────────────────────────────────────────────────────────────

/**
 * Submit an answer to the Examiner / Observer agents.
 * @param {{ session_id: string, question_id: string, answer: string }} payload
 * @returns {{ is_correct: boolean, feedback: string, score: number }}
 */
export async function submitAnswer(payload) {
  return post('/exam/answer', payload);
}

/**
 * Fetch the next question from the Examiner agent.
 * @param {{ session_id: string, node_id: string }} payload
 */
export async function getNextQuestion(payload) {
  return post('/exam/question', payload);
}

// ─── Progress / Credits ──────────────────────────────────────────────────────

/**
 * Fetch the user's overall progress, credits, and GNN mastery scores.
 * @param {string} userId
 */
export async function getUserProgress(userId) {
  return get(`/user/${userId}/progress`);
}

/**
 * Fetch the user's daily activity for the heatmap calendar.
 * @param {string} userId
 */
export async function getActivityHeatmap(userId) {
  return get(`/user/${userId}/activity`);
}

// ─── WebSocket helper ────────────────────────────────────────────────────────

/**
 * Open a WebSocket connection to the real-time exam/tutor endpoint.
 * @param {string} sessionId
 * @returns {WebSocket}
 */
export function openSessionSocket(sessionId) {
  const wsBase = import.meta.env.DEV
    ? `ws://127.0.0.1:8000/ws/${sessionId}`
    : `wss://${window.location.host}/ws/${sessionId}`;
  return new WebSocket(wsBase);
}
