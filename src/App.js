import { useEffect, useMemo, useRef, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import LESSONS from './lessons.json';
import ClassSelector from './components/ClassSelector';
import MonthSelector from './components/MonthSelector';
import DaySelector from './components/DaySelector';
import LessonSlider from './components/LessonSlider';
import BooksAddPage from './components/BooksAddPage';

const monthNumbers = Array.from({ length: 10 }, (_, index) => String(index + 1));
const dayNumbers = Array.from({ length: 20 }, (_, index) => String(index + 1));

const cloneLessons = (value) => {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
};

function PlannerPage({ lessonsData }) {
  const classNames = Object.keys(lessonsData || {});
  const [selectedClass, setSelectedClass] = useState(classNames[0]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showLessonPage, setShowLessonPage] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const daySelectorRef = useRef(null);

  const classData = lessonsData?.[selectedClass];
  const monthData = selectedMonth ? classData?.months?.[selectedMonth] : null;
  const dayData = selectedDay && monthData ? monthData.days?.[selectedDay] : null;

  const lessonsForDay = useMemo(() => {
    if (!dayData) return [];
    if (Array.isArray(dayData.lessons) && dayData.lessons.length > 0) {
      return dayData.lessons;
    }
    return [dayData];
  }, [dayData]);

  const availableMonths = useMemo(
    () => new Set(Object.keys(classData?.months || {})),
    [classData?.months]
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
    setShowLessonPage(true);
  };

  const handleCloseLessonPage = () => {
    setShowLessonPage(false);
    setCurrentSlide(0);
    setSelectedDay(null);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => Math.min(prev + 1, lessonsForDay.length - 1));
  };

  useEffect(() => {
    setCurrentSlide(0);
  }, [lessonsForDay]);

  useEffect(() => {
    if (!dayData) {
      setShowLessonPage(false);
    }
  }, [dayData]);

  useEffect(() => {
    if (selectedMonth && daySelectorRef.current) {
      daySelectorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedMonth]);

  useEffect(() => {
    if (showLessonPage && typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [showLessonPage]);

  useEffect(() => {
    if (classNames.length > 0 && !classNames.includes(selectedClass)) {
      setSelectedClass(classNames[0]);
      setSelectedMonth(null);
      setSelectedDay(null);
      setShowLessonPage(false);
    }
  }, [classNames, selectedClass]);

  return (
    <>
      {!showLessonPage && (
        <>
          <header className="app-header">
            <div>
              <p className="eyebrow">Edplore Monthly Planner</p>
              <h1>Pick a class, month, and day to view lessons</h1>
            </div>
            <p className="helper-text">
              Months and Days only unlock when have available content.
            </p>
          </header>

          <main className="layout-grid">
            <ClassSelector
              classes={classNames}
              selectedClass={selectedClass}
              onSelect={handleClassSelect}
            />
            <MonthSelector
              monthNumbers={monthNumbers}
              availableMonths={availableMonths}
              selectedMonth={selectedMonth}
              onSelect={handleMonthSelect}
            />
            <DaySelector
              dayNumbers={dayNumbers}
              availableDays={availableDays}
              selectedDay={selectedDay}
              onSelect={handleDaySelect}
              ref={daySelectorRef}
            />
          </main>
        </>
      )}

      {showLessonPage && lessonsForDay.length > 0 && (
        <LessonSlider
          lessons={lessonsForDay}
          currentSlide={currentSlide}
          onPrevSlide={handlePrevSlide}
          onNextSlide={handleNextSlide}
          onClose={handleCloseLessonPage}
          selectedClass={selectedClass}
          selectedMonth={selectedMonth}
          selectedDay={selectedDay}
        />
      )}
    </>
  );
}

function App() {
  const [lessonsData, setLessonsData] = useState(() => cloneLessons(LESSONS));
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isMounted = true;

    fetch('/api/lessons')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load lessons');
        }
        return res.json();
      })
      .then((data) => {
        if (isMounted && data?.lessons) {
          setLessonsData(data.lessons);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoadError('Using bundled lessons.json (backend not reachable).');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<PlannerPage lessonsData={lessonsData} />} />
        <Route
          path="/books/add"
          element={
            <BooksAddPage
              lessonsData={lessonsData}
              setLessonsData={setLessonsData}
              loadError={loadError}
            />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
