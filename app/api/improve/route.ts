import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { schema } = await req.json();

    if (!schema) {
      return NextResponse.json({ error: 'Schema is required' }, { status: 400 });
    }

    const prompt = `You are FormPilot, an expert form designer. 
Analyze this existing form schema and return an improved version.
Improve field labels to be clearer, add any obviously missing fields,
remove redundant fields, improve placeholders, and fix validation flags.
Keep the same general purpose of the form. Keep existing field IDs where possible.
Return ONLY valid JSON in the exact same schema format, nothing else.
Current schema: ${JSON.stringify(schema)}`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    text = text.trim();
    if (text.startsWith('```')) {
      const match = text.match(/^```[a-z]*\n([\s\S]*?)\n```$/i) || text.match(/^```\n([\s\S]*?)\n```$/);
      if (match) {
        text = match[1].trim();
      }
    }

    const improvedSchema = JSON.parse(text);

    return NextResponse.json({ schema: improvedSchema });
  } catch (error: any) {
    console.error('Improve error:', error);
    return NextResponse.json({ error: 'Failed to improve form' }, { status: 500 });
  }
}
