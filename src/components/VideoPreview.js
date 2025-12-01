import { useEffect, useRef } from 'react';

export default function VideoPreview({
  videoUrl,
  title,
  idleMessage,
  autoPlay = false,
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [videoUrl]);

  useEffect(() => {
    if (autoPlay && videoRef.current && videoUrl) {
      videoRef.current
        .play()
        .catch((err) => console.warn('Autoplay prevented by browser:', err));
    }
  }, [autoPlay, videoUrl]);

  if (!videoUrl) {
    return (
      <div className="video-frame video-frame--idle">
        <p>{idleMessage ?? 'Video will load once you open the slider.'}</p>
      </div>
    );
  }

  return (
    <div className="video-frame">
      <video
        ref={videoRef}
        key={videoUrl} // Ensures the component re-mounts on URL change
        controls
        preload="metadata"
        autoPlay={autoPlay}
        src={videoUrl}
        title={title}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
