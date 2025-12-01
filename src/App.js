import { useEffect, useMemo, useState } from 'react';
import './App.css';
import LESSONS from './lessons.json';

const monthNumbers = Array.from({ length: 10 }, (_, index) => String(index + 1));
const dayNumbers = Array.from({ length: 20 }, (_, index) => String(index + 1));

function App() {
  const [selectedClass, setSelectedClass] = useState(Object.keys(LESSONS)[0]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  const classData = LESSONS[selectedClass];
  const monthData = selectedMonth ? classData?.months?.[selectedMonth] : null;
  const dayData = selectedDay && monthData ? monthData.days?.[selectedDay] : null;
  const [previewRequested, setPreviewRequested] = useState(false);
  const [previewSuccess, setPreviewSuccess] = useState(false);

  const availableMonths = useMemo(
    () => new Set(Object.keys(classData.months || {})),
    [classData.months]
  );

  const availableDays = useMemo(
    () => (monthData ? new Set(Object.keys(monthData.days || {})) : new Set()),
    [monthData]
  );

  const handleClassSelect = (className) => {
    setSelectedClass(className);
    setSelectedMonth(null);
    setSelectedDay(null);
  };

  const handleMonthSelect = (monthNumber) => {
    if (!availableMonths.has(monthNumber)) return;
    setSelectedMonth(monthNumber);
    setSelectedDay(null);
  };

  const handleDaySelect = (dayNumber) => {
    if (!availableDays.has(dayNumber)) return;
    setSelectedDay(dayNumber);
  };

  useEffect(() => {
    setPreviewRequested(false);
    setPreviewSuccess(false);
  }, [dayData]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Edplore Monthly Planner</p>
          <h1>Pick a class, month, and day to view lessons</h1>
        </div>
        <p className="helper-text">
          Locked months show a 🔒 icon. Days only unlock when a class and month have
          available content.
        </p>
      </header>

      <main className="layout-grid">
        <section className="panel">
          <div className="panel-heading">
            <p className="eyebrow">Step 1</p>
            <h2>Choose a class</h2>
          </div>
          <div className="button-grid">
            {Object.keys(LESSONS).map((className) => (
              <button
                key={className}
                className={`pill-button ${selectedClass === className ? 'active' : ''}`}
                onClick={() => handleClassSelect(className)}
              >
                {className}
              </button>
            ))}
          </div>
        </section>

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
                  className={`month-button ${
                    selectedMonth === monthNumber ? 'active' : ''
                  } ${hasMonth ? '' : 'locked'}`}
                  disabled={!hasMonth}
                  onClick={() => handleMonthSelect(monthNumber)}
                >
                  <span>Month {monthNumber}</span>
                  {!hasMonth && <span className="lock">🔒</span>}
                </button>
              );
            })}
          </div>
        </section>

        <section className="panel">
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
                onClick={() => handleDaySelect(dayNumber)}
                aria-label={`Day ${dayNumber}${isAvailable ? '' : ' locked'}`}
              >
                <span>Day {dayNumber}</span>
                {!isAvailable && <span className="lock">🔒</span>}
              </button>
            );
          })}
        </div>
        </section>

        <section className="panel lesson-panel">
          <div className="panel-heading">
            <p className="eyebrow">Step 4</p>
            <h2>Lesson details</h2>
          </div>
          {dayData ? (
            <div className="lesson-card">
              <header className="lesson-header">
                <div>
                  <p className="eyebrow">
                    {selectedClass} · Month {selectedMonth} · Day {selectedDay}
                  </p>
                  <h3>{dayData.title}</h3>
                </div>
                <a
                  className="doc-button"
                  href={dayData.doc}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open PDF
                </a>
              </header>
              <p className="lesson-body">{dayData.content}</p>
              <div className="video-frame">
                {previewRequested && (
                  <iframe
                    src={dayData.video}
                    title={dayData.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onLoad={() => setPreviewSuccess(true)}
                    onError={() => setPreviewSuccess(false)}
                  />
                )}
                <div
                  className={`video-placeholder ${previewSuccess ? 'video-placeholder--hidden' : ''}`}
                >
                  <p>The video preview is blocked in this environment.</p>
                  <div className="video-placeholder__actions">
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => setPreviewRequested(true)}
                      disabled={previewRequested}
                    >
                      {previewRequested ? 'Retry the inline preview' : 'Try the inline preview'}
                    </button>
                    <a
                      href={dayData.video.replace('/embed/', '/watch?v=')}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Watch on YouTube
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>Select an available class, month, and day to see lesson content.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
