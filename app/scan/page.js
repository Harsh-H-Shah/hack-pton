'use client';
import { useState } from 'react';
import Scanner from '@/components/scanner/Scanner';
import ScanResult from '@/components/scanner/ScanResult';

export default function ScanPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [xpEarned, setXpEarned] = useState(null);

  const handleScan = async (base64) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.result);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleEarnXp = async (xp) => {
    await fetch('/api/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionId: 'scan-reward', userId: 'default-user', xp, co2: 0, description: `Scanned ${result?.productName ?? 'product'}` }),
    });
    setXpEarned(xp);
  };

  return (
    <div className="scan-page">
      <h1 className="page-title">Product Scanner</h1>
      <p className="page-subtitle">
        Point at any product label, packaging, or tag. Gemini will grade its sustainability.
      </p>

      <Scanner onScan={handleScan} loading={loading} />

      {error && <div className="error-banner">❌ {error}</div>}
      {xpEarned && <div className="success-banner">✨ +{xpEarned} XP added to your world!</div>}

      <ScanResult result={result} onEarnXp={handleEarnXp} />

      <div className="scan-tips">
        <h3>What works best</h3>
        <ul>
          <li>📦 Packaged food — check ingredients &amp; packaging</li>
          <li>🧴 Cleaning products — spot greenwashing claims</li>
          <li>👕 Clothing labels — materials &amp; origin</li>
          <li>🛒 Any product with a visible label</li>
        </ul>
      </div>
    </div>
  );
}
