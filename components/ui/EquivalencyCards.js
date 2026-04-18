'use client';
import ImpactCounter from './ImpactCounter';

const CARDS = [
  { key: 'treesPlanted',  icon: '🌳', label: 'Trees Planted',     unit: '',      decimals: 1 },
  { key: 'carMilesSaved', icon: '🚗', label: 'Car Miles Avoided', unit: ' mi',   decimals: 0 },
  { key: 'phoneCharges',  icon: '📱', label: 'Phones Charged',    unit: '',      decimals: 0 },
  { key: 'flightsOffset', icon: '✈️', label: 'Flights Offset',    unit: '',      decimals: 2 },
];

export default function EquivalencyCards({ equivalencies }) {
  if (!equivalencies) return null;
  return (
    <div className="equivalency-grid">
      {CARDS.map(c => (
        <div key={c.key} className="equivalency-card">
          <span className="eq-icon">{c.icon}</span>
          <ImpactCounter value={equivalencies[c.key]} label={c.label} unit={c.unit} decimals={c.decimals} />
        </div>
      ))}
    </div>
  );
}
