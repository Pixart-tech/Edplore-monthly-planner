import React from 'react';
import PdfButton from './PdfButton';
import VideoPreview from './VideoPreview';
import FormattedContent from './FormattedContent';

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
                    <PdfButton href={lesson.doc} />
                  </header>
                  <div className="lesson-slide__content">
                    <div className="lesson-slide__text">
                      <FormattedContent text={lesson.content} />
                    </div>
                    <div className="lesson-slide__media">
                      <VideoPreview
                        videoUrl={lesson.video}
                        title={lesson.title}
                        autoLoad={shouldShowControls}
                        showActions={shouldShowControls}
                        idleMessage="Navigate to this lesson to load the preview."
                      />
                    </div>
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
