"use client";

import React from 'react';
import { Field, FormResponse } from '@/lib/types';

interface ResponseTableProps {
  responses: any[];
  fields: Field[];
}

export default function ResponseTable({ responses, fields }: ResponseTableProps) {
  // Format dates: "Apr 6, 2026 · 3:42 PM"
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(date).replace(',', '').replace(' at', ' ·');
    } catch (e) {
      return dateString;
    }
  };

  const renderValue = (val: any) => {
    if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
      return <span className="text-neutral-600 font-bold">—</span>;
    }
    if (Array.isArray(val)) {
      return val.map((item, idx) => (
        <span key={idx} className="inline-block bg-neutral-800 text-neutral-300 text-xs px-2 py-1 rounded border border-neutral-700 mr-1 mb-1">
          {item}
        </span>
      ));
    }
    if (typeof val === 'boolean') {
      return (
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border ${val ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-neutral-800 text-neutral-400 border-neutral-700'}`}>
          {val ? 'Yes' : 'No'}
        </span>
      );
    }
    return String(val);
  };

  return (
    <div className="w-full bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-full">
          <thead>
            <tr className="bg-neutral-900 border-b border-neutral-800">
              <th className="px-6 py-5 text-[11px] font-black text-neutral-500 uppercase tracking-widest whitespace-nowrap min-w-[200px] border-r border-neutral-800/50 sticky left-0 bg-neutral-900 z-10 shadow-[1px_0_0_#262626]">
                Timestamp
              </th>
              {fields.map(field => (
                <th key={field.id} className="px-6 py-5 text-[11px] font-black text-neutral-400 uppercase tracking-wider whitespace-nowrap min-w-[180px] max-w-[300px] truncate border-r border-neutral-800/50 last:border-r-0">
                  {field.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {responses.map((response, idx) => (
              <tr 
                key={response.id || idx} 
                className={`group transition-all hover:bg-neutral-800/80 ${idx % 2 === 0 ? 'bg-neutral-950/40' : 'bg-neutral-900'}`}
              >
                <td className="px-6 py-4 text-[13px] font-semibold text-emerald-500/90 whitespace-nowrap border-r border-neutral-800/50 sticky left-0 z-10 shadow-[1px_0_0_#262626] group-hover:bg-neutral-800/80 transition-colors">
                  <div className={`absolute inset-0 ${idx % 2 === 0 ? 'bg-neutral-950/40' : 'bg-neutral-900'} -z-10 group-hover:bg-neutral-800/80 transition-colors`} />
                  <span className="relative z-20">{formatDate(response.submitted_at || response.createdAt || new Date().toISOString())}</span>
                </td>
                {fields.map(field => (
                  <td key={field.id} className="px-6 py-4 text-sm text-neutral-300 font-medium whitespace-nowrap border-r border-neutral-800/50 last:border-r-0 group-hover:text-white transition-colors max-w-[300px] truncate">
                    {renderValue(response.data ? response.data[field.id] : response.answers?.[field.id])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
