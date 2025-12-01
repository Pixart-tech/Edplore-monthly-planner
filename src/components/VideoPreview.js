import { useEffect, useState } from 'react';
import { getYoutubeEmbedUrl, getYoutubeWatchUrl } from '../utils/videoUtils';

export default function VideoPreview({
  videoUrl,
  title,
  autoLoad = false,
  idleMessage = 'Navigate to this lesson to load the preview.',
  showActions = true,
}) {
  const embedUrl = getYoutubeEmbedUrl(videoUrl);
  const watchUrl = getYoutubeWatchUrl(videoUrl);
  const [previewRequested, setPreviewRequested] = useState(autoLoad);
  const [previewSuccess, setPreviewSuccess] = useState(false);

  useEffect(() => {
    setPreviewRequested(autoLoad);
    setPreviewSuccess(false);
  }, [videoUrl, autoLoad]);

  const handleRequestPreview = () => {
    setPreviewRequested(true);
  };

  const shouldHidePlaceholder = previewSuccess && previewRequested;

  return (
    <div className="video-frame">
      {previewRequested && embedUrl && (
        <iframe
          src={embedUrl}
          title={title || 'preview'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setPreviewSuccess(true)}
          onError={() => setPreviewSuccess(false)}
        />
      )}
      <div
        className={`video-placeholder ${shouldHidePlaceholder ? 'video-placeholder--hidden' : ''}`}
      >
        <p>{autoLoad ? 'The video preview is blocked in this environment.' : idleMessage}</p>
        <div className="video-placeholder__actions">
          {showActions && (
            <button
              type="button"
              className="text-button"
              onClick={handleRequestPreview}
              disabled={previewRequested}
            >
              {previewRequested ? 'Retry the inline preview' : 'Try the inline preview'}
            </button>
          )}
          {watchUrl && (
            <a href={watchUrl} target="_blank" rel="noreferrer">
              Watch on YouTube
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
