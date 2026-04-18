'use client';
import { useState } from 'react';

export default function CustomActionInput({ onLog }) {
  const [text, setText] = useState('');
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleEstimate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/actions/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: text }),
      });
      const data = await res.json();
      setEstimate(data);
    } catch {
      setEstimate({ co2Kg: 0.5, xp: 5, reasoning: 'Estimated' });
    }
    setLoading(false);
  };

  const handleLog = () => {
    if (!estimate) return;
    onLog({ description: text, ...estimate });
    setText('');
    setEstimate(null);
  };

  return (
    <div className="custom-action">
      <h3 className="custom-action-title">Log a custom action</h3>
      <div className="custom-action-row">
        <input
          className="custom-action-input"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="e.g. Took a 5 min shorter shower"
          onKeyDown={e => e.key === 'Enter' && handleEstimate()}
        />
        <button className="btn-secondary" onClick={handleEstimate} disabled={loading || !text.trim()}>
          {loading ? '...' : 'Estimate'}
        </button>
      </div>
      {estimate && (
        <div className="custom-action-result">
          <span>+{estimate.xp} XP · {estimate.co2Kg} kg CO₂</span>
          <span className="custom-action-reasoning">{estimate.reasoning}</span>
          <button className="btn-primary" onClick={handleLog}>Log It</button>
        </div>
      )}
    </div>
  );
}
