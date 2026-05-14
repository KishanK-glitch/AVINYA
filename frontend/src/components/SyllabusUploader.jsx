/**
 * SyllabusUploader.jsx
 * Drag-and-drop / click-to-upload zone.
 * Simulates the RAG extraction pipeline on the backend.
 *
 * Props:
 *   onGraphGenerated(nodes, edges) — called with new React Flow data
 *                                    after "extraction" completes
 */

import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, CheckCircle2, Loader2, X, FileUp } from 'lucide-react';

const ACCEPTED_TYPES = ['.pdf', '.txt', '.md', '.docx'];
const ACCEPTED_MIME  = [
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// ─── Log items that animate during extraction ─────────────────────────────────

const EXTRACTION_STEPS = [
  { delay: 300,  msg: 'Parsing document structure…'           },
  { delay: 900,  msg: 'Extracting key concepts with NLP…'     },
  { delay: 1600, msg: 'Building prerequisite dependency graph…'},
  { delay: 2400, msg: 'Running GNN inference on concept graph…'},
  { delay: 3100, msg: 'Embedding vectors into Qdrant…'        },
  { delay: 3700, msg: 'Graph ready.'                          },
];

export default function SyllabusUploader({ onGraphGenerated }) {
  const [state,    setState]    = useState('idle');   // idle | loading | done | error
  const [file,     setFile]     = useState(null);
  const [log,      setLog]      = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const appendLog = (msg) =>
    setLog(prev => [...prev, { msg, ts: Date.now() }]);

  const processFile = useCallback((f) => {
    if (!f) return;

    // Validate type
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    if (!ACCEPTED_TYPES.includes(ext)) {
      setState('error');
      setFile({ name: f.name });
      setLog([{ msg: `Unsupported file type "${ext}". Please upload PDF, TXT, MD, or DOCX.`, ts: Date.now() }]);
      return;
    }

    setFile(f);
    setState('loading');
    setLog([]);

    // Schedule animated log messages
    EXTRACTION_STEPS.forEach(({ delay, msg }) => {
      setTimeout(() => appendLog(msg), delay);
    });

    // After all steps, call onGraphGenerated with demo data
    setTimeout(() => {
      setState('done');
      // Dynamically import the uploaded mock data so this component
      // doesn't have a hard dependency on the specific dataset
      import('../mockData').then(({ uploadedFlowNodes, uploadedFlowEdges }) => {
        onGraphGenerated(uploadedFlowNodes, uploadedFlowEdges);
      });
    }, 4200);
  }, [onGraphGenerated]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  }, [processFile]);

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
    e.target.value = '';
  };

  const reset = () => {
    setState('idle');
    setFile(null);
    setLog([]);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  // DONE state
  if (state === 'done') {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 animate-slide-up">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-emerald-800">
              Concept graph generated
            </p>
            <p className="text-xs text-emerald-600 mt-0.5 truncate">
              {file?.name} · Graph updated below ↓
            </p>
          </div>
          <button
            onClick={reset}
            className="text-emerald-400 hover:text-emerald-600 transition-colors flex-shrink-0"
            title="Upload another file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // LOADING state
  if (state === 'loading') {
    return (
      <div className="rounded-xl border border-indigo-200 bg-white p-4 animate-slide-up">
        <div className="flex items-center gap-3 mb-3">
          <Loader2 className="w-4 h-4 text-indigo-500 animate-spin flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">
              Extracting concepts…
            </p>
            <p className="text-[11px] text-slate-400 truncate">{file?.name}</p>
          </div>
        </div>

        {/* Animated progress */}
        <div className="relative h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
            style={{
              animation: 'grow-bar 4s ease-in-out forwards',
            }}
          />
          <style>{`
            @keyframes grow-bar {
              0%   { width: 0% }
              30%  { width: 35% }
              60%  { width: 65% }
              85%  { width: 88% }
              100% { width: 96% }
            }
          `}</style>
        </div>

        {/* Log stream */}
        <div className="space-y-1.5 max-h-28 overflow-y-auto">
          {log.map((l, i) => (
            <div key={i} className="flex items-start gap-2 animate-slide-up">
              <span className="text-[9px] text-indigo-300 font-mono flex-shrink-0 mt-0.5">→</span>
              <span className="text-[11px] text-slate-600">{l.msg}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ERROR state
  if (state === 'error') {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 animate-slide-up">
        <div className="flex items-start gap-3">
          <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800">Upload failed</p>
            <p className="text-xs text-red-600 mt-0.5">{log[0]?.msg}</p>
          </div>
          <button onClick={reset} className="text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // IDLE state — main drop zone
  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        onChange={onFileChange}
        id="syllabus-file-input"
      />

      <div
        id="syllabus-drop-zone"
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          rounded-xl border-2 border-dashed p-6 flex flex-col items-center justify-center
          text-center cursor-pointer transition-all duration-200 select-none
          ${dragOver
            ? 'border-indigo-400 bg-indigo-50 scale-[1.01]'
            : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/50'}
        `}
      >
        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors
          ${dragOver ? 'bg-indigo-100' : 'bg-white border border-slate-200 shadow-sm'}`}>
          {dragOver
            ? <FileUp className="w-6 h-6 text-indigo-500" />
            : <Upload className="w-6 h-6 text-slate-400" />}
        </div>

        <p className="text-sm font-semibold text-slate-700 mb-1">
          {dragOver ? 'Drop to upload' : 'Upload Notes or Syllabus'}
        </p>
        <p className="text-xs text-slate-400 mb-3">
          Drag & drop or click · PDF, TXT, MD, DOCX
        </p>

        {/* Chip */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1 shadow-sm">
          <FileText className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-[11px] font-semibold text-indigo-600">
            Auto-generates your concept graph
          </span>
        </div>
      </div>
    </div>
  );
}
