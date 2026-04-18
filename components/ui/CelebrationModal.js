'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

// To use a Lottie animation: place celebration.json in /public/animations/
// and uncomment the import + Lottie usage below.
// import Lottie from 'lottie-react';
// import animData from '@/public/animations/celebration.json';

export default function CelebrationModal({ show, newTier, onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (show && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.5)' }
      );
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!show || !newTier) return null;

  return (
    <div className="celebration-overlay" onClick={onClose}>
      <div ref={modalRef} className="celebration-modal" onClick={e => e.stopPropagation()}>
        <div className="confetti-container">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="confetti-piece" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 0.5}s`,
              background: ['#10b981','#f59e0b','#3b82f6','#8b5cf6','#ec4899'][i % 5],
            }} />
          ))}
        </div>
        <div className="celebration-tier-emoji">{newTier.emoji}</div>
        <h2 className="celebration-title">Tier Up!</h2>
        <h3 className="celebration-tier-name">{newTier.name}</h3>
        <p className="celebration-desc">{newTier.description}</p>
        <button className="btn-primary" onClick={onClose}>Awesome! ✨</button>
      </div>
    </div>
  );
}
