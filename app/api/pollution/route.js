import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  // Trim in case of stray whitespace/newline when pasted into Vercel env vars
  const apiKey = process.env.OPENWEATHERMAP_API_KEY?.trim();

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
      // OWM returns an error object (with .message) when the key is bad
      if (geoData?.message) {
        const msg = String(geoData.message).toLowerCase().includes('invalid api key')
          ? 'OpenWeatherMap rejected the API key. New keys take up to 2 hours to activate — if it\'s older than that, check Vercel env var OPENWEATHERMAP_API_KEY for typos/whitespace, then redeploy.'
          : `OpenWeatherMap: ${geoData.message}`;
        return NextResponse.json({ error: msg }, { status: 401 });
      }
      if (!Array.isArray(geoData) || !geoData.length) {
        return NextResponse.json({ error: `Location "${q}" not found. Try a city name like "London" or "New York".` }, { status: 404 });
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

    // Surface OWM auth/activation errors instead of crashing
    if (pollData?.message) {
      const msg = String(pollData.message).toLowerCase().includes('invalid api key')
        ? 'OpenWeatherMap rejected the API key. New keys take up to 2 hours to activate — if it\'s older than that, check Vercel env var OPENWEATHERMAP_API_KEY for typos/whitespace, then redeploy.'
        : `OpenWeatherMap: ${pollData.message}`;
      return NextResponse.json({ error: msg }, { status: pollRes.status });
    }
    if (!pollData.list?.[0]) {
      return NextResponse.json({ error: 'No air quality data returned for this location.' }, { status: 502 });
    }

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
  } catch (e) {
    return NextResponse.json({ error: `Server error: ${e.message}` }, { status: 500 });
  }
}
