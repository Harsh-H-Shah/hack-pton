'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './pollution.module.css';

const PollutionMap = dynamic(() => import('@/components/pollution/PollutionMap'), { ssr: false });

const AQI_INFO = [
  null,
  {
    label: 'Good',
    color: '#10d870',
    bg: 'rgba(16,216,112,0.08)',
    emoji: '😊',
    desc: 'Air quality is satisfactory.',
    who: 'Safe for everyone, including sensitive groups',
    precautions: [
      'Enjoy outdoor activities freely',
      'Great day for exercise outside',
      'No special precautions needed',
    ],
  },
  {
    label: 'Fair',
    color: '#a8d020',
    bg: 'rgba(168,208,32,0.08)',
    emoji: '🙂',
    desc: 'Air quality is acceptable.',
    who: 'Very sensitive individuals may notice minor effects',
    precautions: [
      'Unusually sensitive people should consider reducing prolonged outdoor exertion',
      'Generally safe for most people',
      'Monitor conditions if you have respiratory issues',
    ],
  },
  {
    label: 'Moderate',
    color: '#f0a020',
    bg: 'rgba(240,160,32,0.08)',
    emoji: '😐',
    desc: 'Sensitive groups may experience effects.',
    who: 'Children, elderly, people with asthma or heart disease',
    precautions: [
      'Sensitive groups should limit prolonged outdoor exertion',
      'Consider wearing a mask if you have asthma',
      'Keep windows closed if you are sensitive',
      'Monitor air quality updates throughout the day',
    ],
  },
  {
    label: 'Poor',
    color: '#f06020',
    bg: 'rgba(240,96,32,0.08)',
    emoji: '😷',
    desc: 'Everyone may experience health effects.',
    who: 'Everyone, especially children, elderly, and sensitive groups',
    precautions: [
      'Limit outdoor activities, especially strenuous exercise',
      'Wear an N95 mask when going outdoors',
      'Keep windows and doors closed',
      'Run air purifiers indoors if available',
      'Sensitive groups should remain indoors',
    ],
  },
  {
    label: 'Very Poor',
    color: '#f03050',
    bg: 'rgba(240,48,80,0.08)',
    emoji: '🚨',
    desc: 'Health alert — serious risk for everyone.',
    who: 'Everyone is at risk',
    precautions: [
      'Avoid all outdoor activities',
      'Wear N95 mask if going outside is unavoidable',
      'Seal windows and doors, stay indoors',
      'Use a high-quality air purifier',
      'Seek medical attention if you experience symptoms',
      'Vulnerable groups should relocate to a clean indoor space',
    ],
  },
];

const POLLUTANTS = [
  { key: 'pm2_5',  label: 'PM2.5', unit: 'μg/m³', safe: 10,   moderate: 25,   poor: 50,    info: 'Fine particles — penetrate deep into lungs' },
  { key: 'pm10',   label: 'PM10',  unit: 'μg/m³', safe: 20,   moderate: 50,   poor: 100,   info: 'Coarse particles — dust and pollen' },
  { key: 'o3',     label: 'Ozone', unit: 'μg/m³', safe: 60,   moderate: 100,  poor: 180,   info: 'Ground-level ozone — respiratory irritant' },
  { key: 'no2',    label: 'NO₂',   unit: 'μg/m³', safe: 40,   moderate: 70,   poor: 150,   info: 'Nitrogen dioxide — from combustion' },
  { key: 'co',     label: 'CO',    unit: 'μg/m³', safe: 4400, moderate: 9400, poor: 12400, info: 'Carbon monoxide — odorless combustion gas' },
  { key: 'so2',    label: 'SO₂',   unit: 'μg/m³', safe: 20,   moderate: 80,   poor: 250,   info: 'Sulphur dioxide — from fossil fuels' },
];

function pollutantLevel(value, p) {
  if (value <= p.safe)     return { label: 'Good',  color: '#10d870' };
  if (value <= p.moderate) return { label: 'Fair',  color: '#a8d020' };
  if (value <= p.poor)     return { label: 'Poor',  color: '#f0a020' };
  return                          { label: 'Hazard', color: '#f03050' };
}

export default function PollutionPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  async function fetchData(params) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/pollution?${new URLSearchParams(params)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch data');
      setData(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) fetchData({ q: query.trim() });
  }

  function handleGeolocate() {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLoading(false);
        fetchData({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      () => {
        setGeoLoading(false);
        setError('Could not get your location. Please enter it manually.');
      }
    );
  }

  const info = data ? AQI_INFO[data.aqi] : null;

  return (
    <div className="main-content">
      <h1 className="page-title">Air Quality</h1>
      <p className="page-subtitle">Real-time AQI, pollutant levels, and health precautions for any location.</p>

      <form onSubmit={handleSearch} className={styles.searchRow}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Enter city, address, or place…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button type="submit" className="btn-primary" disabled={loading || !query.trim()}>
          {loading ? '…' : 'Check AQI'}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={handleGeolocate}
          disabled={geoLoading || loading}
        >
          {geoLoading ? 'Locating…' : '📍 My Location'}
        </button>
      </form>

      {error && <div className={styles.errorBox}>⚠ {error}</div>}

      {loading && <div className="loading-page">Fetching air quality data…</div>}

      {data && info && (
        <div>
          {/* Location header */}
          <div className={styles.locationHeader}>
            <span className={styles.locationName}>📍 {data.locationName}</span>
            {data.weather?.description && (
              <span className={styles.weatherInfo}>
                {data.weather.temp != null && `${Math.round(data.weather.temp)}°C · `}
                {data.weather.description}
                {data.weather.humidity != null && ` · 💧 ${data.weather.humidity}%`}
              </span>
            )}
          </div>

          {/* Map */}
          <div className={styles.mapWrapper}>
            <PollutionMap lat={data.lat} lon={data.lon} aqi={data.aqi} />
          </div>

          {/* AQI Hero */}
          <div
            className={styles.aqiHero}
            style={{ '--aqi-color': info.color, '--aqi-bg': info.bg, '--aqi-border': info.color }}
          >
            <div className={styles.aqiLeft}>
              <div className={styles.aqiEmoji}>{info.emoji}</div>
              <div>
                <div className={styles.aqiValue}>{data.aqi}<span style={{ fontSize: '1rem', opacity: 0.5 }}>/5</span></div>
                <div className={styles.aqiLabel}>{info.label}</div>
                <div className={styles.aqiDesc}>{info.desc}</div>
              </div>
            </div>
            <div className={styles.aqiRight}>
              <div className={styles.aqiWho}>⚠ Affected: {info.who}</div>
              <ul className={styles.precautionList}>
                {info.precautions.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          </div>

          {/* AQI Scale */}
          <div className={styles.aqiScale}>
            {AQI_INFO.slice(1).map((lvl, i) => (
              <div
                key={i}
                className={`${styles.scaleItem} ${data.aqi === i + 1 ? styles.scaleItemActive : ''}`}
                style={{ '--sc': lvl.color }}
              >
                <span>{i + 1}</span>
                <span>{lvl.label}</span>
              </div>
            ))}
          </div>

          {/* Pollutants */}
          <h2 className="section-title">Pollutant Breakdown</h2>
          <div className={styles.pollutantGrid}>
            {POLLUTANTS.map(p => {
              const val = data.components?.[p.key];
              if (val == null) return null;
              const lvl = pollutantLevel(val, p);
              const pct = Math.min(100, (val / (p.poor * 1.5)) * 100);
              return (
                <div key={p.key} className={styles.pollutantCard}>
                  <div className={styles.pollutantHeader}>
                    <span className={styles.pollutantLabel}>{p.label}</span>
                    <span className={styles.pollutantBadge} style={{ '--pc': lvl.color }}>{lvl.label}</span>
                  </div>
                  <div className={styles.pollutantValue}>
                    {val.toFixed(1)} <span className={styles.pollutantUnit}>{p.unit}</span>
                  </div>
                  <div className={styles.pollutantBar}>
                    <div className={styles.pollutantFill} style={{ width: `${pct}%`, background: lvl.color }} />
                  </div>
                  <div className={styles.pollutantInfo}>{p.info}</div>
                </div>
              );
            })}
          </div>

          {/* Full legend */}
          <h2 className="section-title">AQI Legend & Health Precautions</h2>
          <div className={styles.legend}>
            {AQI_INFO.slice(1).map((lvl, i) => (
              <div
                key={i}
                className={`${styles.legendRow} ${data.aqi === i + 1 ? styles.legendRowActive : ''}`}
                style={{ '--lc': lvl.color, '--lb': lvl.bg }}
              >
                <div className={styles.legendLeft}>
                  <span className={styles.legendEmoji}>{lvl.emoji}</span>
                  <div>
                    <span className={styles.legendIndex}>{i + 1}</span>
                    <span className={styles.legendLabel}>{lvl.label}</span>
                  </div>
                </div>
                <div className={styles.legendRight}>
                  <div className={styles.legendWho}>Affected: {lvl.who}</div>
                  <ul className={styles.legendPrecautions}>
                    {lvl.precautions.map((pr, j) => <li key={j}>{pr}</li>)}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!data && !loading && !error && (
        <div className={styles.emptyState}>
          <div className={styles.emptyEmoji}>🌬️</div>
          <p>Enter a location or use GPS to check real-time air quality, pollutant levels, and health advice.</p>
          <div className={styles.apiNote}>
            <span>Powered by OpenWeatherMap. Add your key to <code>.env.local</code>:</span>
            <code>OPENWEATHERMAP_API_KEY=your_key_here</code>
            <span>Free tier at <code>openweathermap.org/api</code></span>
          </div>
        </div>
      )}
    </div>
  );
}
