"use client";

import React, { useEffect, useState } from 'react';
import { Field, FieldType } from '@/lib/types';

interface FieldEditorProps {
  field: Field;
  onChange: (updatedField: Field) => void;
}

const FIELD_TYPES: FieldType[] = [
  'text', 'email', 'number', 'textarea', 'select', 'radio', 'checkbox', 'date'
];

export default function FieldEditor({ field, onChange }: FieldEditorProps) {
  const [optionsText, setOptionsText] = useState(field.options?.join('\n') || '');

  // Keep local state in sync if a different field is selected
  useEffect(() => {
    setOptionsText(field.options?.join('\n') || '');
  }, [field.id, field.options]);

  const handleChange = (key: keyof Field, value: any) => {
    onChange({ ...field, [key]: value });
  };

  const handleOptionsChange = (text: string) => {
    setOptionsText(text);
    const optionsArray = text.split('\n').map(o => o.trim()).filter(Boolean);
    onChange({ ...field, options: optionsArray });
  };

  const showOptions = ['select', 'radio', 'checkbox'].includes(field.type);

  return (
    <div className="space-y-6 pt-4 h-full">
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-neutral-400 tracking-wider uppercase">Field Label</label>
        <input
          type="text"
          value={field.label}
          onChange={(e) => handleChange('label', e.target.value)}
          className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
          placeholder="e.g. Full Name"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-neutral-400 tracking-wider uppercase">Type</label>
        <div className="relative">
          <select
            value={field.type}
            onChange={(e) => handleChange('type', e.target.value as FieldType)}
            className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 appearance-none transition-colors"
          >
            {FIELD_TYPES.map(type => (
              <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-neutral-400 tracking-wider uppercase">Placeholder</label>
        <input
          type="text"
          value={field.placeholder || ''}
          onChange={(e) => handleChange('placeholder', e.target.value)}
          className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
          placeholder="e.g. John Doe"
        />
      </div>

      <div className="flex items-center justify-between pt-2 pb-2">
        <label className="text-sm font-semibold text-neutral-300">Required Field</label>
        <button
          type="button"
          onClick={() => handleChange('required', !field.required)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-neutral-900 ${field.required ? 'bg-emerald-500' : 'bg-neutral-700'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${field.required ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>

      {showOptions && (
        <div className="space-y-1.5 pt-6 border-t border-neutral-800/80">
          <label className="text-xs font-bold text-neutral-400 tracking-wider uppercase flex items-center justify-between">
            <span>Options</span>
            <span className="text-[10px] font-normal text-neutral-500 normal-case bg-neutral-800 px-2 rounded">One per line</span>
          </label>
          <textarea
            value={optionsText}
            onChange={(e) => handleOptionsChange(e.target.value)}
            rows={5}
            className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none transition-colors"
            placeholder="Option 1&#10;Option 2&#10;Option 3"
          />
        </div>
      )}
    </div>
  );
}
