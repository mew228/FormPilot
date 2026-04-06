import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { form_id, data } = await req.json();

    if (!form_id || !data) {
      return NextResponse.json({ error: 'form_id and data are required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('responses')
      .insert([
        { form_id, data }
      ]);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Submit response error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const form_id = searchParams.get('form_id');

    if (!form_id) {
      return NextResponse.json({ error: 'form_id is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('responses')
      .select('*')
      .eq('form_id', form_id)
      .order('submitted_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ responses: data });
  } catch (error: any) {
    console.error('Get responses error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
