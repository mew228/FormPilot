"use client";

import React, { useEffect, useState } from 'react';
import { FormSchema } from '@/lib/types';
import FormBuilder from '@/components/FormBuilder';
import ProgressBar from '@/components/ProgressBar';

export default function BuilderPage({ params }: { params: { formId: string } }) {
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedStatus, setSavedStatus] = useState<boolean>(false);
  
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [slugInput, setSlugInput] = useState('');
  const [slugError, setSlugError] = useState<string | null>(null);
  const [slugSavedStatus, setSlugSavedStatus] = useState(false);

  const [improving, setImproving] = useState(false);
  const [improveSuccess, setImproveSuccess] = useState(false);
  const [improveError, setImproveError] = useState(false);

  const [closedToastMsg, setClosedToastMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchForm() {
      try {
        const res = await fetch(`/api/forms?form_id=${params.formId}`);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || 'Failed to fetch the form');
        
        setSchema({
          id: data.form.id,
          title: data.form.title,
          description: data.form.description,
          slug: data.form.slug,
          fields: data.form.fields || [],
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchForm();
  }, [params.formId]);

  const handleSave = async () => {
    if (!schema) return;
    
    setSaving(true);
    setSavedStatus(false);
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: schema.id,
          title: schema.title,
          description: schema.description,
          slug: schema.slug,
          fields: schema.fields,
        }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }
      
      setSavedStatus(true);
      setTimeout(() => setSavedStatus(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Error saving form');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = () => {
    const shareUrl = schema?.slug ? `${window.location.origin}/f/${schema.slug}` : `${window.location.origin}/f/${params.formId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveSlug = async () => {
    if (!schema) return;
    if (!slugInput.trim() || slugInput === schema.slug) {
      setIsEditingSlug(false);
      return;
    }
    
    setSlugError(null);
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: schema.id,
          title: schema.title,
          description: schema.description,
          fields: schema.fields,
          slug: slugInput
        }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        setSlugError(data.error || 'Failed to save slug');
        return;
      }
      
      setSchema({ ...schema, slug: slugInput });
      setIsEditingSlug(false);
      setSlugSavedStatus(true);
      setTimeout(() => setSlugSavedStatus(false), 2000);
    } catch (err: any) {
      setSlugError(err.message || 'Error updating slug');
    }
  };

  const handleImprove = async () => {
    if (!schema) return;
    setImproving(true);
    setImproveError(false);
    
    try {
      const res = await fetch('/api/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schema }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setSchema(data.schema);
      setImproveSuccess(true);
      setTimeout(() => setImproveSuccess(false), 3000);
    } catch (err) {
      setImproveError(true);
      setTimeout(() => setImproveError(false), 3000);
    } finally {
      setImproving(false);
    }
  };

  const handleToggleClose = async () => {
    if (!schema) return;
    const newClosedState = !schema.is_closed;
    
    setSchema({ ...schema, is_closed: newClosedState });
    
    try {
      await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: schema.id,
          title: schema.title,
          description: schema.description,
          fields: schema.fields,
          slug: schema.slug,
          is_closed: newClosedState
        }),
      });
      
      setClosedToastMsg(newClosedState ? 'Form closed' : 'Form reopened');
      setTimeout(() => setClosedToastMsg(null), 2000);
    } catch (err: any) {
      console.error(err);
      setSchema({ ...schema, is_closed: !newClosedState });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="space-y-6 text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-neutral-400 font-medium tracking-wide">Synthesizing Form...</p>
        </div>
      </div>
    );
  }

  if (error || !schema) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Form</h2>
          <p className="text-neutral-400 mb-8">{error || 'Form not found'}</p>
          <a href="/" className="inline-block px-6 py-3 bg-neutral-800 text-white rounded-xl hover:bg-neutral-700 transition font-medium w-full border border-neutral-700">
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col antialiased selection:bg-emerald-500/30">
      <ProgressBar loading={saving || improving} />
      
      {/* Top action bar */}
      <header className="sticky top-0 z-40 bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-800/80 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between shadow-sm gap-4 transition-all">
        <div className="flex items-center space-x-5">
          <a href="/" className="p-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-neutral-400 hover:text-white transition-all shadow-sm shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </a>

          {(improveSuccess || improveError) ? (
            <span className={`text-sm font-medium ${improveSuccess ? 'text-emerald-400' : 'text-red-400'} whitespace-nowrap hidden sm:inline-block`}>
              {improveSuccess ? '✦ Form improved by AI' : 'Improvement failed, try again'}
            </span>
          ) : (
            <button
              onClick={handleImprove}
              disabled={improving}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-bold border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-50 shrink-0"
            >
              {improving ? (
                <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              ) : (
                <span className="text-emerald-400">✦</span>
              )}
              <span className="hidden sm:inline">{improving ? 'Improving...' : 'Improve'}</span>
            </button>
          )}

          <div>
            <h1 className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest mb-0.5">Form Builder</h1>
            <input 
              type="text" 
              value={schema.title}
              onChange={(e) => setSchema({ ...schema, title: e.target.value })}
              className="bg-transparent text-white font-extrabold text-xl leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded px-1 -ml-1 border border-transparent hover:border-neutral-800"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href={`/dashboard/${params.formId}`}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all focus:outline-none bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-white"
          >
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            <span className="hidden sm:inline">Responses</span>
          </a>

          {savedStatus && (
            <span className="text-sm font-medium text-emerald-400 mr-2 flex items-center hidden sm:flex">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Saved
            </span>
          )}

          {isEditingSlug ? (
            <div className="flex items-center space-x-2 bg-neutral-900 border border-neutral-700/80 rounded-xl px-3 py-1.5 hidden sm:flex">
              <span className="text-neutral-500 font-medium">/f/</span>
              <input 
                type="text" 
                value={slugInput}
                onChange={(e) => {
                  const val = e.target.value.toLowerCase();
                  if (val === '' || /^[a-z0-9-]+$/.test(val)) {
                    setSlugInput(val);
                    setSlugError(null);
                  }
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveSlug()}
                placeholder={schema?.slug || params.formId}
                className="bg-transparent text-white focus:outline-none w-32 border-b border-transparent focus:border-emerald-500/50 text-sm placeholder:text-neutral-700 transition"
                autoFocus
              />
              <button 
                onClick={handleSaveSlug}
                className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors focus:outline-none"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 hidden sm:flex">
              {slugSavedStatus && <span className="text-sm text-emerald-400 font-medium">Slug saved!</span>}
              {slugError && <span className="text-xs text-red-400 font-medium mr-1">{slugError}</span>}
              <button
                onClick={() => {
                  setSlugInput(schema?.slug || '');
                  setIsEditingSlug(true);
                  setSlugError(null);
                }}
                className="p-2.5 text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 rounded-xl transition-all focus:outline-none"
                title="Edit custom slug"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
            </div>
          )}

          <button
            onClick={handleShare}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all focus:outline-none border ${copied ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800 text-white'}`}
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>Copied Link!</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                <span className="hidden sm:inline">Share</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-600/20 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? (
              <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            ) : (
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
            )}
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>

          <div className="flex items-center space-x-2 border-l border-neutral-800 pl-3">
            {closedToastMsg && <span className="text-xs font-medium text-emerald-400 absolute -top-4 right-6">{closedToastMsg}</span>}
            <button
              onClick={handleToggleClose}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all focus:outline-none ${schema.is_closed ? 'border-neutral-700 bg-neutral-900 text-neutral-400 hover:text-white' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}
              title={schema.is_closed ? "Reopen form" : "Close form"}
            >
              <div className={`w-2 h-2 rounded-full ${schema.is_closed ? 'bg-neutral-500' : 'bg-emerald-400 animate-pulse'}`}></div>
              <span>{schema.is_closed ? 'Closed' : 'Accepting'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Builder Area */}
      <FormBuilder schema={schema} onChange={setSchema} />
    </div>
  );
}
