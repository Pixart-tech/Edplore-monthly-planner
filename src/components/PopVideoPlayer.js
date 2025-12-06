import { useEffect, useMemo, useRef, useState } from 'react';
import abcData from '../abc.json';

const buildVideoLookup = () => {
  const lookup = {};

  const recordEntry = (letterKey, entry, path) => {
    const normalized = letterKey.toLowerCase();
    lookup[normalized] = lookup[normalized] || [];
    lookup[normalized].push({
      ...entry,
      section: path.join(' / '),
      key: letterKey.toUpperCase(),
    });
  };

  const traverse = (node, path = []) => {
    if (!node || typeof node !== 'object') {
      return;
    }

    Object.entries(node).forEach(([key, value]) => {
      if (value && typeof value === 'object' && 'link' in value && 'label' in value) {
        recordEntry(key, value, path);
        return;
      }

      traverse(value, [...path, key]);
    });
  };

  traverse(abcData);
  return lookup;
};

const VIDEO_LOOKUP = buildVideoLookup();

const parseYouTubeId = (link) => {
  if (!link) {
    return null;
  }

  try {
    const url = new URL(link);
    if (url.hostname.includes('youtu.be')) {
      return url.pathname.slice(1);
    }
    if (url.hostname.includes('youtube.com')) {
      return url.searchParams.get('v');
    }
  } catch {
    // fall back to simple regex
    const match = link.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
    if (match) {
      return match[1];
    }
  }
  return null;
};

const parseTiming = (timeduration) => {
  if (!Array.isArray(timeduration)) {
    return { start: NaN, end: NaN };
  }
  const [start, end] = timeduration;
  const startSeconds = Number.parseInt(start?.trim() ?? '', 10);
  const endSeconds = Number.parseInt(end?.trim() ?? '', 10);
  return { start: Number.isNaN(startSeconds) ? NaN : startSeconds, end: Number.isNaN(endSeconds) ? NaN : endSeconds };
};

const loadYouTubeApi = (() => {
  let promise;
  return () => {
    if (promise) return promise;
    promise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('YouTube API cannot load in this environment.'));
        return;
      }

      if (window.YT && window.YT.Player) {
        resolve(window.YT);
        return;
      }

      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (previousCallback) {
          previousCallback();
        }
        if (window.YT && window.YT.Player) {
          resolve(window.YT);
        } else {
          reject(new Error('YouTube API failed to initialize.'));
        }
      };

      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.onerror = () => {
        reject(new Error('Failed to load YouTube API.'));
      };
      document.body.appendChild(script);
    });
    return promise;
  };
})();

const PopVideoPlayer = ({ videoKey }) => {
  const normalizedKey = (videoKey ?? '').trim().toLowerCase();
  const entryData = useMemo(() => {
    if (!normalizedKey) {
      return null;
    }
    const entries = VIDEO_LOOKUP[normalizedKey];
    return entries?.[0] ?? null;
  }, [normalizedKey]);

  const timing = useMemo(
    () => (entryData ? parseTiming(entryData.timeduration) : { start: NaN, end: NaN }),
    [entryData],
  );
  const { start, end } = timing;
  const videoId = useMemo(
    () => (entryData ? parseYouTubeId(entryData.link) : null),
    [entryData],
  );

  const playerContainerRef = useRef(null);
  const playerRef = useRef(null);
  const [playerError, setPlayerError] = useState(null);

  useEffect(() => {
    if (!entryData) {
      return undefined;
    }
    if (!videoId) {
      setPlayerError('Invalid video identifier provided.');
      return undefined;
    }

    let cancelled = false;
    setPlayerError(null);

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !playerContainerRef.current) {
          return;
        }

        playerRef.current?.destroy();

        const checkEnd = () => {
          const player = playerRef.current;
          if (!player || typeof player.getCurrentTime !== 'function') {
            return;
          }

          const currentTime = player.getCurrentTime();
          if (currentTime >= end - 0.2) {
            player.pauseVideo();
          } else {
            requestAnimationFrame(checkEnd);
          }
        };

        const playerConfig = {
          height: '100%',
          width: '100%',
          videoId,
          playerVars: {
            rel: 0,
            modestbranding: 1,
            controls: 0,
            disablekb: 1,
            start: Number.isNaN(start) ? undefined : start,
            end: Number.isNaN(end) ? undefined : end,
          },
        };

        if (!Number.isNaN(end)) {
          playerConfig.events = {
            onReady: () => {
              requestAnimationFrame(checkEnd);
            },
          };
        }

        playerRef.current = new YT.Player(playerContainerRef.current, playerConfig);
      })
      .catch((error) => {
        if (!cancelled) {
          console.error(error);
          setPlayerError('Unable to load the video player.');
        }
      });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [entryData, videoId, start, end]);

  if (!normalizedKey) {
    return <p className="pop-video__error">No video identifier provided.</p>;
  }

  if (!entryData) {
    return (
      <p className="pop-video__error">
        Unable to find a video for &ldquo;{videoKey}&rdquo;.
      </p>
    );
  }

  if (playerError) {
    return <p className="pop-video__error">{playerError}</p>;
  }

  const { label, section } = entryData;

  const sectionLabel = section ? `Section ${section} · ` : '';

  return (
    <div className="pop-video">
      <p className="pop-video__meta">
        {sectionLabel}Letter {label}
      </p>
      <div className="pop-video__frame">
        <div ref={playerContainerRef} className="pop-video__player" />
      </div>
      <p className="pop-video__duration">
        Playing from {Number.isNaN(start) ? 0 : start}s
        {Number.isNaN(end) ? '' : ` to ${end}s`}
      </p>
    </div>
  );
};

export default PopVideoPlayer;
