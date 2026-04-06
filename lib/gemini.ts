import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export function buildPrompt(userPrompt: string) {
  return `You are a form schema generator. Generate a JSON form schema based on the following request: "${userPrompt}". 
The output MUST ONLY be a JSON object with the following structure:
{
  "title": "Form Title",
  "description": "Form Description",
  "fields": [
    {
      "id": "string",
      "type": "text | email | number | textarea | select | radio | checkbox | date",
      "label": "string",
      "placeholder": "string",
      "required": boolean,
      "options": ["string"] // optional, only for select, radio, checkbox
    }
  ]
}`;
}

export async function generateForm(prompt: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const userMessage = buildPrompt(prompt);
  
  const result = await model.generateContent(userMessage);
  const response = await result.response;
  let text = response.text();
  
  // Parse the response as JSON (strip any markdown fences if present)
  text = text.trim();
  if (text.startsWith('```')) {
    const match = text.match(/^```[a-z]*\n([\s\S]*?)\n```$/);
    if (match) {
      text = match[1].trim();
    }
  }

  return JSON.parse(text);
}
