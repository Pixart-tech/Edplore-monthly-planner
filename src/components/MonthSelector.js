import React from 'react';

export default function MonthSelector({
  monthNumbers,
  availableMonths,
  selectedMonth,
  onSelect,
}) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <p className="eyebrow">Step 2</p>
        <h2>Select a month</h2>
      </div>
      <div className="button-grid months">
        {monthNumbers.map((monthNumber) => {
          const hasMonth = availableMonths.has(monthNumber);
          return (
            <button
              key={monthNumber}
              className={`month-button ${selectedMonth === monthNumber ? 'active' : ''} ${
                hasMonth ? '' : 'locked'
              }`}
              disabled={!hasMonth}
              onClick={() => onSelect(monthNumber)}
            >
              <span>Month {monthNumber}</span>
              {!hasMonth && <span className="lock">🔒</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}
