import { useEffect, useMemo, useState } from 'react';
import './App.css';
import LESSONS from './lessons.json';
import ClassSelector from './components/ClassSelector';
import MonthSelector from './components/MonthSelector';
import DaySelector from './components/DaySelector';
import LessonSlider from './components/LessonSlider';

const monthNumbers = Array.from({ length: 10 }, (_, index) => String(index + 1));
const dayNumbers = Array.from({ length: 20 }, (_, index) => String(index + 1));

function App() {
  const [selectedClass, setSelectedClass] = useState(Object.keys(LESSONS)[0]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showLessonPage, setShowLessonPage] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const classData = LESSONS[selectedClass];
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

  return (
    <div className="app-shell">
      {!showLessonPage && (
        <>
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
            <ClassSelector
              classes={Object.keys(LESSONS)}
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
    </div>
  );
}

export default App;
