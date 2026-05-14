import { useState, useRef, useEffect } from 'react';
import { Camera, Eye, Send, AlertTriangle, CheckCircle2, XCircle, Clock, ShieldCheck } from 'lucide-react';
import { examSession } from '../mockData';

// ─── Webcam Proctoring Placeholder ───────────────────────────────────────────

function WebcamFeed({ warnings }) {
  const videoRef = useRef(null);
  const [streamError, setStreamError] = useState(null);

  useEffect(() => {
    async function setupWebcam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setStreamError('Camera access denied or unavailable.');
      }
    }
    setupWebcam();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="w-52 flex-shrink-0">
      {/* Feed box */}
      <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700 relative aspect-video flex items-center justify-center">
        {streamError ? (
          <div className="text-[10px] text-red-400 text-center px-4">
            <AlertTriangle className="w-4 h-4 mx-auto mb-1 text-red-500" />
            {streamError}
          </div>
        ) : (
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover"
          />
        )}

        {/* Status badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-500/90 rounded-full px-2 py-0.5 z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-[9px] font-bold text-white uppercase tracking-wider">LIVE</span>
        </div>
        <div className="absolute top-2 right-2 z-10">
          <Camera className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      {/* Status list */}
      <div className="mt-2 space-y-1">
        <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-600">
          <Eye className="w-3 h-3" /> Face detected
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-600">
          <ShieldCheck className="w-3 h-3" /> Tab focus: active
        </div>
        {warnings > 0 && (
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-amber-600">
            <AlertTriangle className="w-3 h-3" /> {warnings} warning{warnings > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Observer Log ─────────────────────────────────────────────────────────────

function ObserverLog({ log }) {
  const agentColors = {
    Observer: 'text-violet-600',
    Examiner: 'text-indigo-600',
  };
  return (
    <div className="bg-slate-50 rounded-xl border border-slate-100 p-3">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Observer Log</p>
      <div className="space-y-1.5 max-h-36 overflow-y-auto">
        {log.map((entry, i) => (
          <div key={i} className="flex items-start gap-2 text-[11px]">
            <span className="text-slate-400 font-mono flex-shrink-0">{entry.time}</span>
            <span className={`font-semibold flex-shrink-0 ${agentColors[entry.agent] || 'text-slate-600'}`}>
              [{entry.agent}]
            </span>
            <span className="text-slate-600">{entry.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Progress Breadcrumb ──────────────────────────────────────────────────────

function ExamProgress({ mastered, total }) {
  const pct = (mastered / total) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="font-medium text-slate-600">Nodes Mastered</span>
        <span className="font-bold text-indigo-700">{mastered} / {total}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
          }}
        />
      </div>
    </div>
  );
}

// ─── Exam Mode View ───────────────────────────────────────────────────────────

export default function ExamModeView() {
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);  // null | 'passed' | 'failed'
  const [warnings, setWarnings] = useState(1);
  const [timeLeft, setTimeLeft] = useState(45 * 60);  // 45 min in seconds
  const [log, setLog] = useState(examSession.log);
  const inputRef = useRef(null);

  // Countdown timer
  useEffect(() => {
    const t = setInterval(() => setTimeLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  // Warn on tab switch
  useEffect(() => {
    const onBlur = () => {
      setWarnings(w => w + 1);
      setLog(prev => [...prev, {
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        agent: 'Observer',
        msg: 'Tab-focus lost! Warning issued.',
      }]);
    };
    window.addEventListener('blur', onBlur);
    return () => window.removeEventListener('blur', onBlur);
  }, []);

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');
  const timeColor = timeLeft < 300 ? 'text-red-600' : 'text-slate-700';

  const handleSubmit = () => {
    if (!answer.trim() || submitted) return;
    setSubmitted(true);

    // Simulate Observer grading (replace with real API call)
    const passed = answer.trim().length > 60;
    setTimeout(() => {
      setResult(passed ? 'passed' : 'failed');
      setLog(prev => [
        ...prev,
        {
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          agent: 'Observer',
          msg: passed ? 'Answer evaluated — MASTERED ✓' : 'Answer evaluated — FAILING ✗ (Curator triggered)',
        },
      ]);
    }, 1200);
  };

  return (
    <div className="exam-mode-bg min-h-[calc(100vh-4rem)] animate-fadeIn">

      {/* ── Exam Header Bar ── */}
      <div className="bg-white border-b-2 border-indigo-100 px-6 py-3 flex items-center gap-4 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Exam Mode</span>
        </div>
        <div className="h-4 w-px bg-slate-200" />
        <span className="text-xs text-slate-500 truncate max-w-xs">{examSession.topic}</span>
        <div className="ml-auto flex items-center gap-4">
          <ExamProgress mastered={examSession.masteredNodes} total={examSession.totalNodes} />
          <div className={`flex items-center gap-1.5 font-mono font-bold text-sm ${timeColor} bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200`}>
            <Clock className="w-3.5 h-3.5" /> {mins}:{secs}
          </div>
        </div>
      </div>

      <div className="flex gap-6 p-6 max-w-5xl mx-auto">

        {/* ── Main Question Area ── */}
        <div className="flex-1 space-y-5">

          {/* Node tag */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full uppercase tracking-wide">
              Node 7
            </span>
            <span className="text-sm font-semibold text-slate-700">
              {examSession.currentQuestion.node}
            </span>
          </div>

          {/* Question card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Eye className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Examiner Question</p>
            </div>
            <p className="text-slate-800 text-base leading-relaxed font-medium">
              {examSession.currentQuestion.text}
            </p>
          </div>

          {/* Answer area */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Your Answer
            </label>
            <textarea
              id="exam-answer-input"
              ref={inputRef}
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              disabled={submitted}
              placeholder="Type your answer here. Be precise and technical — the Observer agent evaluates semantic accuracy, not keyword matching…"
              className="w-full h-40 resize-none text-sm text-slate-800 bg-slate-50 rounded-xl border border-slate-200 px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed leading-relaxed"
            />

            {/* Result feedback */}
            {result && (
              <div className={`flex items-start gap-3 p-4 rounded-xl border animate-slide-up
                ${result === 'passed'
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-red-50 border-red-200'}`}
              >
                {result === 'passed'
                  ? <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
                <div>
                  <p className={`text-sm font-bold ${result === 'passed' ? 'text-emerald-700' : 'text-red-700'}`}>
                    {result === 'passed' ? 'Node Mastered ✓' : 'Needs Review ✗'}
                  </p>
                  <p className={`text-xs mt-1 ${result === 'passed' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {result === 'passed'
                      ? 'Correct. The Observer agent has marked this node as mastered. Moving to the next concept.'
                      : 'Incorrect. The Curator agent has been triggered. Study material will be delivered in your Tutor Chat session.'}
                  </p>
                </div>
              </div>
            )}

            {/* Submit */}
            {!submitted && (
              <button
                id="exam-submit-btn"
                onClick={handleSubmit}
                disabled={!answer.trim()}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" /> Submit Answer
              </button>
            )}
            {submitted && !result && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                Observer evaluating…
              </div>
            )}
          </div>

          {/* Observer Log */}
          <ObserverLog log={log} />
        </div>

        {/* ── Right Panel: Webcam + Info ── */}
        <div className="w-52 flex-shrink-0 space-y-4">
          <WebcamFeed warnings={warnings} />

          {/* Rules */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 space-y-2">
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Exam Rules</p>
            {[
              'Camera must remain active',
              'No tab switching allowed',
              'No external resources',
              '3 warnings = session void',
            ].map((r, i) => (
              <div key={i} className="flex items-start gap-1.5 text-[11px] text-amber-700">
                <span className="font-bold flex-shrink-0 mt-0.5">{i + 1}.</span>
                {r}
              </div>
            ))}
          </div>

          {warnings >= 2 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 animate-slide-up">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <p className="text-[11px] font-bold text-red-700">Warning {warnings}/3</p>
              </div>
              <p className="text-[10px] text-red-600">One more violation will void this session.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
