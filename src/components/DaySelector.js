import React from 'react';

const DaySelector = React.forwardRef(function DaySelector(
  { dayNumbers, availableDays, selectedDay, onSelect },
  ref
) {
  return (
    <section ref={ref} className="panel">
      <div className="panel-heading">
        <p className="eyebrow">Step 3</p>
        <h2>Pick a day</h2>
      </div>
      <div className="button-grid days">
        {dayNumbers.map((dayNumber) => {
          const isAvailable = availableDays.has(dayNumber);
          return (
            <button
              key={dayNumber}
              className={`day-button ${selectedDay === dayNumber ? 'active' : ''}`}
              disabled={!isAvailable}
              onClick={() => onSelect(dayNumber)}
              aria-label={`Day ${dayNumber}${isAvailable ? '' : ' locked'}`}
            >
              <span>Day {dayNumber}</span>
              {!isAvailable && <span className="lock">🔒</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
});

export default DaySelector;
