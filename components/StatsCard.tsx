"use client";

import React, { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
}

export default function StatsCard({ title, value, icon }: StatsCardProps) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-7 flex flex-col relative overflow-hidden shadow-sm hover:shadow-xl hover:border-neutral-700/80 transition-all group">
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 text-emerald-500 transition-opacity duration-500">
        <div className="w-24 h-24 transform translate-x-4 -translate-y-4">
          {icon}
        </div>
      </div>
      
      <div className="flex items-center space-x-4 mb-5 relative z-10">
        <div className="p-3.5 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/15 group-hover:border-emerald-500/30 transition-colors">
          <div className="w-6 h-6">
            {icon}
          </div>
        </div>
        <h3 className="text-[13px] font-bold text-neutral-400 uppercase tracking-widest">{title}</h3>
      </div>
      
      <div className="relative z-10 pt-2">
        <p className="text-4xl sm:text-5xl font-extrabold text-white tracking-tighter truncate drop-shadow-sm">{value}</p>
      </div>
    </div>
  );
}
