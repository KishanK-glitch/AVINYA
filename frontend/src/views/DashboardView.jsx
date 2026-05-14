import { useState } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import {
  Flame, Trophy, Clock, BookOpen, Coins, Users,
  TrendingUp, Star, ChevronRight, Sparkles, Award, Network,
} from 'lucide-react';
import {
  heatmapData, masteryData, creditsHistory,
  initialFlowNodes, initialFlowEdges,
  userProfile,
} from '../mockData';
import GnnGraph from '../components/GnnGraph';
import SyllabusUploader from '../components/SyllabusUploader';

// ─── Heatmap Calendar ────────────────────────────────────────────────────────

function getColor(count) {
  if (count === 0) return '#f1f5f9';
  if (count <= 2)  return '#c7d2fe';
  if (count <= 5)  return '#818cf8';
  if (count <= 8)  return '#6366f1';
  return '#4338ca';
}

function HeatmapCalendar({ data }) {
  const [tooltip, setTooltip] = useState(null);
  const weeks = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthLabels = [];
  weeks.forEach((week, wi) => {
    if (week[0]) {
      const m = new Date(week[0].date).getMonth();
      if (wi === 0 || new Date(weeks[wi - 1]?.[0]?.date).getMonth() !== m) {
        monthLabels.push({ index: wi, label: months[m] });
      }
    }
  });

  return (
    <div className="relative">
      <div className="flex gap-[3px] mb-1 pl-6">
        {weeks.map((_, wi) => {
          const ml = monthLabels.find(m => m.index === wi);
          return (
            <div key={wi} className="w-[11px] flex-shrink-0 text-[9px] text-slate-400">
              {ml ? ml.label : ''}
            </div>
          );
        })}
      </div>
      <div className="flex gap-[3px]">
        <div className="flex flex-col gap-[3px] mr-1">
          {['','M','','W','','F',''].map((d, i) => (
            <div key={i} className="h-[11px] text-[9px] text-slate-400 leading-[11px]">{d}</div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day) => (
              <div
                key={day.date}
                className="heatmap-cell w-[11px] h-[11px] rounded-[2px] cursor-pointer"
                style={{ backgroundColor: getColor(day.count), opacity: day.count === 0 ? 0.6 : 1 }}
                onMouseEnter={(e) => setTooltip({ date: day.date, count: day.count, x: e.clientX, y: e.clientY })}
                onMouseLeave={() => setTooltip(null)}
              />
            ))}
          </div>
        ))}
      </div>
      {tooltip && (
        <div
          className="fixed z-50 bg-slate-900 text-white text-[11px] px-2 py-1 rounded shadow-lg pointer-events-none"
          style={{ left: tooltip.x + 10, top: tooltip.y - 30 }}
        >
          {tooltip.count} session{tooltip.count !== 1 ? 's' : ''} · {tooltip.date}
        </div>
      )}
      <div className="flex items-center gap-1.5 mt-3 justify-end">
        <span className="text-[10px] text-slate-400">Less</span>
        {[0,2,4,7,10].map(c => (
          <div key={c} className="w-[10px] h-[10px] rounded-[2px]" style={{ backgroundColor: getColor(c) }} />
        ))}
        <span className="text-[10px] text-slate-400">More</span>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color = 'indigo' }) {
  const colorMap = {
    indigo:  { bg: 'bg-indigo-50',  icon: 'text-indigo-600',  val: 'text-indigo-700'  },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', val: 'text-emerald-700' },
    amber:   { bg: 'bg-amber-50',   icon: 'text-amber-600',   val: 'text-amber-700'   },
    violet:  { bg: 'bg-violet-50',  icon: 'text-violet-600',  val: 'text-violet-700'  },
  };
  const c = colorMap[color];
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center`}>
          <Icon className={`w-4.5 h-4.5 ${c.icon}`} size={18} />
        </div>
        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
      </div>
      <p className={`text-2xl font-bold ${c.val} font-display`}>{value}</p>
      <p className="text-xs font-medium text-slate-600 mt-0.5">{label}</p>
      {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Tutor Suggestion Panel ───────────────────────────────────────────────────

function TutorSuggestionPanel({ mastery, canBeTutor }) {
  const pct = mastery;
  const unlocked = canBeTutor || pct >= 90;
  return (
    <div className={`rounded-xl border p-5 relative overflow-hidden transition-all
      ${unlocked
        ? 'bg-gradient-to-br from-indigo-600 to-purple-700 border-indigo-500 text-white'
        : 'bg-white border-slate-100'}`}
    >
      {!unlocked && (
        <div className="absolute inset-0 flex items-end justify-end p-4 pointer-events-none">
          <div className="w-24 h-24 rounded-full bg-indigo-50 opacity-60" />
        </div>
      )}
      <div className="flex items-start gap-3 relative z-10">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
          ${unlocked ? 'bg-white/20' : 'bg-indigo-50'}`}>
          <Users className={`w-5 h-5 ${unlocked ? 'text-white' : 'text-indigo-500'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-semibold text-sm ${unlocked ? 'text-white' : 'text-slate-800'}`}>
              Become a Human Tutor
            </h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
              ${unlocked ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-400'}`}>
              {unlocked ? 'UNLOCKED' : 'LOCKED'}
            </span>
          </div>
          <p className={`text-xs leading-relaxed mb-3 ${unlocked ? 'text-indigo-100' : 'text-slate-500'}`}>
            {unlocked
              ? "Your mastery score qualifies you to guide new learners. Share your knowledge and earn bonus credits."
              : `Reach 90% graph mastery to unlock peer tutoring. You're at ${pct}% — just ${90 - pct}% away.`}
          </p>
          {!unlocked && (
            <div className="mb-3">
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-500">Progress to unlock</span>
                <span className="font-semibold text-indigo-600">{pct}% / 90%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                  style={{ width: `${(pct / 90) * 100}%` }}
                />
              </div>
            </div>
          )}
          {unlocked && (
            <button className="flex items-center gap-2 bg-white text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
              Apply to Tutor <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Credits Panel ────────────────────────────────────────────────────────────

const CREDIT_PERKS = [
  { name: 'Extended Exam Time',  cost: 150, icon: Clock    },
  { name: 'Voice Tutor Session', cost: 300, icon: Sparkles },
  { name: 'Expert Review',       cost: 500, icon: Star     },
];

function CreditsPanel({ credits, history }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-slate-900 font-display">{credits.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-0.5">Available credits</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
          <Award className="w-5 h-5 text-violet-600" />
        </div>
      </div>
      <div style={{ height: 90 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={history} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, fontSize: 11, color: '#fff' }}
              cursor={{ fill: '#f8fafc' }}
            />
            <Bar dataKey="earned" name="Earned" fill="#818cf8" radius={[3,3,0,0]} />
            <Bar dataKey="spent"  name="Spent"  fill="#e0e7ff" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Spend Credits</p>
        {CREDIT_PERKS.map(({ name, cost, icon: Icon }) => (
          <div key={name} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group">
            <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
              <Icon className="w-3.5 h-3.5 text-violet-500" />
            </div>
            <span className="text-xs text-slate-700 flex-1">{name}</span>
            <span className="text-[11px] font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full group-hover:bg-violet-100 transition-colors">
              {cost} cr
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Dashboard View ───────────────────────────────────────────────────────────

export default function DashboardView() {
  // Graph state — starts with default Transformer Attention nodes
  const [graphNodes, setGraphNodes] = useState(initialFlowNodes);
  const [graphEdges, setGraphEdges] = useState(initialFlowEdges);
  const [graphTitle, setGraphTitle] = useState('Transformer Attention Mechanism');
  const [graphSource, setGraphSource] = useState('default'); // 'default' | 'uploaded'

  const handleGraphGenerated = (nodes, edges) => {
    setGraphNodes(nodes);
    setGraphEdges(edges);
    setGraphTitle('Deep Learning Fundamentals');
    setGraphSource('uploaded');
  };

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            Good morning, {userProfile.name.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            You have <span className="font-semibold text-indigo-600">3 nodes</span> pending review today.
          </p>
        </div>
        <button
          id="start-session-btn"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-colors"
        >
          <BookOpen className="w-4 h-4" /> Start Session
        </button>
      </div>

      {/* ── Syllabus Uploader ── */}
      <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Network className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-semibold text-slate-800">Upload Syllabus / Notes</h2>
          <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full ml-auto">
            Triggers RAG Pipeline → Graph
          </span>
        </div>
        <SyllabusUploader onGraphGenerated={handleGraphGenerated} />
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Flame}     label="Day Streak"     value={`${userProfile.streak}d`}         sub="Personal best: 21d" color="amber"   />
        <StatCard icon={TrendingUp} label="Mastery Score" value={`${userProfile.masteryPercent}%`} sub="↑ 4% this week"     color="emerald" />
        <StatCard icon={Clock}     label="Hours Studied"  value={userProfile.hoursStudied}          sub="This month: 34h"    color="indigo"  />
        <StatCard icon={Trophy}    label="Total Sessions" value={userProfile.totalSessions}          sub="Rank: Gold"         color="violet"  />
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left: Heatmap + GNN Graph */}
        <div className="xl:col-span-2 space-y-6">

          {/* Activity Heatmap */}
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">Daily Study Activity</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">GitHub-style contribution calendar</p>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-full">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[11px] font-semibold text-amber-600">{userProfile.streak} day streak</span>
              </div>
            </div>
            <HeatmapCalendar data={heatmapData} />
          </div>

          {/* ── Dynamic GNN Graph ── */}
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-slate-800">GNN Concept Progress Map</h2>
                  {graphSource === 'uploaded' && (
                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full animate-slide-up">
                      UPDATED
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{graphTitle}</p>
              </div>
              <span className="text-[11px] font-medium text-slate-400">Graph Neural Network</span>
            </div>

            {/* The interactive React Flow graph */}
            <GnnGraph
              nodes={graphNodes}
              edges={graphEdges}
              height={480}
            />
          </div>

          {/* Tutor Suggestion */}
          <TutorSuggestionPanel
            mastery={userProfile.masteryPercent}
            canBeTutor={userProfile.canBeTutor}
          />
        </div>

        {/* Right: Radar + Credits */}
        <div className="space-y-6">

          {/* Mastery Radar */}
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800 mb-1">Concept Mastery Radar</h2>
            <p className="text-[11px] text-slate-400 mb-4">GNN-tracked per-topic scores</p>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={masteryData}>
                  <PolarGrid stroke="#f1f5f9" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#64748b' }} />
                  <Radar
                    name="Mastery" dataKey="score"
                    stroke="#6366f1" fill="#6366f1" fillOpacity={0.18}
                    strokeWidth={2} dot={{ r: 3, fill: '#6366f1' }}
                  />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, fontSize: 11, color: '#fff' }}
                    formatter={(v) => [`${v}%`, 'Mastery']}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Credits */}
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Coins className="w-4 h-4 text-violet-500" />
              <h2 className="text-sm font-semibold text-slate-800">Credits System</h2>
            </div>
            <CreditsPanel credits={userProfile.credits} history={creditsHistory} />
          </div>
        </div>
      </div>
    </div>
  );
}
