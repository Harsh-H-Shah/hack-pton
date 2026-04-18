'use client';
import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';

export default function ActionCard({ action, category, onLog, justLogged }) {
  const cardRef = useRef(null);
  const popRef = useRef(null);
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    if (justLogged && cardRef.current && popRef.current) {
      gsap.fromTo(
        cardRef.current,
        { boxShadow: '0 0 0 0 rgba(16,185,129,0)' },
        { boxShadow: '0 0 24px 6px rgba(16,185,129,0.5)', duration: 0.25, yoyo: true, repeat: 1 }
      );
      gsap.fromTo(
        popRef.current,
        { y: 0, opacity: 1, display: 'block' },
        { y: -40, opacity: 0, duration: 0.7, ease: 'power2.out', onComplete: () => {
          gsap.set(popRef.current, { display: 'none' });
        }}
      );
    }
  }, [justLogged]);

  const handleTap = async () => {
    if (logging) return;
    setLogging(true);
    await onLog(action.id);
    setLogging(false);
  };

  return (
    <button
      ref={cardRef}
      className={`action-card ${logging ? 'action-card--logging' : ''}`}
      onClick={handleTap}
      disabled={logging}
    >
      <span className="action-card-emoji">{category.emoji}</span>
      <span className="action-card-label">{action.label}</span>
      <span className="action-card-xp">+{action.xp} XP</span>
      <span ref={popRef} className="xp-pop" style={{ display: 'none' }}>
        +{action.xp} ✨
      </span>
    </button>
  );
}
