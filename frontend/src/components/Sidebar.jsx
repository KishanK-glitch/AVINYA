import {
  LayoutDashboard, MessageCircle, GraduationCap,
  Flame, Coins, BookOpen, ChevronRight, Zap,
} from 'lucide-react';
import { userProfile } from '../mockData';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'tutor',     label: 'Tutor Chat', icon: MessageCircle   },
  { id: 'exam',      label: 'Exam Mode',  icon: GraduationCap   },
];

export default function Sidebar({ activeView, onNavigate }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 w-60 bg-white border-r border-slate-100 flex flex-col shadow-sm">

      {/* ── Brand ── */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <p className="font-bold text-slate-900 text-[15px] leading-none font-display">Avinya</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Adaptive Learning</p>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = activeView === id;
          return (
            <button
              key={id}
              id={`nav-${id}`}
              onClick={() => onNavigate(id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-150 text-left
                ${active
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}
              `}
            >
              <Icon
                className={`w-4.5 h-4.5 flex-shrink-0 ${active ? 'text-indigo-600' : 'text-slate-400'}`}
                size={18}
              />
              {label}
              {active && (
                <ChevronRight className="ml-auto w-3.5 h-3.5 text-indigo-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Quick Stats ── */}
      <div className="px-3 pb-4 space-y-2">
        <div className="bg-amber-50 rounded-lg px-3 py-2.5 flex items-center gap-3">
          <Flame className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-amber-700">{userProfile.streak} day streak</p>
            <p className="text-[11px] text-amber-500">Keep it up!</p>
          </div>
        </div>
        <div className="bg-violet-50 rounded-lg px-3 py-2.5 flex items-center gap-3">
          <Coins className="w-4 h-4 text-violet-500 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-violet-700">{userProfile.credits.toLocaleString()} credits</p>
            <p className="text-[11px] text-violet-400">Available to spend</p>
          </div>
        </div>
      </div>

      {/* ── User ── */}
      <div className="px-4 py-4 border-t border-slate-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-[11px] font-bold">{userProfile.initials}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{userProfile.name}</p>
          <p className="text-[11px] text-slate-400 truncate">{userProfile.role}</p>
        </div>
        <div className="ml-auto">
          <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
            {userProfile.rank}
          </span>
        </div>
      </div>
    </aside>
  );
}
