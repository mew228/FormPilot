import { NextRequest, NextResponse } from 'next/server';
import { generateForm } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const schema = await generateForm(prompt);

    return NextResponse.json({ schema });
  } catch (error: any) {
    console.error('Generate route error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
