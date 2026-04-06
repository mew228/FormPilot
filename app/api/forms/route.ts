import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { id, title, description, fields, slug, is_closed } = await req.json();

    if (!title || !fields) {
      return NextResponse.json({ error: 'Title and fields are required' }, { status: 400 });
    }

    if (slug) {
      const { data: existing } = await supabase.from('forms').select('id').eq('slug', slug).single();
      if (existing && existing.id !== id) {
        return NextResponse.json({ error: 'This slug is already taken' }, { status: 400 });
      }
    }

    const payload = id ? { id, title, description, fields, slug, is_closed } : { title, description, fields, slug, is_closed };

    const { data, error } = await supabase
      .from('forms')
      .upsert([payload])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ formId: data.id });
  } catch (error: any) {
    console.error('Create/Update form error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const form_id = searchParams.get('form_id');
    const slug = searchParams.get('slug');

    if (!form_id && !slug) {
      return NextResponse.json({ error: 'form_id or slug is required' }, { status: 400 });
    }

    let query = supabase.from('forms').select('*');
    if (form_id) {
      query = query.eq('id', form_id);
    } else if (slug) {
      query = query.eq('slug', slug);
    }

    const { data, error } = await query.single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ form: data });
  } catch (error: any) {
    console.error('Get form error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
