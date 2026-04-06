"use client";

import React, { useEffect, useState } from 'react';
import { FormSchema } from '@/lib/types';
import StatsCard from '@/components/StatsCard';
import ResponseTable from '@/components/ResponseTable';

function timeAgo(dateString: string) {
  try {
    const elapsed = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(elapsed / 60000);
    const hours = Math.floor(elapsed / 3600000);
    const days = Math.floor(elapsed / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  } catch (e) {
    return 'Just now';
  }
}

export default function DashboardPage({ params }: { params: { formId: string } }) {
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    
    try {
      const [formRes, respRes] = await Promise.all([
        fetch(`/api/forms?form_id=${params.formId}`),
        fetch(`/api/responses?form_id=${params.formId}`)
      ]);
      
      const formData = await formRes.json();
      const respData = await respRes.json();
      
      if (!formRes.ok) throw new Error(formData.error || 'Failed to fetch form schema');
      if (!respRes.ok) throw new Error(respData.error || 'Failed to fetch responses');
      
      setSchema({
        id: formData.form.id,
        title: formData.form.title,
        description: formData.form.description,
        fields: formData.form.fields || [],
      });
      
      setResponses(respData.responses || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      if (isRefresh) {
        setTimeout(() => setRefreshing(false), 500); // Visual delay for spinner
      }
    }
  };

  const exportToCSV = () => {
    if (!schema || responses.length === 0) return;

    // Headers
    const headers = ['Timestamp', ...schema.fields.map(f => f.label.replace(/"/g, '""'))];
    
    // Rows
    const rows = responses.map(response => {
      const timestamp = response.submitted_at || response.createdAt || new Date().toISOString();
      const formattedTime = new Date(timestamp).toLocaleString();
      
      const rowData = [formattedTime];
      
      schema.fields.forEach(field => {
        let val = response.data?.[field.id];
        
        if (val === undefined || val === null) {
          val = '';
        } else if (Array.isArray(val)) {
          val = val.join(' | ');
        } else if (typeof val === 'object') {
          val = JSON.stringify(val);
        } else {
          val = String(val);
        }
        
        val = `"${val.replace(/"/g, '""')}"`;
        rowData.push(val);
      });
      
      return rowData;
    });
    
    const csvContent = [
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const slug = schema.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const filename = `${slug || 'form'}-responses.csv`;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [params.formId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center">
        <div className="flex space-x-2.5 mb-6">
          <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full animate-bounce shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
          <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full animate-bounce shadow-[0_0_15px_rgba(16,185,129,0.5)]" style={{ animationDelay: '0.15s' }}></div>
          <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full animate-bounce shadow-[0_0_15px_rgba(16,185,129,0.5)]" style={{ animationDelay: '0.3s' }}></div>
        </div>
        <p className="text-neutral-400 font-bold tracking-widest uppercase text-sm">Aggregating Data</p>
      </div>
    );
  }

  if (error || !schema) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 antialiased">
         <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <svg className="w-16 h-16 text-red-500/80 mx-auto mb-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Dashboard Unavailable</h2>
          <p className="text-red-400/80 font-medium mb-8">{error || 'Could not load form data'}</p>
          <a href={`/builder/${params.formId}`} className="inline-block w-full px-6 py-3.5 bg-neutral-800 text-white font-bold rounded-xl hover:bg-neutral-700 transition">Return to Builder</a>
        </div>
      </div>
    );
  }

  const latestResponseTime = responses.length > 0 
    ? (responses[0].submitted_at || responses[0].createdAt || new Date().toISOString())
    : null;

  return (
    <div className="min-h-screen bg-neutral-950 font-sans text-neutral-200 antialiased selection:bg-emerald-500/30">
      <header className="bg-neutral-950/80 backdrop-blur-2xl border-b border-neutral-800/80 sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-6 h-[80px] flex items-center justify-between">
          <div className="flex items-center space-x-5">
            <a href={`/builder/${params.formId}`} className="p-2.5 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 hover:border-neutral-700 rounded-xl text-neutral-400 hover:text-white transition-all shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </a>
            <div>
              <h1 className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest mb-0.5">Response Dashboard</h1>
              <p className="text-white font-extrabold text-xl leading-tight truncate max-w-[200px] sm:max-w-md lg:max-w-xl">{schema.title}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={exportToCSV}
              disabled={responses.length === 0}
              className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${responses.length === 0 ? 'bg-neutral-900 border border-neutral-800 text-neutral-600 opacity-50 cursor-not-allowed' : 'bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white'}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              <span className="hidden sm:inline tracking-wide">Export CSV</span>
            </button>
            <button 
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 hover:border-neutral-700 text-white rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
            >
              <svg className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-400' : 'text-neutral-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              <span className="hidden sm:inline tracking-wide">{refreshing ? 'Updating...' : 'Refresh Data'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-10 lg:py-12 space-y-10">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard 
            title="Total Responses" 
            value={responses.length} 
            icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          />
          <StatsCard 
            title="Latest Response" 
            value={latestResponseTime ? timeAgo(latestResponseTime) : '—'} 
            icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatsCard 
            title="Fields Tracked" 
            value={schema.fields.length} 
            icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
          />
        </div>

        {/* Responses Table or Empty State */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-extrabold text-white tracking-tight">Submission Data</h2>
            {responses.length > 0 && (
              <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-500/20 shadow-sm shadow-emerald-500/10 uppercase tracking-widest">
                {responses.length} Record{responses.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          {responses.length === 0 ? (
            <div className="w-full bg-neutral-900 border border-neutral-800 border-dashed rounded-3xl p-16 text-center shadow-inner relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-800/10 via-transparent to-transparent pointer-events-none"></div>
              
              <div className="w-24 h-24 bg-neutral-950 border border-neutral-800 rounded-full flex items-center justify-center mx-auto mb-8 text-neutral-600 shadow-xl shadow-black/50 relative z-10">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 relative z-10">No responses yet</h3>
              <p className="text-neutral-400 text-lg max-w-md mx-auto mb-10 leading-relaxed relative z-10">
                Share your form to start collecting data. Submissions will appear here instantly.
              </p>
              <div className="relative z-10">
                <a href={`/f/${params.formId}`} target="_blank" className="inline-flex items-center space-x-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_0px_rgba(16,185,129,0.5)]">
                  <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  <span className="tracking-wide uppercase text-sm">Open Live Form</span>
                </a>
              </div>
            </div>
          ) : (
            <ResponseTable responses={responses} fields={schema.fields} />
          )}
        </div>
        
      </main>
    </div>
  );
}
