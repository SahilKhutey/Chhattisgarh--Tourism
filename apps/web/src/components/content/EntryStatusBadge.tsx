import React from 'react';
import { EntryStatus } from '../../types/content';

interface EntryStatusBadgeProps {
  status: EntryStatus | string;
  className?: string;
}

export const EntryStatusBadge: React.FC<EntryStatusBadgeProps> = ({
  status,
  className = '',
}) => {
  switch (status) {
    case 'PUBLISHED':
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}
        >
          Published
        </span>
      );
    case 'PENDING_REVIEW':
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 ${className}`}
        >
          Pending Review
        </span>
      );
    case 'REJECTED':
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 ${className}`}
        >
          Rejected
        </span>
      );
    case 'DRAFT':
    default:
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200 ${className}`}
        >
          Draft
        </span>
      );
  }
};
