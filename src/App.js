import { useMemo, useState } from 'react';
import './App.css';

const LESSONS = {
  Nursery: {
    months: {
      '1': {
        days: {
          '1': {
            title: 'Colours Around Us',
            content: 'Explore primary colours through simple objects found at home.',
            video: 'https://www.youtube.com/embed/9QbC6VWxZl0',
            doc: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          },
          '2': {
            title: 'Sing Along Rhymes',
            content: 'Practice rhythm and actions with a familiar nursery rhyme.',
            video: 'https://www.youtube.com/embed/HY8k8rWfq5Y',
            doc: 'https://www.africau.edu/images/default/sample.pdf',
          },
          '5': {
            title: 'Shapes Scavenger Hunt',
            content: 'Look for circles, squares, and triangles around your room.',
            video: 'https://www.youtube.com/embed/zQEE6T8SDNk',
            doc: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          },
        },
      },
      '3': {
        days: {
          '1': {
            title: 'Outdoor Textures',
            content: 'Collect leaves and describe how each one feels.',
            video: 'https://www.youtube.com/embed/aqz-KE-bpKQ',
            doc: 'https://www.africau.edu/images/default/sample.pdf',
          },
          '4': {
            title: 'Story Corner',
            content: 'Listen to a short story and draw your favourite character.',
            video: 'https://www.youtube.com/embed/ONmCC6zQ0Xk',
            doc: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          },
        },
      },
    },
  },
  LKG: {
    months: {
      '2': {
        days: {
          '2': {
            title: 'Count and Match',
            content: 'Match numbers to the correct number of objects.',
            video: 'https://www.youtube.com/embed/Q4Tkx93dJio',
            doc: 'https://www.africau.edu/images/default/sample.pdf',
          },
          '7': {
            title: 'Letter Tracing',
            content: 'Practice tracing letters with proper strokes.',
            video: 'https://www.youtube.com/embed/kCo0c94hqdA',
            doc: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          },
        },
      },
    },
  },
  UKG: {
    months: {
      '5': {
        days: {
          '3': {
            title: 'Simple Sentences',
            content: 'Build short sentences using sight words.',
            video: 'https://www.youtube.com/embed/mzK0hoZ39eY',
            doc: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          },
        },
      },
    },
  },
};

const monthNumbers = Array.from({ length: 10 }, (_, index) => String(index + 1));
const dayNumbers = Array.from({ length: 20 }, (_, index) => String(index + 1));

function App() {
  const [selectedClass, setSelectedClass] = useState(Object.keys(LESSONS)[0]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  const classData = LESSONS[selectedClass];
  const monthData = selectedMonth ? classData?.months?.[selectedMonth] : null;
  const dayData = selectedDay && monthData ? monthData.days?.[selectedDay] : null;

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
                  Day {dayNumber}
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
                <iframe
                  src={dayData.video}
                  title={dayData.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
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
