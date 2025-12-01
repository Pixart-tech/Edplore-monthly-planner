import React, { useEffect, useMemo, useState } from 'react';
import PdfButton from './PdfButton';
import VideoPreview from './VideoPreview';
import FormattedContent from './FormattedContent';
import Time from './Time';

function LessonMedia({ lesson, shouldShowControls }) {
  const [showImage, setShowImage] = useState(false);
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

  const renderImageSelectors = () => {
    if (imageAssetPaths.length <= 1) {
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

  const renderImage = (extraClass = '') => {
    if (!hasImage) {
      return null;
    }

    const className = ['lesson-slide__image', extraClass].filter(Boolean).join(' ');

    return (
      <div className={className}>
        {imageUrl ? (
          <img src={imageUrl} alt={imageAlt} />
        ) : (
          <p className="lesson-slide__image-placeholder">
            {imageError || 'Loading illustration...'}
          </p>
        )}
        {renderImageSelectors()}
      </div>
    );
  };

  useEffect(() => {
    setShowImage(false);
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

  return (
    <div className="lesson-slide__media">
      {hasVideo ? (
        <VideoPreview
          videoUrl={videoUrl}
          title={lesson.title}
          autoPlay={shouldShowControls}
          idleMessage={videoError || 'Navigate to this lesson to load the preview.'}
        />
      ) : (
        renderImage()
      )}
      {hasVideo && hasImage && (
        <>
          <div className="lesson-slide__media-controls">
            <button
              type="button"
              className="text-button"
              onClick={() => setShowImage((prev) => !prev)}
            >
              {showImage ? 'Hide image' : 'View image'}
            </button>
          </div>
          {showImage && renderImage('lesson-slide__image--sibling')}
        </>
      )}
    </div>
  );
}

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
  return (
    <section className="lesson-page" aria-label="Lessons for selected day">
      <div className="lesson-page__inner">
        <div className="lesson-page__header">
          <div>
            <p className="eyebrow">slider</p>
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
          <div
            className="lesson-page__track"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {lessons.map((lesson, index) => {
              const shouldShowControls = index === currentSlide;
              return (
            <article className="lesson-slide" key={`${lesson.title ?? 'lesson'}-${index}`}>
              <header className="lesson-slide__header">
                <div>
                  <p className="eyebrow">Slider's {index + 1}</p>
                  <h3>{lesson.title}</h3>
                </div>
                <Time time={lesson.time} />
                {lesson.doc && <PdfButton href={lesson.doc} />}
              </header>
              <div className="lesson-slide__content">
                <div className="lesson-slide__text">
                  <FormattedContent text={lesson.content} />
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
    </section>
  );
}
