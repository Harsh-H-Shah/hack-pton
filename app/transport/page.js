'use client';
import TransportCompare from '@/components/transport/TransportCompare';

const MODE_TO_ACTION = { walk: 'walk', bike: 'bike', train: 'transit', bus: 'transit' };

export default function TransportPage() {
  const handleLogTrip = async (mode) => {
    const actionId = MODE_TO_ACTION[mode.id];
    if (!actionId) return;
    await fetch('/api/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionId, userId: 'default-user' }),
    });
    alert(`+XP logged for ${mode.label}! 🌿`);
  };

  return (
    <div className="transport-page">
      <h1 className="page-title">Transport Comparator</h1>
      <p className="page-subtitle">
        Compare the carbon footprint of different ways to get somewhere. Log the greener option for XP.
      </p>
      <TransportCompare onLogTrip={handleLogTrip} />
    </div>
  );
}
