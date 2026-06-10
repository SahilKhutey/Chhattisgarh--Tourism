import React from 'react';

export function TrustVerificationBadge({ level }: { level?: string }) {
  if (!level || level === 'UNVERIFIED') {
    return null;
  }

  let colorClass = '';
  let label = '';
  let icon = null;

  switch (level) {
    case 'OFFICIAL':
      colorClass = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      label = 'Official Govt Data';
      icon = (
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
      break;
    case 'COMMUNITY':
      colorClass = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      label = 'Community Verified';
      icon = (
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
      break;
    case 'CREATOR_VERIFIED':
      colorClass = 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      label = 'Creator Verified';
      icon = (
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
      break;
    case 'AI_ESTIMATED':
      colorClass = 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      label = 'AI Extracted';
      icon = (
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
      break;
    default:
      return null;
  }

  return (
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass} backdrop-blur-sm`}>
      {icon}
      {label}
    </div>
  );
}
