'use client';
import { useState, useEffect } from 'react';
import ImpactCounter from '@/components/ui/ImpactCounter';
import EquivalencyCards from '@/components/ui/EquivalencyCards';
import CategoryChart from '@/components/dashboard/CategoryChart';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/api/stats?userId=default-user')
      .then(r => r.json())
      .then(setStats);
  }, []);

  if (!stats) return <div className="loading-page">Loading your impact...</div>;

  const avgAmericanKg = 16000; // 16 tons/year in kg
  const userKg = stats.user.total_co2_saved;
  const pctBetter = stats.recentActions?.length
    ? Math.min(99, Math.round((userKg / (avgAmericanKg / 365)) * 100))
    : 0;

  return (
    <div className="dashboard-page">
      <h1 className="page-title">Your Impact</h1>

      <div className="big-counter-section">
        <ImpactCounter
          value={stats.user.total_co2_saved}
          label="kg CO₂ saved"
          decimals={2}
        />
        <p className="tier-callout">
          {stats.tier.emoji} You're at <strong>{stats.tier.name}</strong>
          {stats.nextTier && ` — ${stats.nextTier.minXp - stats.user.total_xp} XP to ${stats.nextTier.name}`}
        </p>
      </div>

      <EquivalencyCards equivalencies={stats.equivalencies} />

      <CategoryChart breakdown={stats.categoryBreakdown} />

      <div className="action-timeline">
        <h2 className="section-title">Action History</h2>
        {stats.recentActions?.length === 0 && (
          <p className="empty-state">No actions yet — start logging!</p>
        )}
        <ul className="action-list">
          {(stats.recentActions ?? []).map(a => (
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
    </div>
  );
}
