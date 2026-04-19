'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import actionsData from '@/data/actions.json';
import { getTierForXp, getNextTier } from '@/lib/tiers';

const WorldCanvas = dynamic(() => import('@/components/world/WorldCanvas'), { ssr: false });

const CAT_COLORS = {
  transport: '#40a0f0', food: '#f0a020', energy: '#f0e020',
  waste: '#a060f0', shopping: '#f040a0', nature: '#16a34a', all: '#10d870',
  door: '#f0a020',
};

export default function HomePage() {
  const router = useRouter();
  const [world, setWorld]       = useState(null);
  const [stats, setStats]       = useState(null);
  const [activePanel, setActivePanel] = useState(null);
  const [nearZone, setNearZone] = useState(null);
  const [toasts, setToasts]     = useState([]);
  const [celebration, setCelebration] = useState(null);
  const [logging, setLogging]   = useState({});
  const [isInterior, setIsInterior] = useState(false);
  const [localXp, setLocalXp] = useState(0);
  const [localCo2, setLocalCo2] = useState(0);
  const toastIdRef = useRef(0);

  useEffect(() => {
    const env = localStorage.getItem('ecoverse-env');
    if (!env) { router.push('/onboarding'); return; }

    // Restore persisted XP immediately so HUD is correct before server responds
    const savedXp  = parseInt(localStorage.getItem('ecoverse-xp')  || '0', 10);
    const savedCo2 = parseFloat(localStorage.getItem('ecoverse-co2') || '0');
    if (savedXp  > 0) setLocalXp(savedXp);
    if (savedCo2 > 0) setLocalCo2(savedCo2);

    // Resync Vercel's ephemeral SQLite from localStorage on every cold-start
    if (savedXp > 0) {
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xp: savedXp, co2: savedCo2 }),
      }).catch(() => {});
    }

    fetchData();
  }, []);

  // Keep localXp in sync with server (take whichever is higher)
  useEffect(() => {
    if (!stats) return;
    const sXp  = stats.user?.total_xp        ?? 0;
    const sCo2 = stats.user?.total_co2_saved  ?? 0;
    setLocalXp(prev  => { const v = Math.max(prev, sXp);  localStorage.setItem('ecoverse-xp',  String(v)); return v; });
    setLocalCo2(prev => { const v = Math.max(prev, sCo2); localStorage.setItem('ecoverse-co2', String(v)); return v; });
  }, [stats]);

  const fetchData = async () => {
    const [w, s] = await Promise.all([
      fetch('/api/world?userId=default-user').then(r => r.json()).catch(() => null),
      fetch('/api/stats?userId=default-user').then(r => r.json()).catch(() => null),
    ]);
    if (w) setWorld(w);
    if (s) setStats(s);
  };

  const addToast = useCallback((msg, color = '#10d870') => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, msg, color }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2800);
  }, []);

  const logAction = async (actionId) => {
    if (logging[actionId]) return;
    setLogging(prev => ({ ...prev, [actionId]: true }));
    try {
      const res = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionId, userId: 'default-user', clientXp: localXp, clientCo2: localCo2 }),
      });
      const data = await res.json();
      // Update local state immediately from server response — no waiting for fetchData
      if (data.newTotalXp  != null) { setLocalXp(data.newTotalXp);   localStorage.setItem('ecoverse-xp',  String(data.newTotalXp)); }
      if (data.newTotalCo2 != null) { setLocalCo2(data.newTotalCo2); localStorage.setItem('ecoverse-co2', String(data.newTotalCo2)); }
      addToast(`🌟 +${data.xp ?? '?'} XP 🌟`, '#10d870');
      if (data.tierChanged) setCelebration(data.newTier);
      fetchData();
    } catch {
      addToast('FAILED', '#f03050');
    } finally {
      setLogging(prev => ({ ...prev, [actionId]: false }));
    }
  };

  const handleZoneClick = useCallback((cat) => {
    setActivePanel(cat === 'all' ? 'transport' : cat);
  }, []);

  const handleNearZone = useCallback((cat) => {
    setNearZone(cat);
  }, []);

  const handleEnterExit = useCallback((entering) => {
    setIsInterior(entering);
    if (entering) addToast('ENTERED HOME', '#f0a020');
    else addToast('OUTSIDE', '#10d870');
  }, [addToast]);

  // Derive everything from localXp (localStorage-backed) so it's always correct
  // even after a Vercel cold-start that wipes the ephemeral SQLite DB
  const totalXp      = localXp;
  const co2Saved     = localCo2.toFixed(1);
  const tier         = getTierForXp(totalXp);
  const nextTier     = getNextTier(totalXp);
  const streak       = stats?.user?.streak_days ?? 0;
  const actionsToday = stats?.actionsToday ?? 0;
  const tierMin      = tier.minXp ?? 0;
  const tierMax      = nextTier?.minXp ?? tierMin + 100;
  const progress     = Math.min(100, Math.max(0, ((totalXp - tierMin) / (tierMax - tierMin)) * 100));
  const categoryCounts = stats?.categoryCounts ?? {};

  const activeCatData = actionsData.categories.find(c => c.id === activePanel);
  const currentEnv = isInterior && (world?.environment ?? 'home') === 'home'
    ? 'home-interior'
    : (world?.environment ?? 'home');

  return (
    <div className="game-screen">
        <WorldCanvas
          environment={currentEnv}
          tier={tier}
          unlockedElements={world?.unlockedElements ?? []}
          categoryCounts={categoryCounts}
          onZoneClick={handleZoneClick}
          onNearZone={handleNearZone}
          onEnterExit={handleEnterExit}
          onPlayerMove={() => setActivePanel(prev => prev !== null ? null : prev)}
        />

      {/* ── Top-left HUD ─────────────────────────────────────────────── */}
      <div className="hud-tl">
        <div className="game-logo">
          <span className="game-logo-leaf">🌿</span>
          <span>LIVE, LAUGH, PLANT</span>
        </div>
        <div className="tier-badge-hud">
          <span className="tier-emoji">{tier.emoji}</span>
          <div>
            <div className="tier-name-hud">{tier.name.toUpperCase()}</div>
            <div className="tier-sub">TIER {tier.id} / 6</div>
          </div>
        </div>
      </div>

      {/* ── Top-right HUD ────────────────────────────────────────────── */}
      <div className="hud-tr">
        <div className="xp-hud">
          <div className="xp-hud-row">
            <span className="xp-label">XP</span>
            <span className="xp-val">{totalXp}</span>
            {nextTier && <span className="xp-next">/ {nextTier.minXp}</span>}
          </div>
          <div className="xp-track">
            <div className="xp-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="stats-hud">
          <div className="stat-pill">🔥{streak}D</div>
          <div className="stat-pill">🌱{co2Saved}KG</div>
          <div className="stat-pill">✅{actionsToday}</div>
        </div>
      </div>

      {/* ── Controls ─────────────────────────────────────────────────── */}
      <div className="controls-hint">
        <span>WASD MOVE</span>
        <span className="hint-sep">·</span>
        <span>E/CLICK ACT</span>
        {isInterior && <><span className="hint-sep">·</span><span>INSIDE HOME</span></>}
      </div>

      {/* ── Near-zone indicator ──────────────────────────────────────── */}
      {nearZone && nearZone !== 'door' && (
        <div className="near-zone-bar" style={{ '--zc': CAT_COLORS[nearZone] }}>
          <span>{actionsData.categories.find(c=>c.id===nearZone)?.emoji}</span>
          <span>PRESS <kbd>E</kbd> — {nearZone.toUpperCase()}</span>
        </div>
      )}

      {/* ── Action dock ──────────────────────────────────────────────── */}
      <div className="action-dock">
        <div className="dock-cat-row">
          {actionsData.categories.map(cat => (
            <button
              key={cat.id}
              className={`dock-btn ${activePanel===cat.id?'dock-btn--active':''}`}
              style={{ '--dc': cat.color }}
              onClick={() => setActivePanel(prev => prev === cat.id ? null : cat.id)}
            >
              <span className="dock-icon">{cat.emoji}</span>
              <span className="dock-label">{cat.name.slice(0,4).toUpperCase()}</span>
            </button>
          ))}
        </div>
        <div className="dock-nav-row">
          <Link href="/log"        className="dock-btn dock-btn--nav"><span className="dock-icon">📋</span><span className="dock-label">LOG</span></Link>
          <Link href="/scan"       className="dock-btn dock-btn--nav"><span className="dock-icon">📷</span><span className="dock-label">SCAN</span></Link>
          <Link href="/dashboard"  className="dock-btn dock-btn--nav"><span className="dock-icon">📊</span><span className="dock-label">STATS</span></Link>
          <Link href="/transport"  className="dock-btn dock-btn--nav"><span className="dock-icon">🚲</span><span className="dock-label">TRAVEL</span></Link>
          <Link href="/pollution"  className="dock-btn dock-btn--nav"><span className="dock-icon">🌫️</span><span className="dock-label">AIR</span></Link>
        </div>
      </div>

      {/* ── Action panel ─────────────────────────────────────────────── */}
      {activePanel && activeCatData && (
        <>
          <div className="panel-backdrop" onClick={() => setActivePanel(null)} />
          <div className="action-panel" style={{ '--pc': activeCatData.color, zIndex: 100 }}>
            <div className="panel-header">
              <span className="panel-icon">{activeCatData.emoji}</span>
              <div>
                <h2 className="panel-title">{activeCatData.name.toUpperCase()} ACTIONS</h2>
                <p className="panel-sub">Walk near a zone and log your eco deed</p>
              </div>
              <button className="panel-close" onClick={() => setActivePanel(null)}>✕</button>
            </div>
            <div className="panel-grid">
              {activeCatData.actions.map(action => (
                <button
                  key={action.id}
                  className={`panel-card ${logging[action.id] ? 'panel-card--logging' : ''}`}
                  style={{ '--ac': activeCatData.color }}
                  disabled={!!logging[action.id]}
                  onClick={() => { logAction(action.id); setActivePanel(null); }}
                >
                  <span className="panel-card-emoji">{activeCatData.emoji}</span>
                  <span className="panel-card-label">{action.label}</span>
                  <div className="panel-card-stats">
                    <span className="panel-card-xp">+{action.xp} XP</span>
                    <span className="panel-card-co2">−{action.co2}kg</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="panel-footer">
              <Link href="/log" className="panel-more-link" onClick={() => setActivePanel(null)}>
                ALL ACTIONS →
              </Link>
              <Link href="/transport" className="panel-more-link" onClick={() => setActivePanel(null)}>
                TRANSPORT CALC →
              </Link>
            </div>
          </div>
        </>
      )}

      {/* ── Toasts ───────────────────────────────────────────────────── */}
      <div className="toast-stack">
        {toasts.map(t => (
          <div key={t.id} className="xp-toast" style={{ '--tc': t.color }}>
            {t.msg}
          </div>
        ))}
      </div>

      {/* ── Celebration ──────────────────────────────────────────────── */}
      {celebration && (
        <div className="celebration-overlay" onClick={() => { setCelebration(null); fetchData(); }}>
          <div className="celebration-modal" onClick={e => e.stopPropagation()}>
            <div className="confetti-container">
              {Array.from({length:16},(_,i)=>(
                <div key={i} className="confetti-piece"
                  style={{
                    left:`${(i*23+7)%100}%`,
                    background:`hsl(${i*45},90%,60%)`,
                    animationDelay:`${i*0.08}s`,
                    width:`${4+i%4}px`, height:`${4+i%4}px`,
                  }}
                />
              ))}
            </div>
            <div className="celebration-tier-emoji">{celebration.emoji}</div>
            <div className="celebration-title">TIER UP!</div>
            <div className="celebration-tier-name">{celebration.name.toUpperCase()}</div>
            <p className="celebration-desc">{celebration.description}</p>
            <button className="btn-primary celebration-btn"
              onClick={() => { setCelebration(null); fetchData(); }}>
              EXPLORE NEW WORLD
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
