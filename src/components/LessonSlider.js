import React, { useEffect, useMemo, useState } from 'react';
import PdfButton from './PdfButton';
import VideoPreview from './VideoPreview';
import FormattedContent from './FormattedContent';
import Time from './Time';
import TraceLetter, {
  TRACE_LETTER_KEYS,
  canonicalTraceLetterKey,
} from './TraceLetter';
import PopVideoPlayer from './PopVideoPlayer';

const normalizeAssetImportPath = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim().replace(/\\/g, '/');
  if (!trimmed) {
    return '';
  }

  const withoutLeadingSlash = trimmed.replace(/^\.?\/*/, '');

  return withoutLeadingSlash
    .replace(/^assets\/videos\//i, 'assets/Videos/')
    .replace(/^assets\/images\//i, 'assets/Images/');
};

const parseYouTubeId = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  try {
    const url = new URL(trimmed);

    if (url.hostname.includes('youtu.be')) {
      return url.pathname.replace(/^\/+/, '').split('/')[0] || '';
    }

    if (url.hostname.includes('youtube.com')) {
      if (url.pathname.startsWith('/embed/')) {
        return url.pathname.split('/')[2] || '';
      }
      return url.searchParams.get('v') || '';
    }
  } catch {
    const match = trimmed.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:[?&/]|$)/);
    return match ? match[1] : '';
  }

  return '';
};

const buildYouTubeEmbedUrl = (value, autoPlay = false) => {
  const videoId = parseYouTubeId(value);

  if (!videoId) {
    return '';
  }

  const searchParams = new URLSearchParams({
    rel: '0',
    playsinline: '1',
    autoplay: autoPlay ? '1' : '0',
  });

  return `https://www.youtube.com/embed/${videoId}?${searchParams.toString()}`;
};

function LessonMedia({ lesson, shouldShowControls, onImagePreview }) {
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoError, setVideoError] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const lessonImage = lesson?.image;
  const lessonYouTubeLink = useMemo(() => {
    const candidates = [lesson?.youtubeLink, lesson?.['youtube link'], lesson?.youtube_link];
    const match = candidates.find((value) => typeof value === 'string' && value.trim());
    return match ? match.trim() : '';
  }, [lesson]);
  const youtubeEmbedUrl = useMemo(
    () => buildYouTubeEmbedUrl(lessonYouTubeLink, shouldShowControls),
    [lessonYouTubeLink, shouldShowControls]
  );

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
  const hasYouTubeVideo = Boolean(youtubeEmbedUrl);
  const hasVideo =
    typeof lesson.video === 'string' ? lesson.video.trim().length > 0 : Boolean(lesson.video);
  const popVideoCandidates = [lesson.popvideo, lesson.popvideo2, lesson.popvideo3]
    .map((entry) => entry?.content)
    .filter((value) => typeof value === 'string')
    .map((value) => value.trim())
    .filter(Boolean);
  const popVideoUrl =
    popVideoCandidates.find((value) => value.toLowerCase().startsWith('http')) || '';
  const popVideoKey = popVideoUrl ? '' : popVideoCandidates[0] || '';
  const hasPopVideo = Boolean(popVideoUrl || popVideoKey);
  const shouldLoadVideo = hasVideo && shouldShowControls && !hasYouTubeVideo;
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
    const canPreviewImage = Boolean(activeImagePath && onImagePreview);

    return (
      <div className="lesson-slide__image-stack">
        <button
          type="button"
          className={`lesson-slide__image-button${
            canPreviewImage ? ' lesson-slide__image-button--clickable' : ''
          }`}
          onClick={() =>
            canPreviewImage
              ? onImagePreview({
                  title: `${lesson.title || 'Lesson'} preview`,
                  content: activeImagePath,
                })
              : undefined
          }
          disabled={!canPreviewImage}
          aria-label={`Preview ${lesson.title || 'lesson'} image`}
        >
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
          </div>
        </button>
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
      import(`../${normalizeAssetImportPath(lesson.video)}`)
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

    import(`../${normalizeAssetImportPath(activeImagePath)}`)
      .then((image) => {
        setImageUrl(image.default);
      })
      .catch((err) => {
        console.error('Failed to load image:', err);
        setImageError('Could not load illustration.');
      });
  }, [hasImage, activeImagePath]);

  if (!hasYouTubeVideo && !hasVideo && !hasImage && !hasPopVideo) {
    return null;
  }

  const mediaClassNames = [
    'lesson-slide__media',
    (hasYouTubeVideo || hasVideo) && hasImage ? 'lesson-slide__media--has-both' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={mediaClassNames}>
      {hasYouTubeVideo && (
        <div className="lesson-slide__youtube">
          <iframe
            src={youtubeEmbedUrl}
            title={lesson.title || 'YouTube video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
      {!hasYouTubeVideo && hasVideo && (
        <VideoPreview
          videoUrl={videoUrl}
          title={lesson.title}
          autoPlay={shouldShowControls}
          idleMessage={videoError || 'Navigate to this lesson to load the preview.'}
        />
      )}
      {hasImage && !hasYouTubeVideo && !hasVideo && renderImage()}
      {!hasYouTubeVideo && !hasVideo && !hasImage && popVideoUrl && (
        <div className="video-frame">
          <iframe
            src={popVideoUrl}
            title={lesson.title || 'Video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
      {!hasYouTubeVideo && !hasVideo && !hasImage && !popVideoUrl && popVideoKey && (
        <PopVideoPlayer videoKey={popVideoKey} />
      )}
    </div>
  );
}

const TRACE_LETTER_SET = new Set(
  TRACE_LETTER_KEYS.map(canonicalTraceLetterKey).filter(Boolean),
);

const PAGE_REFERENCE_LABELS = {
  ESB: 'English Skill Book',
  EWB: 'English Workbook',
  MSB: 'Math Skill Book',
  MWB: 'Math Workbook',
};

export default function LessonSlider({
  lessons,
  currentSlide,
  onPrevSlide,
  onNextSlide,
  onClose,
  selectedClass,
  selectedMonth,
  selectedDay,
  contextTitle,
  contextSubtitle,
  disclaimerText,
}) {
  const [popupPayload, setPopupPayload] = useState(null);
  const [popupMediaUrl, setPopupMediaUrl] = useState(null);
  const [popupAudioUrl, setPopupAudioUrl] = useState(null);
  const [popupMediaError, setPopupMediaError] = useState(null);

  const formatPageReference = (value) => {
    if (typeof value !== 'string') {
      return '';
    }

    const trimmed = value.trim();
    if (!trimmed) {
      return '';
    }

    const dashedMatch = trimmed.match(/^([A-Za-z]+)\s*-\s*(.+)$/);
    if (dashedMatch) {
      const shortCode = dashedMatch[1].toUpperCase();
      const label = PAGE_REFERENCE_LABELS[shortCode] || dashedMatch[1].trim();
      return `${dashedMatch[2].trim()} in ${label}`;
    }

    const spacedMatch = trimmed.match(/^([A-Za-z][A-Za-z\s&-]*)\s+(.+)$/);
    if (spacedMatch && /\d/.test(spacedMatch[2])) {
      return `${spacedMatch[2].trim()} in ${spacedMatch[1].trim()}`;
    }

    return trimmed;
  };

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

  const resolveMediaPath = (value, defaultDir) => {
    if (!value || typeof value !== 'string') {
      return '';
    }
    const trimmed = value.trim();
    if (!trimmed) {
      return '';
    }
    if (trimmed.startsWith('http')) {
      return trimmed;
    }
    if (trimmed.includes('/') || trimmed.includes('.')) {
      return trimmed;
    }
    return `${defaultDir}/${trimmed}`;
  };

  const resolveAudioPath = (value, defaultDir) => {
    const base = resolveMediaPath(value, defaultDir);
    if (!base || base.startsWith('http')) {
      return base;
    }
    if (base.includes('.')) {
      return base;
    }
    return `${base}.mp3`;
  };

  const resolveAudioImageAudioPath = (value) => {
    if (!value || typeof value !== 'string') {
      return '';
    }
    const trimmed = value.trim();
    if (!trimmed) {
      return '';
    }
    if (trimmed.startsWith('http')) {
      return trimmed;
    }
    let base = trimmed;
    if (base.includes('/')) {
      base = base.split('/').pop() || base;
    }
    base = base.replace(/\.[^/.]+$/, '');
    return `imageAudio/${base}.mp3`;
  };

  const resolveAudioImageCandidates = (value) => {
    if (!value || typeof value !== 'string') {
      return [];
    }
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }
    if (trimmed.startsWith('http')) {
      return [trimmed];
    }

    if (trimmed.includes('.')) {
      if (trimmed.includes('/')) {
        return [trimmed];
      }
      return [`imageAudio/${trimmed}`];
    }

    const base = trimmed.replace(/\.[^/.]+$/, '');
    return [
      `imageAudio/${base}.png`,
      `imageAudio/${base}.jpg`,
      `imageAudio/${base}.jpeg`,
    ];
  };

  useEffect(() => {
    setPopupMediaUrl(null);
    setPopupAudioUrl(null);
    setPopupMediaError(null);

    if (!popupPayload || !['audio', 'audioimage', 'image'].includes(popupPayload.type)) {
      return;
    }

    const contentPath = popupPayload?.content;
    if (popupPayload.type === 'image') {
      const path = resolveMediaPath(contentPath, 'images');
      if (!path) {
        setPopupMediaError('No image available.');
        return;
      }
      if (path.startsWith('http')) {
        setPopupMediaUrl(path);
        return;
      }
      import(`../${normalizeAssetImportPath(path)}`)
        .then((asset) => {
          setPopupMediaUrl(asset.default);
        })
        .catch(() => {
          setPopupMediaError('Could not load image.');
        });
      return;
    }
    if (popupPayload.type === 'audio') {
      const path = resolveAudioPath(contentPath, 'audio');
      if (!path) {
        setPopupMediaError('No audio available.');
        return;
      }
      if (path.startsWith('http')) {
        setPopupAudioUrl(path);
        return;
      }

      import(`../${path}`)
        .then((asset) => {
          setPopupAudioUrl(asset.default);
        })
        .catch(() => {
          setPopupMediaError('Could not load audio.');
        });
      return;
    }

    const candidates = resolveAudioImageCandidates(contentPath);
    if (!candidates.length) {
      setPopupMediaError('No image available.');
      return;
    }

    if (candidates[0].startsWith('http')) {
      setPopupMediaUrl(candidates[0]);
    }

    let cancelled = false;

    const tryLoad = async () => {
      for (const candidate of candidates) {
        try {
          // eslint-disable-next-line no-await-in-loop
          const asset = await import(`../${candidate}`);
          if (!cancelled) {
            setPopupMediaUrl(asset.default);
          }
          return;
        } catch (err) {
          if (cancelled) {
            return;
          }
        }
      }
      if (!cancelled) {
        setPopupMediaError('Could not load image.');
      }
    };

    if (!candidates[0].startsWith('http')) {
      tryLoad();
    }

    const audioPath = resolveAudioImageAudioPath(contentPath);
    if (!audioPath) {
      return () => {
        cancelled = true;
      };
    }
    if (audioPath.startsWith('http')) {
      setPopupAudioUrl(audioPath);
      return () => {
        cancelled = true;
      };
    }

    import(`../${audioPath}`)
      .then((asset) => {
        if (!cancelled) {
          setPopupAudioUrl(asset.default);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPopupMediaError('Could not load audio.');
        }
      });
    return () => {
      cancelled = true;
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
      const normalized = canonicalTraceLetterKey(value);
      return normalized && TRACE_LETTER_SET.has(normalized) ? normalized : null;
    };
    const extractFileLabel = (value) => {
      if (typeof value !== 'string') {
        return null;
      }
      const trimmed = value.trim();
      if (!trimmed) {
        return null;
      }
      const base = trimmed.split('/').pop() || trimmed;
      return base.replace(/\.[^/.]+$/, '');
    };

    const normalizePopVideoKey = (value) => {
      if (typeof value !== 'string') {
        return null;
      }
      const normalized = value.trim().toLowerCase();
      return normalized || null;
    };
    const getOrderedVariantEntries = (prefix) =>
      Object.entries(lesson)
        .filter(([key]) => new RegExp(`^${prefix}\\d*$`, 'i').test(key))
        .sort(([keyA], [keyB]) => {
          const getOrder = (key) => {
            const match = key.match(/\d+$/);
            return match ? Number(match[0]) : 0;
          };
          return getOrder(keyA) - getOrder(keyB);
        });
    const isUrl = (value) =>
      typeof value === 'string' && value.trim().toLowerCase().startsWith('http');
    const hasVideo =
      typeof lesson.video === 'string'
        ? lesson.video.trim().length > 0
        : Boolean(lesson.video);
    const hasImage = (() => {
      const imageValue = lesson.image;
      if (typeof imageValue === 'string') {
        return imageValue.trim().length > 0;
      }
      if (Array.isArray(imageValue)) {
        return imageValue.some((value) => typeof value === 'string' && value.trim().length > 0);
      }
      if (imageValue && typeof imageValue === 'object') {
        return Object.values(imageValue).some(
          (value) => typeof value === 'string' && value.trim().length > 0,
        );
      }
      return false;
    })();
    const popVideoCandidates = [lesson.popvideo, lesson.popvideo2, lesson.popvideo3]
      .map((entry) => entry?.content)
      .filter((value) => typeof value === 'string')
      .map((value) => value.trim())
      .filter(Boolean);
    const hasMainPopVideo = !hasVideo && !hasImage && popVideoCandidates.length > 0;
    const lessonYouTubeLink =
      typeof lesson?.youtubeLink === 'string' && lesson.youtubeLink.trim()
        ? lesson.youtubeLink.trim()
        : typeof lesson?.['youtube link'] === 'string' && lesson['youtube link'].trim()
          ? lesson['youtube link'].trim()
          : typeof lesson?.youtube_link === 'string' && lesson.youtube_link.trim()
            ? lesson.youtube_link.trim()
            : '';
    const hasYouTubeVideo = Boolean(buildYouTubeEmbedUrl(lessonYouTubeLink));
    const hasImageWithPrimaryMedia = (hasVideo || hasYouTubeVideo) && hasImage;

    const traceActions = getOrderedVariantEntries('trace').map(([key, value], index) => ({
      type: key,
      fallbackTitle: index === 0 ? 'Trace reference' : `Trace ${index + 1}`,
      payload: normalizePopupData(value),
    }));

    const actions = [
      ...traceActions,
      {
        type: 'popvideo',
        fallbackTitle: 'Pop video',
        payload: normalizePopupData(lesson.popvideo),
      },
      {
        type: 'popvideo2',
        fallbackTitle: 'Pop video 2',
        payload: normalizePopupData(lesson.popvideo2),
      },
      {
        type: 'popvideo3',
        fallbackTitle: 'Pop video 3',
        payload: normalizePopupData(lesson.popvideo3),
      },
      ...(() => {
        if (!hasImageWithPrimaryMedia) {
          return [];
        }
        const imageItems = [];
        const imageValue = lesson.image;
        if (typeof imageValue === 'string') {
          imageItems.push(imageValue);
        } else if (Array.isArray(imageValue)) {
          imageItems.push(...imageValue);
        } else if (imageValue && typeof imageValue === 'object') {
          imageItems.push(
            ...Object.entries(imageValue)
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([, value]) => value)
          );
        }
        return imageItems
          .filter((value) => typeof value === 'string' && value.trim())
          .map((value, index) => ({
            type: 'image',
            fallbackTitle: 'View image',
            payload: { title: 'View image', content: value.trim() },
          }));
      })(),
      {
        type: 'audio',
        fallbackTitle: 'Audio',
        payload: normalizePopupData(lesson.audio),
      },
      {
        type: 'audio2',
        fallbackTitle: 'Audio 2',
        payload: normalizePopupData(lesson.audio2),
      },
      {
        type: 'audio3',
        fallbackTitle: 'Audio 3',
        payload: normalizePopupData(lesson.audio3),
      },
      {
        type: 'audioimage',
        fallbackTitle: 'Image + audio',
        payload: normalizePopupData(lesson.audioimage),
      },
      {
        type: 'audioimage2',
        fallbackTitle: 'Image + audio 2',
        payload: normalizePopupData(lesson.audioimage2),
      },
      {
        type: 'audioimage3',
        fallbackTitle: 'Image + audio 3',
        payload: normalizePopupData(lesson.audioimage3),
      },
    ]
      .filter((action) => !(hasMainPopVideo && action.type.startsWith('popvideo')))
      .map((action) => {
      const isTraceType = action.type.startsWith('trace');
      const animationLetter = isTraceType
        ? normalizeTraceLetter(action.payload?.content)
        : null;
      const contentLabel = !isUrl(action.payload?.content)
        ? extractFileLabel(action.payload?.content)
        : null;
      const fileLabel = isTraceType ? contentLabel : contentLabel;

      return {
        ...action,
        animationLetter,
        fileLabel,
        popVideoKey:
          action.type.startsWith('popvideo') && !isUrl(action.payload?.content)
            ? normalizePopVideoKey(action.payload?.content)
            : null,
        popVideoUrl:
          action.type.startsWith('popvideo') && isUrl(action.payload?.content)
            ? action.payload?.content?.trim()
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
            {action.payload?.title
              ? `${action.payload.title}${action.fileLabel ? ` ${action.fileLabel}` : ''}`
              : action.fileLabel || action.fallbackTitle}
          </button>
        ))}
      </div>
    );
  };

  const popupTitle =
    popupPayload?.title ??
    (popupPayload?.type?.startsWith('popvideo')
      ? 'Pop video'
      : popupPayload?.type === 'image'
        ? 'View image'
      : popupPayload?.type?.startsWith('audioimage')
        ? 'Image + audio'
        : popupPayload?.type?.startsWith('audio')
          ? 'Audio'
          : popupPayload?.type?.startsWith('trace')
            ? 'Trace reference'
            : 'Additional content');

  const showTraceAnimation =
    popupPayload?.type?.startsWith('trace') &&
    Boolean(popupPayload?.animationLetter);
  const showPopVideo =
    popupPayload?.type?.startsWith('popvideo') && Boolean(popupPayload?.popVideoKey);
  const showPopVideoUrl =
    popupPayload?.type?.startsWith('popvideo') && Boolean(popupPayload?.popVideoUrl);
  const showImage = popupPayload?.type === 'image';
  const showAudioImage = popupPayload?.type?.startsWith('audioimage');
  const showAudio =
    popupPayload?.type?.startsWith('audio') && !showAudioImage;
  const trimmedPopupContent =
    typeof popupPayload?.content === 'string'
      ? popupPayload.content.trim()
      : '';
  const shouldShowFormattedContent =
    Boolean(trimmedPopupContent) &&
    !showTraceAnimation &&
    !showPopVideo &&
    !showPopVideoUrl &&
    !showImage &&
    !showAudio &&
    !showAudioImage;

  const renderLessonMeta = (lessonTime, lessonPageReference, formattedLessonPageReference) => {
    if (!lessonTime && !lessonPageReference) {
      return null;
    }

    return (
      <div className="lesson-slide__meta-row">
        {lessonTime && (
          <div className="lesson-slide__time-row">
            <Time time={lessonTime} />
          </div>
        )}
        {lessonPageReference && (
          <div className="lesson-slide__page-reference-inline">
            <p>Pls Refer Page: {formattedLessonPageReference}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="lesson-page" aria-label="Lessons for selected day">
      <div className="lesson-page__inner">
        <div className="lesson-page__header">
          <div>
            <h2>{contextTitle || `${selectedClass} - Month ${selectedMonth} - Day ${selectedDay}`}</h2>
            {contextSubtitle ? (
              <p className="lesson-page__subtitle">{contextSubtitle}</p>
            ) : null}
            {disclaimerText ? (
              <p className="lesson-page__disclaimer">{disclaimerText}</p>
            ) : null}
          </div>
          <button
            type="button"
            className="text-button lesson-page__close lesson-page__close-button"
            onClick={onClose}
          >
            <span aria-hidden="true">&larr;</span>
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
            {lessons.length > 1 ? `${currentSlide + 1} / ${lessons.length}` : ''}
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
              const lessonPageReference =
                typeof lesson['page refernce'] === 'string'
                  ? lesson['page refernce'].trim()
                  : '';
              const formattedLessonPageReference = formatPageReference(lessonPageReference);
              const shouldShowControls = index === currentSlide;
              const hasContent =
                typeof lesson.content === 'string' && lesson.content.trim().length > 0;
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
                        <p className="eyebrow">
                          {lesson.slider ? lesson.slider : `Slider's ${index + 1}`}
                        </p>
                        <h3>{lesson.title}</h3>
                      </div>
                      {lesson.doc && <PdfButton href={lesson.doc} />}
                    </div>
                  </header>
                  <div
                    className={
                      hasContent
                        ? 'lesson-slide__content'
                        : 'lesson-slide__content lesson-slide__content--media-only'
                    }
                  >
                    {hasContent && (
                      <div className="lesson-slide__text">
                        {renderLessonMeta(
                          lessonTime,
                          lessonPageReference,
                          formattedLessonPageReference,
                        )}
                        <FormattedContent text={lesson.content} />
                        {Array.isArray(lesson.referenceItems) && lesson.referenceItems.length > 0 && (
                          <div className="lesson-slide__references">
                            {lesson.referenceItems.map((item) => (
                              <div
                                key={`${item.kind}-${item.title}`}
                                className="lesson-slide__reference-card"
                              >
                                <p className="eyebrow">{item.kind}</p>
                                <h4>{item.title}</h4>
                                <FormattedContent
                                  text={item.content || `No ${item.kind.toLowerCase()} content available.`}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                        {renderPopupButtons(lesson)}
                      </div>
                    )}
                    <LessonMedia
                      lesson={lesson}
                      shouldShowControls={shouldShowControls}
                      onImagePreview={(payload) =>
                        setPopupPayload({
                          type: 'image',
                          ...payload,
                        })
                      }
                    />
                    {!hasContent &&
                      renderLessonMeta(
                        lessonTime,
                        lessonPageReference,
                        formattedLessonPageReference,
                      )}
                    {!hasContent && renderPopupButtons(lesson)}
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
              {showPopVideoUrl && (
                <div className="lesson-slide__popup-media">
                  <iframe
                    src={popupPayload.popVideoUrl}
                    title={popupTitle}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
              {showTraceAnimation && (
                <TraceLetter initialLetter={popupPayload.animationLetter} />
              )}
              {showImage && (
                <div className="lesson-slide__popup-media">
                  {popupMediaUrl ? (
                    <img src={popupMediaUrl} alt={popupTitle} />
                  ) : (
                    <p className="lesson-slide__popup-empty">
                      {popupMediaError || 'Loading image...'}
                    </p>
                  )}
                </div>
              )}
              {showAudio && (
                <div className="lesson-slide__popup-media">
                  {popupAudioUrl ? (
                    <audio src={popupAudioUrl} controls />
                  ) : (
                    <p className="lesson-slide__popup-empty">
                      {popupMediaError || 'Loading audio...'}
                    </p>
                  )}
                </div>
              )}
              {showAudioImage && (
                <div className="lesson-slide__popup-media">
                  {popupMediaUrl ? (
                    <img src={popupMediaUrl} alt={popupTitle} />
                  ) : (
                    <p className="lesson-slide__popup-empty">
                      {popupMediaError || 'Loading image...'}
                    </p>
                  )}
                  {popupAudioUrl && <audio src={popupAudioUrl} controls />}
                </div>
              )}
              {shouldShowFormattedContent && (
                <FormattedContent text={popupPayload.content} />
              )}
              {!showTraceAnimation &&
                !showPopVideo &&
                !showPopVideoUrl &&
                !showImage &&
                !showAudio &&
                !showAudioImage &&
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
