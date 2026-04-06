"use client";

import React from 'react';
import { FormSchema, Field } from '@/lib/types';

interface FormRendererProps {
  schema: FormSchema;
  interactive?: boolean;
  values?: Record<string, any>;
  onChange?: (fieldId: string, value: any) => void;
  errors?: Record<string, boolean>;
  onSubmit?: () => void;
  submitLoading?: boolean;
}

export default function FormRenderer({ 
  schema, 
  interactive = false,
  values = {},
  onChange = () => {},
  errors = {},
  onSubmit,
  submitLoading = false
}: FormRendererProps) {

  const renderField = (field: Field) => {
    const isError = errors[field.id];
    // Base classes for textual inputs
    const baseInputClasses = `w-full px-4 py-3 rounded-xl text-white focus:outline-none focus:ring-1 transition-colors block ${
      isError 
        ? 'bg-red-500/5 border border-red-500/50 focus:ring-red-500 placeholder:text-red-500/50' 
        : 'bg-neutral-900 border border-neutral-800 focus:ring-emerald-500 placeholder:text-neutral-500 focus:bg-neutral-900/80 hover:border-neutral-700'
    }`;
    
    // For read-only inputs, no selection or interactive states
    const interactiveProps = interactive ? {} : { disabled: true };

    const value = values[field.id] || '';

    const handleChange = (e: any) => {
      if (!interactive) return;
      if (field.type === 'checkbox') {
        const checkboxValue = e.target.value;
        const currentVals: string[] = values[field.id] || [];
        if (e.target.checked) {
          onChange(field.id, [...currentVals, checkboxValue]);
        } else {
          onChange(field.id, currentVals.filter(v => v !== checkboxValue));
        }
      } else {
        onChange(field.id, e.target.value);
      }
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'date':
        return (
          <input
            {...interactiveProps}
            type={field.type}
            value={value}
            onChange={handleChange}
            placeholder={field.placeholder}
            required={field.required && interactive}
            className={baseInputClasses}
          />
        );
      case 'textarea':
        return (
          <textarea
            {...interactiveProps}
            value={value}
            onChange={handleChange}
            placeholder={field.placeholder}
            required={field.required && interactive}
            rows={4}
            className={`${baseInputClasses} resize-none`}
          />
        );
      case 'select':
        return (
          <div className="relative">
            <select
              {...interactiveProps}
              value={value}
              onChange={handleChange}
              required={field.required && interactive}
              className={`${baseInputClasses} appearance-none ${!interactive ? 'opacity-100 disabled:opacity-100' : ''} ${!value && interactive ? 'text-neutral-500' : 'text-neutral-200'}`}
            >
              <option value="" disabled hidden>{field.placeholder || 'Select an option'}</option>
              {field.options?.map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        );
      case 'radio':
        return (
          <div className={`space-y-3 pt-1 ${isError ? 'p-4 border border-red-500/50 rounded-xl bg-red-500/5 mt-1' : ''}`}>
            {field.options?.map((opt, i) => (
              <label key={i} className={`flex items-center space-x-3 text-neutral-300 ${interactive ? 'cursor-pointer group' : 'cursor-default'}`}>
                <input 
                  type="radio" 
                  name={field.id}
                  value={opt}
                  checked={value === opt}
                  onChange={handleChange}
                  {...interactiveProps}
                  required={field.required && interactive} 
                  className={`w-5 h-5 ${isError ? 'text-red-500 focus:ring-red-500' : 'text-emerald-500 focus:ring-emerald-500'} bg-neutral-900 border-neutral-700 focus:ring-offset-neutral-950 transition-all ${interactive ? 'group-hover:border-emerald-500/50' : ''}`} 
                />
                <span className={`text-[15px] ${interactive ? 'group-hover:text-white transition-colors' : ''}`}>{opt}</span>
              </label>
            ))}
          </div>
        );
      case 'checkbox':
        const checkedValues = Array.isArray(value) ? value : [];
        return (
          <div className={`space-y-3 pt-1 ${isError ? 'p-4 border border-red-500/50 rounded-xl bg-red-500/5 mt-1' : ''}`}>
            {field.options?.map((opt, i) => (
              <label key={i} className={`flex items-center space-x-3 text-neutral-300 ${interactive ? 'cursor-pointer group' : 'cursor-default'}`}>
                <input 
                  type="checkbox" 
                  name={field.id}
                  value={opt}
                  checked={checkedValues.includes(opt)}
                  onChange={handleChange}
                  {...interactiveProps}
                  className={`w-5 h-5 rounded ${isError ? 'text-red-500 focus:ring-red-500' : 'text-emerald-500 focus:ring-emerald-500'} bg-neutral-900 border-neutral-700 focus:ring-offset-neutral-950 transition-all ${interactive ? 'group-hover:border-emerald-500/50' : ''}`} 
                />
                <span className={`text-[15px] ${interactive ? 'group-hover:text-white transition-colors' : ''}`}>{opt}</span>
              </label>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`w-full ${interactive ? '' : 'bg-neutral-950 rounded-2xl border border-neutral-800 shadow-2xl p-6 md:p-10'}`}>
      {!interactive && (
        <div className="mb-10 text-center md:text-left">
          <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight">{schema.title || 'Untitled Form'}</h2>
          {schema.description && (
            <p className="text-neutral-400 text-lg leading-relaxed">{schema.description}</p>
          )}
        </div>
      )}

      <form 
        className={interactive ? "space-y-7" : "space-y-8"}
        onSubmit={(e) => {
          e.preventDefault();
          if (interactive && onSubmit) onSubmit();
        }}
        noValidate={interactive} // Custom validation handles this
      >
        {schema.fields.map((field) => (
          <div key={field.id} className="space-y-2.5">
            <label className={`block text-sm font-semibold tracking-wide ${errors[field.id] ? 'text-red-400' : 'text-neutral-300'}`}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1.5">*</span>}
            </label>
            {renderField(field)}
            {errors[field.id] && (
              <p className="text-red-500 text-xs font-medium tracking-wide flex items-center">
                <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                This field is required
              </p>
            )}
          </div>
        ))}

        {!interactive && (
          <div className="pt-6 mt-8 border-t border-neutral-800/80">
            <button
              type="button"
              disabled
              className="w-full bg-emerald-600/30 text-white/50 border border-emerald-500/20 font-bold tracking-wide py-3.5 px-4 rounded-xl cursor-not-allowed transition-all uppercase text-sm"
            >
              Submit Data (Preview)
            </button>
          </div>
        )}
        
        {interactive && (
          <div className="pt-8">
            <button
              type="submit"
              disabled={submitLoading}
              className="w-full flex justify-center items-center bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-[0_0_40px_-10px_rgba(16,185,129,0.4)] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
            >
              {submitLoading ? (
                <>
                  <svg className="w-5 h-5 mr-3 animate-spin text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting Payload...
                </>
              ) : (
                "Submit Response"
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
