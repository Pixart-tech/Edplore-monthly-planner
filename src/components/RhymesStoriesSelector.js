import React from 'react';

export default function RhymesStoriesSelector({
  title,
  items,
  selectedTitle,
  onSelect,
}) {
  return (
    <section className="panel panel--wide">
      <div className="panel-heading">
        <p className="eyebrow">Step 3</p>
        <h2>{title}</h2>
      </div>
      {items.length === 0 ? (
        <p className="empty-state">No items available for this class yet.</p>
      ) : (
        <div className="button-grid content-list">
          {items.map((item) => (
            <button
              key={item.title}
              type="button"
              className={`content-button ${selectedTitle === item.title ? 'active' : ''}`}
              onClick={() => onSelect(item)}
            >
              {item.title}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
