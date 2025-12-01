import React from 'react';

export default function ClassSelector({ classes, selectedClass, onSelect }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <p className="eyebrow">Step 1</p>
        <h2>Choose a class</h2>
      </div>
      <div className="button-grid">
        {classes.map((className) => (
          <button
            key={className}
            className={`pill-button ${selectedClass === className ? 'active' : ''}`}
            onClick={() => onSelect(className)}
          >
            {className}
          </button>
        ))}
      </div>
    </section>
  );
}
