import { NextResponse } from 'next/server';
import { estimateDistance } from '@/lib/gemini';

// EPA emission factors (kg CO₂ per km)
const MODES = [
  { id:'walk',   emoji:'🚶', label:'Walk',          co2PerKm: 0,     speed:'slow'   },
  { id:'bike',   emoji:'🚲', label:'Bike',          co2PerKm: 0,     speed:'slow'   },
  { id:'train',  emoji:'🚆', label:'Train',         co2PerKm: 0.041, speed:'fast'   },
  { id:'bus',    emoji:'🚌', label:'Bus',           co2PerKm: 0.089, speed:'medium' },
  { id:'car',    emoji:'🚗', label:'Car (solo)',    co2PerKm: 0.210, speed:'fast'   },
  { id:'flight', emoji:'✈️', label:'Flight',        co2PerKm: 0.255, speed:'fastest'},
];

export async function POST(req) {
  try {
    const { origin, destination } = await req.json();
    if (!origin || !destination) {
      return NextResponse.json({ error: 'origin and destination required' }, { status: 400 });
    }

    const { distanceKm, confidence } = await estimateDistance(origin, destination);

    const carCo2 = distanceKm * 0.210;
    const modes = MODES.map(m => ({
      ...m,
      co2Kg: +(distanceKm * m.co2PerKm).toFixed(3),
      savingsVsCar: m.id === 'car' ? 0 : +(((carCo2 - distanceKm * m.co2PerKm) / carCo2) * 100).toFixed(0),
    })).sort((a, b) => a.co2Kg - b.co2Kg);

    return NextResponse.json({ distanceKm, confidence, modes });
  } catch (err) {
    console.error('POST /api/transport error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
