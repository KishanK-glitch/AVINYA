import { useState } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './views/DashboardView';
import TutorChatView from './views/TutorChatView';
import ExamModeView from './views/ExamModeView';

export default function App() {
  const [view, setView] = useState('dashboard');

  const VIEWS = {
    dashboard: DashboardView,
    tutor:     TutorChatView,
    exam:      ExamModeView,
  };

  const ActiveView = VIEWS[view];

  return (
    <div className="flex min-h-screen bg-slate-50" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Fixed sidebar */}
      <Sidebar activeView={view} onNavigate={setView} />

      {/* Main content — offset by sidebar width */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen">

        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-20 shadow-sm">
          <div>
            <h2 className="text-base font-bold text-slate-900 capitalize font-display" style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
              {view === 'dashboard' ? 'Learning Dashboard' : view === 'tutor' ? 'Tutor Chat' : 'Exam Mode'}
            </h2>
            <p className="text-[11px] text-slate-400">Avinya Adaptive Learning Platform</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick nav pills */}
            {[
              { id: 'dashboard', label: '🏠 Home'  },
              { id: 'tutor',     label: '💬 Tutor'  },
              { id: 'exam',      label: '🎓 Exam'   },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                  view === id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </header>

        {/* View content */}
        <main className={`flex-1 ${view === 'exam' ? '' : 'p-6'}`}>
          <ActiveView />
        </main>
      </div>
    </div>
  );
}
