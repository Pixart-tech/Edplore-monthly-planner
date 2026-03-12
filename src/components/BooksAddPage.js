import { useEffect, useMemo, useState } from 'react';
import LESSONS from '../lessons.json';
import { buildBookCatalog } from '../utils/bookCatalog';

const monthNumbers = Array.from({ length: 10 }, (_, index) => String(index + 1));
const dayNumbers = Array.from({ length: 20 }, (_, index) => String(index + 1));

const cloneLessons = (value) => {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
};

const normalizeResourceFlow = (resourceFlow = []) =>
  resourceFlow
    .filter(Boolean)
    .map((item) => ({
      resource: item.resource ?? '',
      label: item.label ?? '',
      type: item.type ?? '',
      path: item.path ?? '',
      text: item.text ?? '',
    }));

const isTypeMatch = (value, needle) => value.toLowerCase().includes(needle);

const isYouTubeResource = (item) => isTypeMatch(item.type, 'youtube');
const isVideoResource = (item) =>
  isTypeMatch(item.type, 'video') && !isYouTubeResource(item);
const isImageResource = (item) => isTypeMatch(item.type, 'image');
const isAudioResource = (item) => isTypeMatch(item.type, 'audio');
const isAnimationResource = (item) => isTypeMatch(item.type, 'animation');
const isImageAudioResource = (item) =>
  item.type.toLowerCase().replace(/\s+/g, '') === 'image+audio';

const buildLessonMedia = (resources) => {
  const primaryVideo = resources.find(isVideoResource) ?? null;
  const primaryImage = resources.find(isImageResource) ?? null;

  const traceCandidate = resources.find(
    (item) =>
      isAnimationResource(item) ||
      isTypeMatch(item.resource, 'strokes') ||
      isTypeMatch(item.resource, 'trace')
  );
  const popCandidate = resources.find(isYouTubeResource);
  const audioCandidate = resources.find(isAudioResource);
  const imageAudioCandidate = resources.find(isImageAudioResource);

  return {
    video: primaryVideo?.path ?? '',
    image: primaryImage?.path ?? '',
    trace: traceCandidate?.path
      ? { title: traceCandidate.label || 'Trace', content: traceCandidate.path }
      : null,
    popvideo: popCandidate?.path
      ? { title: 'Youtube video', content: popCandidate.path }
      : null,
    audio: audioCandidate?.path || audioCandidate?.text
      ? {
          title: audioCandidate.label || 'Audio',
          content: audioCandidate.path || audioCandidate.text,
        }
      : null,
    audioimage: imageAudioCandidate?.path || imageAudioCandidate?.text
      ? {
          title: 'Image + audio',
          content: imageAudioCandidate.path || imageAudioCandidate.text,
        }
      : null,
  };
};

const buildTopicContent = (resources = []) => {
  const texts = resources.map((item) => item.text).filter(Boolean);
  return texts.join('\n');
};

const buildPageReference = (book, topic, subTopic) => {
  const pageStart = subTopic?.page_start ?? topic?.page_start;
  const pageEnd = subTopic?.page_end ?? topic?.page_end;

  if (!pageStart && !pageEnd) {
    return '';
  }

  const pageRange = `${pageStart ?? ''}-${pageEnd ?? ''}`.replace(/-$/, '');
  return `Please refer pages ${pageRange} in ${book}.`;
};

export default function BooksAddPage(props) {
  const fallbackCatalog = useMemo(() => buildBookCatalog(), []);
  const [catalog, setCatalog] = useState(fallbackCatalog);
  const classNames = useMemo(() => Object.keys(catalog).sort(), [catalog]);
  const [selectedClass, setSelectedClass] = useState(classNames[0] ?? '');
  const [selectedBookKey, setSelectedBookKey] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [selectedSubTopicId, setSelectedSubTopicId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonVideo, setLessonVideo] = useState('');
  const [lessonDoc, setLessonDoc] = useState('');
  const [lessonImage, setLessonImage] = useState('');
  const [lessonTime, setLessonTime] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const { lessonsData, setLessonsData, loadError } = props;

  const booksForClass = catalog[selectedClass] ?? [];
  const selectedBook =
    booksForClass.find((book) => book.key === selectedBookKey) ?? booksForClass[0];
  const topicsForBook = selectedBook?.topics ?? [];
  const selectedTopic =
    topicsForBook.find((topic) => topic.topic_id === selectedTopicId) ?? topicsForBook[0];
  const subTopicsForTopic = selectedTopic?.sub_topics ?? [];
  const selectedSubTopic =
    subTopicsForTopic.find((sub) => sub.sub_topic_id === selectedSubTopicId) ?? null;
  const resourceSource = selectedSubTopic || selectedTopic;
  const resourceItems = useMemo(
    () => normalizeResourceFlow(resourceSource?.resource_flow),
    [resourceSource]
  );
  const lessonMedia = useMemo(() => buildLessonMedia(resourceItems), [resourceItems]);
  const pageReference = useMemo(
    () => buildPageReference(selectedBook?.book, selectedTopic, selectedSubTopic),
    [selectedBook, selectedTopic, selectedSubTopic]
  );

  useEffect(() => {
    if (classNames.length > 0 && !classNames.includes(selectedClass)) {
      setSelectedClass(classNames[0]);
    }
  }, [classNames, selectedClass]);

  useEffect(() => {
    let isMounted = true;

    fetch('/api/books/catalog')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load catalog');
        }
        return res.json();
      })
      .then((data) => {
        if (isMounted && data?.catalog) {
          setCatalog(data.catalog);
        }
      })
      .catch(() => {
        if (isMounted) {
          setStatusMessage('Using bundled catalog (backend not reachable).');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setSelectedBookKey(booksForClass[0]?.key ?? '');
  }, [selectedClass, booksForClass]);

  useEffect(() => {
    setSelectedTopicId(topicsForBook[0]?.topic_id ?? '');
  }, [selectedBookKey, topicsForBook]);

  useEffect(() => {
    setSelectedSubTopicId('');
  }, [selectedTopicId]);

  useEffect(() => {
    if (!selectedBook || !selectedTopic) {
      return;
    }
    const title = selectedSubTopic?.title || selectedTopic.title || '';
    setLessonTitle(title);
    setLessonContent(buildTopicContent(resourceItems));
    setLessonTime('20 minutes');
    setLessonVideo(lessonMedia.video);
    setLessonImage(lessonMedia.image);
    setLessonDoc(
      resourceItems.find(
        (item) => isTypeMatch(item.type, 'pdf') || item.path.toLowerCase().endsWith('.pdf')
      )?.path ?? ''
    );
  }, [selectedBook, selectedTopic, selectedSubTopic, resourceItems]);

  const currentDayLessons =
    lessonsData?.[selectedClass]?.months?.[selectedMonth]?.days?.[selectedDay]?.lessons ??
    [];
  const isDayFull =
    selectedMonth && selectedDay && currentDayLessons.length >= 6;

  const handleAddLesson = () => {
    if (!selectedClass || !selectedBook || !selectedTopic || !selectedMonth || !selectedDay) {
      setStatusMessage('Select class, book, topic, month, and day before adding.');
      return;
    }
    if (currentDayLessons.length >= 6) {
      setStatusMessage('This day already has 6 lessons.');
      return;
    }

    const newLesson = {
      title: lessonTitle || selectedSubTopic?.title || selectedTopic.title || selectedBook.book,
      content: lessonContent || buildTopicContent(resourceItems),
      video: lessonVideo.trim(),
      doc: lessonDoc.trim(),
      image: lessonImage.trim(),
      time: lessonTime.trim() || '20 minutes',
    };
    if (lessonMedia.trace) {
      newLesson.trace = lessonMedia.trace;
    }
    if (lessonMedia.popvideo) {
      newLesson.popvideo = lessonMedia.popvideo;
    }
    if (lessonMedia.audio) {
      newLesson.audio = lessonMedia.audio;
    }
    if (lessonMedia.audioimage) {
      newLesson.audioimage = lessonMedia.audioimage;
    }

    setStatusMessage('Saving to lessons.json...');

    fetch('/books/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        className: selectedClass,
        month: selectedMonth,
        day: selectedDay,
        lesson: newLesson,
      }),
    })
      .then(async (res) => {
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(payload?.error || 'Failed to save');
        }
        return payload;
      })
      .then((data) => {
        if (data?.lessons) {
          setLessonsData(data.lessons);
        }
        setStatusMessage('Saved directly to lessons.json.');
      })
      .catch((err) => {
        setStatusMessage(err?.message || 'Save failed. Backend not reachable.');
      });
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(lessonsData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'lessons.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setLessonsData(cloneLessons(LESSONS));
    setStatusMessage('Lessons reset to the bundled lessons.json.');
  };

  return (
    <div className="books-page">
      <header className="app-header">
        <div>
          <p className="eyebrow">Books Mapping</p>
          <h1>Map book topics to a day planner</h1>
        </div>
        <p className="helper-text">
          Select a class, book, and topic, then pick the month and day to add it.
        </p>
      </header>
      {loadError && <p className="status-pill">{loadError}</p>}

      <div className="books-grid">
        <section className="panel books-panel">
          <div className="panel-heading">
            <h2>Catalog</h2>
            <p className="helper-text helper-text--left">
              Books are loaded from `src/{'{class}'}/` JSON files (key `book`).
            </p>
          </div>

          <div className="form-grid">
            <label className="form-field">
              <span>Class</span>
              <select
                className="input"
                value={selectedClass}
                onChange={(event) => setSelectedClass(event.target.value)}
              >
                {classNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Book</span>
              <select
                className="input"
                value={selectedBook?.key ?? ''}
                onChange={(event) => setSelectedBookKey(event.target.value)}
              >
                {booksForClass.map((book) => (
                  <option key={book.key} value={book.key}>
                    {book.book}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field form-field--full">
              <span>Topic</span>
              <select
                className="input"
                value={selectedTopic?.topic_id ?? ''}
                onChange={(event) => setSelectedTopicId(event.target.value)}
              >
                {topicsForBook.map((topic) => (
                  <option key={topic.topic_id} value={topic.topic_id}>
                    {topic.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field form-field--full">
              <span>Sub topic</span>
              <select
                className="input"
                value={selectedSubTopic?.sub_topic_id ?? ''}
                onChange={(event) => setSelectedSubTopicId(event.target.value)}
              >
                <option value="">No sub topic</option>
                {subTopicsForTopic.map((sub) => (
                  <option key={sub.sub_topic_id} value={sub.sub_topic_id}>
                    {sub.title}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {selectedBook && (
            <div className="topic-preview">
              <p className="topic-preview__title">Select topic - sub topic</p>
              <p className="topic-preview__selection">
                {(selectedTopic?.title || 'Select topic')} -{' '}
                {(selectedSubTopic?.title || 'No sub topic')}
              </p>
            </div>
          )}
        </section>

        <section className="panel books-panel">
          <div className="panel-heading">
            <h2>Planner Selection</h2>
          </div>

          <div className="form-grid">
            <label className="form-field">
              <span>Month</span>
              <select
                className="input"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                disabled={!selectedTopic}
              >
                <option value="">Select month</option>
                {monthNumbers.map((month) => (
                  <option key={month} value={month}>
                    Month {month}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Day</span>
              <select
                className="input"
                value={selectedDay}
                onChange={(event) => setSelectedDay(event.target.value)}
                disabled={!selectedTopic || !selectedMonth}
              >
                <option value="">Select day</option>
                {dayNumbers.map((day) => (
                  <option key={day} value={day}>
                    Day {day}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="lesson-preview">
            <h3>Lessons for this day</h3>
            {currentDayLessons.length === 0 ? (
              <p className="empty-state">No lessons yet.</p>
            ) : (
              <div className="lesson-list">
                {currentDayLessons.map((lesson, index) => (
                  <div key={`${lesson.title}-${index}`} className="lesson-list__item">
                    <p className="lesson-list__title">{lesson.title}</p>
                    <p className="lesson-list__meta">
                      {lesson.time || 'No time set'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      

      <section className="panel books-panel">
        <div className="panel-heading">
          <h2>Lesson Details</h2>
        </div>

        <div className="lesson-detail-header">
          <div className="lesson-detail-title">
            <p className="lesson-detail-label">Title</p>
            <p className="lesson-detail-value">{lessonTitle || '-'}</p>
          </div>
          <div className="lesson-detail-time">
            <p className="lesson-detail-label">Time</p>
            <p className="lesson-detail-value">{lessonTime || '20 minutes'}</p>
            {pageReference && (
              <p className="lesson-detail-reference">{pageReference}</p>
            )}
          </div>
        </div>

        <div className="form-grid">
          <label className="form-field form-field--full">
            <span>Content (Selected Topic/Sub Topic Text)</span>
            <textarea
              className="input textarea"
              rows={6}
              value={lessonContent}
              onChange={(event) => setLessonContent(event.target.value)}
            />
          </label>

          {lessonVideo && (
            <label className="form-field">
              <span>Video Path</span>
              <input
                className="input"
                value={lessonVideo}
                readOnly
              />
            </label>
          )}

          {lessonDoc && (
            <label className="form-field">
              <span>Doc Path</span>
              <input
                className="input"
                value={lessonDoc}
                readOnly
              />
            </label>
          )}

          {lessonImage && (
            <label className="form-field">
              <span>Image Path</span>
              <input
                className="input"
                value={lessonImage}
                readOnly
              />
            </label>
          )}

          {lessonMedia.audio?.content && (
            <label className="form-field">
              <span>Audio</span>
              <input
                className="input"
                value={lessonMedia.audio?.content ?? ''}
                readOnly
              />
            </label>
          )}

          {lessonMedia.audioimage?.content && (
            <label className="form-field">
              <span>Image + Audio</span>
              <input
                className="input"
                value={lessonMedia.audioimage?.content ?? ''}
                readOnly
              />
            </label>
          )}
        </div>

        <div className="form-grid">
          {lessonMedia.trace?.content && (
            <label className="form-field">
              <span>Trace Path</span>
              <input
                className="input"
                value={lessonMedia.trace?.content ?? ''}
                readOnly
              />
            </label>
          )}

          {lessonMedia.popvideo?.content && (
            <label className="form-field">
              <span>Youtube Link</span>
              <input
                className="input"
                value={lessonMedia.popvideo?.content ?? ''}
                readOnly
              />
            </label>
          )}
        </div>

        <div className="action-row">
          <button
            className="pill-button"
            type="button"
            onClick={handleAddLesson}
            disabled={isDayFull}
          >
            Add to lessons.json
          </button>
          <button className="text-button" type="button" onClick={handleExport}>
            Export lessons.json
          </button>
          <button className="text-button" type="button" onClick={handleReset}>
            Reset to bundled lessons.json
          </button>
          {statusMessage && <span className="status-pill">{statusMessage}</span>}
        </div>
      </section>
    </div>
  );
}
