export type FieldType = 'text' | 'email' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date';

export interface Field {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

export interface FormSchema {
  id: string;
  title: string;
  slug?: string;
  is_closed?: boolean;
  description?: string;
  fields: Field[];
}

export interface FormResponse {
  id: string;
  formId: string;
  answers: Record<string, any>;
  createdAt: string;
}
