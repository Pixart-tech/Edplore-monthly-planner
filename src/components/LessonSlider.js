import React, { useEffect, useMemo, useState } from 'react';
import PdfButton from './PdfButton';
import VideoPreview from './VideoPreview';
import FormattedContent from './FormattedContent';
import Time from './Time';
import TraceLetter, { TRACE_LETTER_KEYS } from './TraceLetter';
import PopVideoPlayer from './PopVideoPlayer';

function LessonMedia({ lesson, shouldShowControls }) {
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoError, setVideoError] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const lessonImage = lesson?.image;

  const imageAssetPaths = useMemo(() => {
    const image = lessonImage;

    if (!image) {
      return [];
    }

    const normalizePath = (value) => {
      if (typeof value !== 'string') {
        return '';
      }
      return value.trim();
    };

    if (typeof image === 'string') {
      return [normalizePath(image)].filter(Boolean);
    }

    if (Array.isArray(image)) {
      return image.map(normalizePath).filter(Boolean);
    }

    if (typeof image === 'object') {
      return Object.entries(image)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([, value]) => normalizePath(value))
        .filter(Boolean);
    }

    return [];
  }, [lessonImage]);

  const hasImage = imageAssetPaths.length > 0;
  const hasVideo = Boolean(lesson.video);
  const shouldLoadVideo = hasVideo && shouldShowControls;
  const imageAlt = `${lesson.title ?? 'Lesson'} illustration`;
  const activeImagePath = imageAssetPaths[activeImageIndex];

  useEffect(() => {
    if (!hasImage) {
      setActiveImageIndex(0);
      return;
    }

    setActiveImageIndex((prev) =>
      prev < imageAssetPaths.length ? prev : 0
    );
  }, [hasImage, imageAssetPaths.length]);

  const renderImageSelectors = (isSmall = false) => {
    if (imageAssetPaths.length <= 1 || isSmall) {
      return null;
    }

    return (
      <div className="lesson-slide__image-tabs">
        {imageAssetPaths.map((_, index) => (
          <button
            type="button"
            key={`image-tab-${index}`}
            className={`lesson-slide__image-tab${
              index === activeImageIndex ? ' lesson-slide__image-tab--active' : ''
            }`}
            onClick={() => setActiveImageIndex(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    );
  };

  const renderImage = (extraClass = '', isSmall = false) => {
    if (!hasImage) {
      return null;
    }

    const className = ['lesson-slide__image', extraClass].filter(Boolean).join(' ');

    return (
      <div className={className}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={imageAlt}
            className={isSmall ? 'lesson-slide__image--small' : undefined}
          />
        ) : (
          <p className="lesson-slide__image-placeholder">
            {imageError || 'Loading illustration...'}
          </p>
        )}
        {renderImageSelectors(isSmall)}
      </div>
    );
  };

  useEffect(() => {
    setVideoUrl(null);
    setVideoError(null);

    if (shouldLoadVideo) {
      // CRA requires a static path prefix for dynamic imports.
      // The paths in lessons.json now include assets/, matching src/assets/Videos/...
      // We are in src/components, so ../${lesson.video} resolves to src/assets/Videos/...
      import(`../${lesson.video}`)
        .then((video) => {
          setVideoUrl(video.default);
        })
        .catch((err) => {
          console.error('Failed to load video:', err);
          setVideoError('Could not load video.');
        });
    }
  }, [lesson.video, shouldLoadVideo]);

  useEffect(() => {
    setImageUrl(null);
    setImageError(null);

    if (!hasImage || !activeImagePath) {
      return;
    }

    import(`../${activeImagePath}`)
      .then((image) => {
        setImageUrl(image.default);
      })
      .catch((err) => {
        console.error('Failed to load image:', err);
        setImageError('Could not load illustration.');
      });
  }, [hasImage, activeImagePath]);

  if (!hasVideo && !hasImage) {
    return null;
  }

  const mediaClassNames = [
    'lesson-slide__media',
    hasVideo && hasImage ? 'lesson-slide__media--has-both' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={mediaClassNames}>
      {hasVideo && (
        <VideoPreview
          videoUrl={videoUrl}
          title={lesson.title}
          autoPlay={shouldShowControls}
          idleMessage={videoError || 'Navigate to this lesson to load the preview.'}
        />
      )}
      {hasImage &&
        renderImage(
          hasVideo ? 'lesson-slide__image--inline' : '',
          Boolean(hasVideo),
        )}
    </div>
  );
}

const TRACE_LETTER_SET = new Set(TRACE_LETTER_KEYS);

export default function LessonSlider({
  lessons,
  currentSlide,
  onPrevSlide,
  onNextSlide,
  onClose,
  selectedClass,
  selectedMonth,
  selectedDay,
}) {
  const [popupPayload, setPopupPayload] = useState(null);

  const closePopup = () => {
    setPopupPayload(null);
  };

  useEffect(() => {
    if (!popupPayload) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setPopupPayload(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [popupPayload]);

  const renderPopupButtons = (lesson) => {
    const normalizePopupData = (value) => {
      if (!value) {
        return null;
      }
      return typeof value === 'string' ? { content: value } : value;
    };

    const normalizeTraceLetter = (value) => {
      if (typeof value !== 'string') {
        return null;
      }
      const normalized = value.trim().toUpperCase();
      return TRACE_LETTER_SET.has(normalized) ? normalized : null;
    };

    const normalizePopVideoKey = (value) => {
      if (typeof value !== 'string') {
        return null;
      }
      const normalized = value.trim().toLowerCase();
      return normalized || null;
    };

    const actions = [
      {
        type: 'trace',
        fallbackTitle: 'Trace reference',
        payload: normalizePopupData(lesson.trace),
      },
      {
        type: 'popvideo',
        fallbackTitle: 'Pop video',
        payload: normalizePopupData(lesson.popvideo),
      },
    ].map((action) => {
      const animationLetter =
        action.type === 'trace'
          ? normalizeTraceLetter(action.payload?.content)
          : null;

      return {
        ...action,
        animationLetter,
        popVideoKey:
          action.type === 'popvideo'
            ? normalizePopVideoKey(action.payload?.content)
            : null,
      };
    }).filter((action) => action.payload);

    if (!actions.length) {
      return null;
    }

    return (
      <div className="lesson-slide__popup-buttons">
        {actions.map((action) => (
          <button
            key={action.type}
            type="button"
            className="text-button lesson-slide__popup-button"
            onClick={() =>
              setPopupPayload({
                type: action.type,
                ...action.payload,
                animationLetter: action.animationLetter,
                popVideoKey: action.popVideoKey,
              })
            }
          >
            {action.payload.title ?? action.fallbackTitle}
          </button>
        ))}
      </div>
    );
  };

  const popupTitle =
    popupPayload?.title ??
    (popupPayload?.type === 'popvideo' ? 'Pop video' : 'Trace reference');

  const showTraceAnimation =
    popupPayload?.type === 'trace' && Boolean(popupPayload?.animationLetter);
  const showPopVideo =
    popupPayload?.type === 'popvideo' && Boolean(popupPayload?.popVideoKey);
  const trimmedPopupContent =
    typeof popupPayload?.content === 'string'
      ? popupPayload.content.trim()
      : '';
  const shouldShowFormattedContent =
    Boolean(trimmedPopupContent) && !showTraceAnimation && !showPopVideo;

  return (
    <section className="lesson-page" aria-label="Lessons for selected day">
      <div className="lesson-page__inner">
        <div className="lesson-page__header">
          <div>
            <h2>
              {selectedClass} · Month {selectedMonth} · Day {selectedDay}
            </h2>
            <p className="lesson-page__subtitle">
              {lessons.length} sliders available
            </p>
          </div>
            <button
              type="button"
              className="text-button lesson-page__close lesson-page__close-button"
              onClick={onClose}
            >
              <span aria-hidden="true">←</span>
              Back to planner
            </button>
        </div>
        <div className="lesson-page__nav">
          <button
            type="button"
            className="lesson-page__nav-button"
            onClick={onPrevSlide}
            disabled={currentSlide === 0}
          >
            Previous
          </button>
          <span>
            Slider {currentSlide + 1} / {lessons.length}
          </span>
          <button
            type="button"
            className="lesson-page__nav-button"
            onClick={onNextSlide}
            disabled={currentSlide === lessons.length - 1}
          >
            Next
          </button>
        </div>
        <div className="lesson-page__slider">
          <div className="lesson-page__track">
            {lessons.map((lesson, index) => {
              const lessonTime = lesson.time?.trim();
              const shouldShowControls = index === currentSlide;
              return (
                <article
                  className="lesson-slide"
                  key={`${lesson.title ?? 'lesson'}-${index}`}
                  style={{ display: shouldShowControls ? 'flex' : 'none' }}
                  aria-hidden={!shouldShowControls}
                >
                  <header className="lesson-slide__header">
                    <div className="lesson-slide__header-main">
                      <div>
                        <p className="eyebrow">Slider's {index + 1}</p>
                        <h3>{lesson.title}</h3>
                      </div>
                      {lesson.doc && <PdfButton href={lesson.doc} />}
                    </div>
                    {lessonTime && (
                      <div className="lesson-slide__time-row">
                        <Time time={lessonTime} />
                      </div>
                    )}
                  </header>
                  <div className="lesson-slide__content">
                    <div className="lesson-slide__text">
                      <FormattedContent text={lesson.content} />
                      {renderPopupButtons(lesson)}
                    </div>
                    <LessonMedia
                      lesson={lesson}
                      shouldShowControls={shouldShowControls}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
      {popupPayload && (
        <div
          className="lesson-slide__popup-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={popupTitle}
          onClick={closePopup}
        >
          <div
            className="lesson-slide__popup-card"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="lesson-slide__popup-header">
              <h4>{popupTitle}</h4>
              <button
                type="button"
                className="text-button lesson-slide__popup-close"
                onClick={closePopup}
              >
                Close
              </button>
            </header>
            <div className="lesson-slide__popup-body">
              {showPopVideo && (
                <PopVideoPlayer videoKey={popupPayload.popVideoKey} />
              )}
              {showTraceAnimation && (
                <TraceLetter initialLetter={popupPayload.animationLetter} />
              )}
              {shouldShowFormattedContent && (
                <FormattedContent text={popupPayload.content} />
              )}
              {!showTraceAnimation &&
                !showPopVideo &&
                !shouldShowFormattedContent && (
                  <p className="lesson-slide__popup-empty">
                    No additional content available.
                  </p>
                )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
