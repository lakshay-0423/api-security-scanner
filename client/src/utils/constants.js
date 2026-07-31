export const APP_NAME = 'API Security Scanner';
export const APP_VERSION = 'v2.0.0';
export const PHASE_NAME = 'Phase 2 • Passive Security Analyzer';

export const METHOD_COLORS = {
  GET: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  POST: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  PUT: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  PATCH: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  DELETE: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  OPTIONS: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
  HEAD: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
};

export const STATUS_COLORS = {
  completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  pending: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', dot: 'bg-amber-400' },
  analyzing: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', dot: 'bg-blue-400 animate-pulse' },
  failed: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', dot: 'bg-red-400' },
};
