'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import TierProgress from '@/components/ui/TierProgress';
import CelebrationModal from '@/components/ui/CelebrationModal';
import ActionCard from '@/components/actions/ActionCard';

// PixiJS must be client-only (no SSR)
const WorldScene = dynamic(() => import('@/components/world/WorldScene'), { ssr: false });

const QUICK_ACTIONS = [
  { id: 'bike',    category: { emoji: '🚲', color: '#10b981' }, label: 'Biked today', xp: 15 },
  { id: 'veggie',  category: { emoji: '🥗', color: '#f59e0b' }, label: 'Vegetarian meal', xp: 8 },
  { id: 'recycle', category: { emoji: '♻️', color: '#8b5cf6' }, label: 'Recycled',     xp: 5 },
  { id: 'walk',    category: { emoji: '👟', color: '#10b981' }, label: 'Walked today', xp: 10 },
];

export default function HomePage() {
  const router = useRouter();
  const [world, setWorld] = useState(null);
  const [stats, setStats] = useState(null);
  const [celebration, setCelebration] = useState(null);
  const [loggedState, setLoggedState] = useState({});

  useEffect(() => {
    const env = localStorage.getItem('ecoverse-env');
    if (!env) { router.push('/onboarding'); return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    const [w, s] = await Promise.all([
      fetch('/api/world?userId=default-user').then(r => r.json()),
      fetch('/api/stats?userId=default-user').then(r => r.json()),
    ]);
    setWorld(w);
    setStats(s);
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
    if (data.tierChanged) {
      setCelebration(data.newTier);
    }
    fetchData();
  };

  const handleCelebrationClose = () => {
    setCelebration(null);
    fetchData();
  };

  return (
    <div className="home-page">
      {/* Hero world */}
      <div className="world-container">
        <WorldScene
          environment={world?.environment ?? 'home'}
          tier={world?.tier ?? { id: 1, name: 'Barren', emoji: '🌫️' }}
          unlockedElements={world?.unlockedElements ?? []}
        />
      </div>

      {/* Tier progress */}
      {stats && (
        <TierProgress
          currentXp={stats.user.total_xp}
          tier={stats.tier}
          nextTier={stats.nextTier}
        />
      )}

      {/* Quick stats */}
      {stats && (
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-value">{stats.user.total_co2_saved.toFixed(1)}</span>
            <span className="stat-label">kg CO₂ saved</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.user.streak_days}</span>
            <span className="stat-label">day streak 🔥</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.actionsToday}</span>
            <span className="stat-label">actions today</span>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="quick-actions-section">
        <h2 className="section-title">Quick Log</h2>
        <div className="quick-actions-grid">
          {QUICK_ACTIONS.map(qa => (
            <ActionCard
              key={qa.id}
              action={qa}
              category={qa.category}
              onLog={logAction}
              justLogged={loggedState[qa.id] ?? false}
            />
          ))}
        </div>
        <Link href="/log" className="btn-outline btn-full">
          Log All Actions →
        </Link>
      </div>

      <CelebrationModal
        show={!!celebration}
        newTier={celebration}
        onClose={handleCelebrationClose}
      />
    </div>
  );
}
