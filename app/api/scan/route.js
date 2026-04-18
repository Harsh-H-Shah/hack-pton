import { NextResponse } from 'next/server';
import { analyzeProduct } from '@/lib/gemini';

export async function POST(req) {
  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64) return NextResponse.json({ error: 'No image provided' }, { status: 400 });

    const base64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const result = await analyzeProduct(base64);
    if (!result) return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });

    return NextResponse.json({ result });
  } catch (err) {
    console.error('POST /api/scan error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
