import React from 'react';

const OPTIONS = [
  { key: 'months', label: 'Months' },
  { key: 'rhymes', label: 'Rhymes' },
  { key: 'stories', label: 'Stories' },
];

export default function ContentTypeSelector({ selectedView, onSelect }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <p className="eyebrow">Step 2</p>
        <h2>Choose what to view</h2>
      </div>
      <div className="button-grid">
        {OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            className={`pill-button ${selectedView === option.key ? 'active' : ''}`}
            onClick={() => onSelect(option.key)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </section>
  );
}
