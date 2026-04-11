import React from 'react';

const formatTimeValue = (time) => {
  if (typeof time !== 'string') {
    return '';
  }

  return time
    .trim()
    .replace(/\bminutes\b/gi, 'Mins')
    .replace(/\bminute\b/gi, 'Min');
};

const Time = ({ time, label = 'Time Duration' }) => {
  const formattedTime = formatTimeValue(time);

  return (
    <div className="time">
      <p>{label} {formattedTime}</p>
    </div>
  );
};

export default Time;
