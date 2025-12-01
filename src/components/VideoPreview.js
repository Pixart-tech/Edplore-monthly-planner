import { useEffect, useState } from 'react';

export default function VideoPreview({
  videoUrl,
  title,
  autoLoad = false,
  idleMessage = 'Navigate to this lesson to load the preview.',
  showActions = true,
}) {
  const [previewReady, setPreviewReady] = useState(false);

  useEffect(() => {
    setPreviewReady(false);
  }, [videoUrl, autoLoad]);

  const shouldHidePlaceholder = previewReady && videoUrl;
  const placeholderMessage = videoUrl
    ? 'Loading the direct video preview...'
    : idleMessage;

  return (
    <div className="video-frame">
      {videoUrl && (
        <video
          controls
          preload="metadata"
          onLoadedData={() => setPreviewReady(true)}
          onError={() => setPreviewReady(false)}
          src={videoUrl}
          title={title}
        >
          Your browser does not support the video tag.
        </video>
      )}
      <div
        className={`video-placeholder ${shouldHidePlaceholder ? 'video-placeholder--hidden' : ''}`}
      >
        <p>{placeholderMessage}</p>
      </div>
    </div>
  );
}
