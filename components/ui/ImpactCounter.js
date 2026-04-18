'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

export default function ImpactCounter({ value, label, unit = '', decimals = 1 }) {
  const [display, setDisplay] = useState('0');
  const obj = useRef({ val: 0 });

  useEffect(() => {
    gsap.to(obj.current, {
      val: value,
      duration: 1.5,
      ease: 'power2.out',
      onUpdate: () => setDisplay(obj.current.val.toFixed(decimals)),
    });
  }, [value]);

  return (
    <div className="impact-counter">
      <span className="impact-value">{display}</span>
      <span className="impact-unit">{unit}</span>
      <span className="impact-label">{label}</span>
    </div>
  );
}
