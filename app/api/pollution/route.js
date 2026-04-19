import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key not configured. Add OPENWEATHERMAP_API_KEY to .env.local' },
      { status: 500 }
    );
  }

  let lat = searchParams.get('lat');
  let lon = searchParams.get('lon');
  let locationName = 'Current Location';
  const q = searchParams.get('q');

  try {
    if (q) {
      const geoRes = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=1&appid=${apiKey}`
      );
      const geoData = await geoRes.json();
      if (!Array.isArray(geoData) || !geoData.length) {
        return NextResponse.json({ error: 'Location not found' }, { status: 404 });
      }
      lat = geoData[0].lat;
      lon = geoData[0].lon;
      locationName = [geoData[0].name, geoData[0].state, geoData[0].country]
        .filter(Boolean)
        .join(', ');
    }

    if (!lat || !lon) {
      return NextResponse.json({ error: 'Location required' }, { status: 400 });
    }

    const [pollRes, weatherRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`),
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`),
    ]);

    const pollData = await pollRes.json();
    const weatherData = await weatherRes.json();

    return NextResponse.json({
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      locationName,
      aqi: pollData.list[0].main.aqi,
      components: pollData.list[0].components,
      weather: {
        temp: weatherData.main?.temp ?? null,
        humidity: weatherData.main?.humidity ?? null,
        wind_speed: weatherData.wind?.speed ?? null,
        description: weatherData.weather?.[0]?.description ?? null,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
