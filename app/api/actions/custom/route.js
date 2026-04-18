import { NextResponse } from 'next/server';
import { estimateCustomAction } from '@/lib/gemini';

export async function POST(req) {
  try {
    const { description } = await req.json();
    if (!description) return NextResponse.json({ error: 'description required' }, { status: 400 });
    const result = await estimateCustomAction(description);
    return NextResponse.json(result);
  } catch (err) {
    console.error('custom action error:', err);
    return NextResponse.json({ co2Kg: 0.5, xp: 5, reasoning: 'Estimated' });
  }
}
