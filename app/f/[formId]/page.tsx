"use client";

import React, { useEffect, useState } from 'react';
import { FormSchema } from '@/lib/types';
import FormRenderer from '@/components/FormRenderer';

export default function FormViewPage({ params }: { params: { formId: string } }) {
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function fetchForm() {
      try {
        let res = await fetch(`/api/forms?form_id=${params.formId}`);
        let data = await res.json();
        
        if (!res.ok) {
          res = await fetch(`/api/forms?slug=${params.formId}`);
          data = await res.json();
        }
        
        if (!res.ok) throw new Error(data.error || 'Failed to fetch the form');
        
        setSchema({
          id: data.form.id,
          title: data.form.title,
          description: data.form.description,
          fields: data.form.fields || [],
          is_closed: data.form.is_closed,
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchForm();
  }, [params.formId]);

  const handleChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: false }));
    }
  };

  const handleSubmit = async () => {
    if (!schema) return;
    
    // Validate custom
    let isValid = true;
    const newErrors: Record<string, boolean> = {};
    
    schema.fields.forEach(field => {
      if (field.required) {
        const val = formData[field.id];
        // Handle undefined, null, empty strings, and empty arrays (for checkboxes)
        if (
          val === undefined || 
          val === null || 
          val === '' || 
          (Array.isArray(val) && val.length === 0)
        ) {
          isValid = false;
          newErrors[field.id] = true;
        }
      }
    });

    if (!isValid) {
      setErrors(newErrors);
      setSubmitError("Please fill out all required fields before submitting.");
      return;
    }

    setSubmitError(null);
    setSubmitLoading(true);
    
    try {
      const res = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_id: params.formId,
          data: formData
        })
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to submit response');
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setSubmitError(err.message || 'An error occurred while submitting.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 antialiased">
        <div className="w-16 h-16 border-[3px] border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-neutral-400 font-medium tracking-wide">Loading form environment...</p>
      </div>
    );
  }

  if (error || !schema) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6 antialiased">
        <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <svg className="w-16 h-16 text-red-500/80 mx-auto mb-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Form Temporarily Unavailable</h2>
          <p className="text-red-400/80 mb-0 font-medium">{error || 'This form is missing or has been deleted.'}</p>
        </div>
      </div>
    );
  }

  if (schema.is_closed) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 antialiased relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-neutral-800/10 blur-[120px] rounded-full"></div>
        </div>
        
        <div className="max-w-md w-full bg-neutral-900/60 backdrop-blur-xl border border-neutral-800/80 rounded-3xl p-10 text-center shadow-2xl relative z-10">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-neutral-600 to-neutral-800 rounded-t-3xl" />
          <div className="w-20 h-20 bg-neutral-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-neutral-700/50">
            <svg className="w-10 h-10 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-3 tracking-tight">This form is closed</h1>
          <p className="text-neutral-400 max-w-[280px] mx-auto leading-relaxed mb-10 text-lg">The form owner is no longer accepting responses.</p>
          <a href="/" className="text-sm font-semibold tracking-wide text-neutral-500 hover:text-neutral-400 transition-colors bg-neutral-800/50 hover:bg-neutral-800 px-5 py-2.5 rounded-full inline-block">
            Powered by FormPilot
          </a>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 antialiased relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-500/5 blur-[120px] rounded-full"></div>
        </div>
        
        <div className="max-w-md w-full bg-neutral-900/60 backdrop-blur-xl border border-neutral-800/80 rounded-3xl p-10 text-center shadow-2xl relative z-10">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-t-3xl" />
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
            <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-3 tracking-tight">Response submitted!</h1>
          <p className="text-neutral-400 max-w-[280px] mx-auto leading-relaxed mb-10 text-lg">Thank you for filling out this form.</p>
          <a href="/" className="text-sm font-semibold tracking-wide text-emerald-500 hover:text-emerald-400 transition-colors bg-emerald-500/10 hover:bg-emerald-500/20 px-5 py-2.5 rounded-full inline-block">
            Powered by FormPilot
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col py-16 px-4 sm:px-6 antialiased selection:bg-emerald-500/30 relative">
      {/* Decorative ambient background */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-emerald-900/10 to-transparent pointer-events-none" />

      <div className="w-full max-w-2xl mx-auto mb-10 md:mb-12 text-center md:text-left space-y-4 relative z-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">{schema.title}</h1>
        {schema.description && (
          <p className="text-lg text-neutral-400 leading-relaxed max-w-prose">{schema.description}</p>
        )}
      </div>

      <div className="w-full max-w-2xl mx-auto bg-neutral-900/80 backdrop-blur-2xl border border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10 transition-all">
        {submitError && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-start space-x-3">
            <svg className="w-6 h-6 shrink-0 mt-0.5 text-red-500/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-[15px] font-medium leading-relaxed">{submitError}</p>
          </div>
        )}
        
        <FormRenderer 
          schema={schema} 
          interactive={true} 
          values={formData} 
          onChange={handleChange} 
          errors={errors} 
          onSubmit={handleSubmit}
          submitLoading={submitLoading}
        />
      </div>

      <div className="mt-16 text-center relative z-10">
        <p className="text-xs text-neutral-600 font-medium uppercase tracking-[0.2em]">FormPilot Intelligence</p>
      </div>
    </div>
  );
}
