'use client';
import { useState, useEffect } from 'react';
import ActionGrid from '@/components/actions/ActionGrid';
import CustomActionInput from '@/components/actions/CustomActionInput';
import CelebrationModal from '@/components/ui/CelebrationModal';
import catalog from '@/data/actions.json';

const CATEGORIES = catalog.categories;

export default function LogPage() {
  const [recentActions, setRecentActions] = useState([]);
  const [loggedState, setLoggedState] = useState({});
  const [celebration, setCelebration] = useState(null);
  const [totalXp, setTotalXp] = useState(0);

  useEffect(() => { fetchRecent(); }, []);

  const fetchRecent = async () => {
    const res = await fetch('/api/actions?userId=default-user');
    const data = await res.json();
    setRecentActions(data.actions ?? []);
  };

  const logAction = async (actionId) => {
    setLoggedState(prev => ({ ...prev, [actionId]: true }));
    setTimeout(() => setLoggedState(prev => ({ ...prev, [actionId]: false })), 1200);

    const res = await fetch('/api/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionId, userId: 'default-user' }),
    });
    const data = await res.json();
    if (data.tierChanged) setCelebration(data.newTier);
    setTotalXp(data.newTotalXp);
    fetchRecent();
  };

  const logCustom = async ({ description, co2Kg, xp }) => {
    await fetch('/api/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actionId: 'custom',
        userId: 'default-user',
        description,
        xp,
        co2: co2Kg,
      }),
    });
    fetchRecent();
  };

  return (
    <div className="log-page">
      <h1 className="page-title">Log Actions</h1>
      {totalXp > 0 && (
        <div className="xp-toast">+XP earned this session: {totalXp} total</div>
      )}

      <ActionGrid
        categories={CATEGORIES}
        onLogAction={logAction}
        loggedState={loggedState}
      />

      <CustomActionInput onLog={logCustom} />

      <div className="recent-actions">
        <h2 className="section-title">Recent Activity</h2>
        {recentActions.length === 0 && (
          <p className="empty-state">No actions logged yet. Start above!</p>
        )}
        <ul className="action-list">
          {recentActions.map(a => (
            <li key={a.id} className="action-list-item">
              <span className="action-list-desc">{a.description}</span>
              <span className="action-list-meta">+{a.xp_earned} XP · {a.co2_saved} kg CO₂</span>
              <span className="action-list-time">
                {new Date(a.created_at).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <CelebrationModal
        show={!!celebration}
        newTier={celebration}
        onClose={() => setCelebration(null)}
      />
    </div>
  );
}
