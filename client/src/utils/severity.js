export const SEVERITY_CONFIG = {
  CRITICAL: {
    label: 'Critical',
    bg: 'bg-red-500/15',
    text: 'text-red-400',
    border: 'border-red-500/30',
    badge: 'bg-red-950/80 text-red-400 border-red-800/50',
    dot: 'bg-red-500',
  },
  HIGH: {
    label: 'High',
    bg: 'bg-orange-500/15',
    text: 'text-orange-400',
    border: 'border-orange-500/30',
    badge: 'bg-orange-950/80 text-orange-400 border-orange-800/50',
    dot: 'bg-orange-500',
  },
  MEDIUM: {
    label: 'Medium',
    bg: 'bg-amber-500/15',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    badge: 'bg-amber-950/80 text-amber-400 border-amber-800/50',
    dot: 'bg-amber-500',
  },
  LOW: {
    label: 'Low',
    bg: 'bg-blue-500/15',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    badge: 'bg-blue-950/80 text-blue-400 border-blue-800/50',
    dot: 'bg-blue-500',
  },
  INFO: {
    label: 'Info',
    bg: 'bg-slate-500/15',
    text: 'text-slate-400',
    border: 'border-slate-500/30',
    badge: 'bg-slate-900/80 text-slate-400 border-slate-700/50',
    dot: 'bg-slate-400',
  },
};

export const getSeverityStyle = (severityStr = 'INFO') => {
  const key = String(severityStr).toUpperCase();
  return SEVERITY_CONFIG[key] || SEVERITY_CONFIG.INFO;
};

export const getRiskScoreColor = (score = 0) => {
  if (score > 70) return { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' };
  if (score > 40) return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
  if (score > 20) return { text: 'text-yellow-300', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' };
  return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
};
