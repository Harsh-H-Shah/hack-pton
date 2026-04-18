'use client';
import { useState } from 'react';
import ActionCard from './ActionCard';

export default function ActionGrid({ categories, onLogAction, loggedState = {} }) {
  const [activeTab, setActiveTab] = useState(categories[0]?.id ?? '');
  const activeCategory = categories.find(c => c.id === activeTab);

  return (
    <div className="action-grid">
      <div className="action-tabs">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`action-tab ${activeTab === cat.id ? 'action-tab--active' : ''}`}
            onClick={() => setActiveTab(cat.id)}
            style={{ '--tab-color': cat.color }}
          >
            {cat.emoji} {cat.name}
          </button>
        ))}
      </div>
      <div className="action-cards-grid">
        {activeCategory?.actions.map(action => (
          <ActionCard
            key={action.id}
            action={action}
            category={activeCategory}
            onLog={onLogAction}
            justLogged={loggedState[action.id] ?? false}
          />
        ))}
      </div>
    </div>
  );
}
