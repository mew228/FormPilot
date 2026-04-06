"use client";

import React, { useState } from 'react';
import { FormSchema, Field } from '@/lib/types';
import FormRenderer from './FormRenderer';
import FieldEditor from './FieldEditor';

interface FormBuilderProps {
  schema: FormSchema;
  onChange: (schema: FormSchema) => void;
}

export default function FormBuilder({ schema, onChange }: FormBuilderProps) {
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  const handleAddField = () => {
    const newField: Field = {
      id: Math.random().toString(36).substring(7),
      type: 'text',
      label: 'New Field',
      placeholder: '',
      required: false,
    };
    onChange({ ...schema, fields: [...schema.fields, newField] });
    setSelectedFieldId(newField.id);
  };

  const handleDeleteField = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onChange({ ...schema, fields: schema.fields.filter(f => f.id !== id) });
    if (selectedFieldId === id) setSelectedFieldId(null);
  };

  const handleFieldChange = (updatedField: Field) => {
    onChange({
      ...schema,
      fields: schema.fields.map(f => f.id === updatedField.id ? updatedField : f)
    });
  };

  const selectedField = schema.fields.find(f => f.id === selectedFieldId);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden bg-neutral-950">
      
      {/* Left Panel: Field List */}
      <div className="w-full lg:w-80 bg-neutral-900 border-r border-neutral-800 flex flex-col h-[300px] lg:h-full overflow-hidden flex-shrink-0 relative z-10 shadow-lg shadow-neutral-900/50">
        <div className="p-5 flex justify-between items-center border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
          <h2 className="text-sm font-bold text-neutral-400 tracking-wider uppercase">Fields</h2>
          <button
            onClick={handleAddField}
            className="p-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 rounded-lg transition-colors border border-emerald-500/20"
            title="Add Field"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {schema.fields.length === 0 && (
            <div className="text-center p-8 text-neutral-500 text-sm border-2 border-dashed border-neutral-800 rounded-xl m-2 bg-neutral-900/50">
              No fields yet.<br/>Click + to add your first field.
            </div>
          )}
          
          {schema.fields.map(field => (
            <div
              key={field.id}
              onClick={() => setSelectedFieldId(field.id)}
              className={`group flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all border ${
                selectedFieldId === field.id
                  ? 'bg-emerald-900/20 border-emerald-500/30 shadow-sm shadow-emerald-900/10'
                  : 'bg-neutral-950 border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-900'
              }`}
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className={`p-1.5 rounded-lg flex items-center justify-center shrink-0 w-10 ${selectedFieldId === field.id ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-400'}`}>
                  <span className="text-[9px] uppercase font-bold tracking-wider">{field.type.substring(0, 3)}</span>
                </div>
                <span className="text-sm font-semibold text-white truncate pr-2">{field.label || 'Unnamed Field'}</span>
              </div>
              <button
                onClick={(e) => handleDeleteField(e, field.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Middle Panel: Live Preview */}
      <div className="flex-1 bg-neutral-950 p-6 lg:p-12 overflow-y-auto w-full relative custom-scrollbar">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        <div className="max-w-3xl mx-auto relative z-10 pb-20 mt-4 xl:mt-8">
          <FormRenderer schema={schema} />
        </div>
      </div>

      {/* Right Panel: Field Editor Side Panel */}
      {selectedField && (
        <div className="w-full lg:w-80 bg-neutral-900 border-l border-neutral-800 h-[400px] lg:h-full flex flex-col flex-shrink-0 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.5)] z-20">
          <div className="p-5 border-b border-neutral-800 flex justify-between items-center bg-neutral-900">
            <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Properties</h2>
            <button onClick={() => setSelectedFieldId(null)} className="p-1.5 text-neutral-500 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
            <FieldEditor field={selectedField} onChange={handleFieldChange} />
          </div>
        </div>
      )}
    </div>
  );
}
