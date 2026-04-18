'use client';
import { useState } from 'react';

export default function TransportCompare({ onLogTrip }) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleCompare = async () => {
    if (!origin.trim() || !destination.trim()) return;
    setLoading(true);
    const res = await fetch('/api/transport', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin, destination }),
    });
    const data = await res.json();
    setResults(data);
    setLoading(false);
  };

  const canLog = (mode) => ['walk', 'bike', 'train', 'bus'].includes(mode.id);

  return (
    <div className="transport-compare">
      <div className="transport-inputs">
        <input
          className="transport-input"
          placeholder="From (e.g. Princeton, NJ)"
          value={origin}
          onChange={e => setOrigin(e.target.value)}
        />
        <span className="transport-arrow">→</span>
        <input
          className="transport-input"
          placeholder="To (e.g. NYC)"
          value={destination}
          onChange={e => setDestination(e.target.value)}
        />
        <button className="btn-primary" onClick={handleCompare} disabled={loading}>
          {loading ? 'Calculating...' : 'Compare'}
        </button>
      </div>

      {results && (
        <div className="transport-results">
          <p className="transport-distance">
            ~{results.distanceKm} km · {results.confidence} confidence estimate
          </p>
          <div className="mode-cards">
            {results.modes.map((m, i) => (
              <div key={m.id} className={`mode-card ${i === 0 ? 'mode-card--best' : ''}`}>
                <span className="mode-emoji">{m.emoji}</span>
                <span className="mode-label">{m.label}</span>
                <span className="mode-co2">{m.co2Kg} kg CO₂</span>
                {m.id !== 'car' && m.savingsVsCar > 0 && (
                  <span className="mode-savings">{m.savingsVsCar}% less than car</span>
                )}
                {canLog(m) && onLogTrip && (
                  <button className="mode-log-btn" onClick={() => onLogTrip(m)}>
                    Log this trip +XP
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
