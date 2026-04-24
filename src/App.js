import { useEffect, useMemo, useRef, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import LESSONS from './lessons.json';
import RHYMES_AND_STORIES from './rhymes&stories.json';
import ClassSelector from './components/ClassSelector';
import ContentTypeSelector from './components/ContentTypeSelector';
import MonthSelector from './components/MonthSelector';
import DaySelector from './components/DaySelector';
import RhymesStoriesSelector from './components/RhymesStoriesSelector';
import LessonSlider from './components/LessonSlider';
import BooksAddPage from './components/BooksAddPage';

const monthNumbers = Array.from({ length: 10 }, (_, index) => String(index + 1));
const dayNumbers = Array.from({ length: 20 }, (_, index) => String(index + 1));
const SHARED_DISCLAIMER =
  'Disclaimer: Same topics will be repeated for each class. Kindly teach as per kids age.';

const cloneLessons = (value) => {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
};

const emptyRhymesAndStories = () => ({
  rhymes: [],
  stories: [],
});

const normalizeRhymesStoriesEntry = (entry) => {
  if (!entry || typeof entry !== 'object') {
    return emptyRhymesAndStories();
  }

  return {
    rhymes: Array.isArray(entry.rhymes) ? entry.rhymes : [],
    stories: Array.isArray(entry.stories) ? entry.stories : [],
  };
};

const sharedRhymesStoriesByClass = (() => {
  const source = RHYMES_AND_STORIES?.rhymes_and_stories;
  if (!source || typeof source !== 'object') {
    return {};
  }

  return Object.fromEntries(
    Object.entries(source).map(([className, entry]) => [
      className.toLowerCase(),
      normalizeRhymesStoriesEntry(entry),
    ])
  );
})();

const normalizeRhymesAndStories = (className, classData = {}) => {
  const fallback = sharedRhymesStoriesByClass[className?.toLowerCase?.()] || emptyRhymesAndStories();
  const provided = classData.rhymes_and_stories || {};

  return {
    rhymes:
      Array.isArray(provided.rhymes) && provided.rhymes.length > 0
        ? provided.rhymes
        : fallback.rhymes,
    stories:
      Array.isArray(provided.stories) && provided.stories.length > 0
        ? provided.stories
        : fallback.stories,
  };
};

const enrichLessonsData = (rawLessons = {}) =>
  Object.fromEntries(
    Object.entries(rawLessons).map(([className, classData]) => [
      className,
      {
        ...classData,
        rhymes_and_stories: normalizeRhymesAndStories(className, classData),
        months: classData?.months || {},
      },
    ])
  );

const normalizeTitleKey = (value) => value?.trim()?.toLowerCase() || '';

const buildReferenceLookup = (items = []) =>
  new Map(
    items
      .filter((item) => item?.title)
      .map((item) => [normalizeTitleKey(item.title), item])
  );

const buildLessonReferenceItems = (lesson, rhymeLookup, storyLookup) => {
  const items = [];
  const selectedRhyme = rhymeLookup.get(normalizeTitleKey(lesson?.selected_rhyme));
  const selectedStory = storyLookup.get(normalizeTitleKey(lesson?.selected_story));

  if (selectedRhyme) {
    items.push({ kind: 'Rhyme', ...selectedRhyme });
  }

  if (selectedStory) {
    items.push({ kind: 'Story', ...selectedStory });
  }

  return items;
};

const getYouTubeLink = (item) => {
  if (!item || typeof item !== 'object') {
    return '';
  }

  const candidates = [item.youtubeLink, item['youtube link'], item.youtube_link, item.link];
  const match = candidates.find((value) => typeof value === 'string' && value.trim());
  return match ? match.trim() : '';
};

const mapCircleItemToLesson = (item, typeLabel) => {
  const youtubeLink = getYouTubeLink(item);

  return {
    title: item.title,
    slider: typeLabel,
    content: item.content,
    video: item.video || '',
    audio: item.audio || '',
    image: item.image || '',
    youtubeLink,
    'youtube link': youtubeLink,
    time: '',
  };
};

function PlannerPage({ lessonsData }) {
  const classNames = Object.keys(lessonsData || {});
  const [selectedClass, setSelectedClass] = useState(classNames[0]);
  const [selectedView, setSelectedView] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedCircleItem, setSelectedCircleItem] = useState(null);
  const [showLessonPage, setShowLessonPage] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const daySelectorRef = useRef(null);

  const classData = lessonsData?.[selectedClass];
  const rhymesAndStories = classData?.rhymes_and_stories || emptyRhymesAndStories();
  const rhymeLookup = useMemo(
    () => buildReferenceLookup(rhymesAndStories.rhymes),
    [rhymesAndStories.rhymes]
  );
  const storyLookup = useMemo(
    () => buildReferenceLookup(rhymesAndStories.stories),
    [rhymesAndStories.stories]
  );
  const monthData = selectedMonth ? classData?.months?.[selectedMonth] : null;
  const dayData = selectedDay && monthData ? monthData.days?.[selectedDay] : null;

  const lessonsForDay = useMemo(() => {
    if (!dayData) return [];

    const baseLessons =
      Array.isArray(dayData.lessons) && dayData.lessons.length > 0 ? dayData.lessons : [dayData];

    return baseLessons.map((lesson) => ({
      ...lesson,
      referenceItems: buildLessonReferenceItems(lesson, rhymeLookup, storyLookup),
    }));
  }, [dayData, rhymeLookup, storyLookup]);

  const standaloneLessons = useMemo(() => {
    if (!selectedCircleItem) {
      return [];
    }

    return [
      mapCircleItemToLesson(
        selectedCircleItem,
        selectedView === 'stories' ? 'Stories' : 'Rhymes'
      ),
    ];
  }, [selectedCircleItem, selectedView]);

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
    setSelectedView(null);
    setSelectedMonth(null);
    setSelectedDay(null);
    setSelectedCircleItem(null);
    setShowLessonPage(false);
  };

  const handleViewSelect = (view) => {
    setSelectedView(view);
    setSelectedMonth(null);
    setSelectedDay(null);
    setSelectedCircleItem(null);
    setShowLessonPage(false);
  };

  const handleMonthSelect = (monthNumber) => {
    if (!availableMonths.has(monthNumber)) return;
    setSelectedMonth(monthNumber);
    setSelectedDay(null);
  };

  const handleDaySelect = (dayNumber) => {
    if (!availableDays.has(dayNumber)) return;
    setSelectedDay(dayNumber);
    setSelectedCircleItem(null);
    setShowLessonPage(true);
  };

  const handleCircleItemSelect = (item) => {
    setSelectedCircleItem(item);
    setSelectedDay(null);
    setShowLessonPage(true);
  };

  const handleCloseLessonPage = () => {
    setShowLessonPage(false);
    setCurrentSlide(0);
    setSelectedDay(null);
    setSelectedCircleItem(null);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) =>
      Math.min(prev + 1, (selectedCircleItem ? standaloneLessons : lessonsForDay).length - 1)
    );
  };

  useEffect(() => {
    setCurrentSlide(0);
  }, [lessonsForDay, standaloneLessons]);

  useEffect(() => {
    if (selectedView === 'months' && !dayData) {
      setShowLessonPage(false);
    }
    if (selectedView !== 'months' && !selectedCircleItem) {
      setShowLessonPage(false);
    }
  }, [dayData, selectedCircleItem, selectedView]);

  useEffect(() => {
    if (selectedView === 'months' && selectedMonth && daySelectorRef.current) {
      daySelectorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedMonth, selectedView]);

  useEffect(() => {
    if (showLessonPage && typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [showLessonPage]);

  useEffect(() => {
    if (classNames.length > 0 && !classNames.includes(selectedClass)) {
      setSelectedClass(classNames[0]);
      setSelectedView(null);
      setSelectedMonth(null);
      setSelectedDay(null);
      setSelectedCircleItem(null);
      setShowLessonPage(false);
    }
  }, [classNames, selectedClass]);

  const contentItems =
    selectedView === 'stories' ? rhymesAndStories.stories : rhymesAndStories.rhymes;
  const lessonsToDisplay = selectedCircleItem ? standaloneLessons : lessonsForDay;
  const contextTitle = selectedCircleItem
    ? `${selectedClass} - ${selectedView === 'stories' ? 'Stories' : 'Rhymes'}`
    : `${selectedClass} - Month ${selectedMonth} - Day ${selectedDay}`;
  const contextSubtitle = selectedCircleItem
    ? selectedCircleItem.title
    : '';

  return (
    <>
      {!showLessonPage && (
        <>
          <header className="app-header">
            <div>
              <p className="eyebrow">Edplore Monthly Planner</p>
              <p className="helper-text helper-text--left">
                Note - Rhymes and stories are customized. They will differ from school to school, so select the rhyme or story you want to teach.
              </p>
              <p className="helper-text helper-text--left">{SHARED_DISCLAIMER}</p>
            </div>
          </header>

          <main className="layout-grid">
            <ClassSelector
              classes={classNames}
              selectedClass={selectedClass}
              onSelect={handleClassSelect}
            />
            <ContentTypeSelector selectedView={selectedView} onSelect={handleViewSelect} />
            {selectedView === 'months' ? (
              <>
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
              </>
            ) : selectedView === 'rhymes' || selectedView === 'stories' ? (
              <RhymesStoriesSelector
                title={selectedView === 'stories' ? 'Stories' : 'Rhymes'}
                items={contentItems}
                selectedTitle={selectedCircleItem?.title || ''}
                onSelect={handleCircleItemSelect}
              />
            ) : null}
          </main>
        </>
      )}

      {showLessonPage && lessonsToDisplay.length > 0 && (
        <LessonSlider
          lessons={lessonsToDisplay}
          currentSlide={currentSlide}
          onPrevSlide={handlePrevSlide}
          onNextSlide={handleNextSlide}
          onClose={handleCloseLessonPage}
          selectedClass={selectedClass}
          selectedMonth={selectedMonth}
          selectedDay={selectedDay}
          contextTitle={contextTitle}
          contextSubtitle={contextSubtitle}
          disclaimerText={SHARED_DISCLAIMER}
        />
      )}
    </>
  );
}

function App() {
  const [lessonsData, setLessonsData] = useState(() => enrichLessonsData(cloneLessons(LESSONS)));
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
          setLessonsData(enrichLessonsData(data.lessons));
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
