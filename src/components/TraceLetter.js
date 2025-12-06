import { useEffect, useMemo, useRef, useState } from 'react';

export const TRACE_LETTER_KEYS = ['A', 'B', 'C', 'D', 'E', 'F'];
const strokeDelay = 90;
const betweenStrokeDelay = 220;
const strokeColors = ['#fb923c', '#0ea5e9', '#34d399', '#c084fc', '#f87171'];
const strokeColorNames = ['Orange', 'Blue', 'Green', 'Purple', 'Red'];

const normalizeLetterInput = (value) => {
  if (!value) {
    return null;
  }
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim().toUpperCase();
  return trimmed.length === 1 ? trimmed : null;
};

function convertPoints(pointArray) {
  return pointArray.map(({ x, y }) => [x, y]);
}

function TraceLetter({ initialLetter }) {
  const canvasRef = useRef(null);
  const lettersRef = useRef({});
  const drawingRef = useRef({
    timer: null,
    isDrawing: false,
    pendingLetter: null,
  });
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [activeLetter, setActiveLetter] = useState(null);
  const [completedStrokeNumber, setCompletedStrokeNumber] = useState(null);

  const normalized = useMemo(
    () => normalizeLetterInput(initialLetter),
    [initialLetter],
  );

  const getContext = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return null;
    }
    return canvas.getContext('2d');
  };

  const clearCanvas = () => {
    const ctx = getContext();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) {
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const drawPoint = (ctx, x, y, color = '#111') => {
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  };

  const cancelAnimation = () => {
    if (drawingRef.current.timer) {
      clearTimeout(drawingRef.current.timer);
      drawingRef.current.timer = null;
    }
  };

  const handleDrawingComplete = () => {
    drawingRef.current.isDrawing = false;
    drawingRef.current.timer = null;
    if (drawingRef.current.pendingLetter) {
      const nextLetter = drawingRef.current.pendingLetter;
      drawingRef.current.pendingLetter = null;
      drawLetter(nextLetter);
    }
  };

  const drawStrokePoints = (points, color, onComplete) => {
    const ctx = getContext();
    if (!ctx) {
      onComplete();
      return;
    }

    let index = 0;
    const drawNext = () => {
      if (!ctx || index >= points.length) {
        drawingRef.current.timer = null;
        onComplete();
        return;
      }

      const [x, y] = points[index++];
      drawPoint(ctx, x, y, color);
      drawingRef.current.timer = setTimeout(drawNext, strokeDelay);
    };

    drawNext();
  };

  const drawStrokeSequence = (strokes, index) => {
    if (index >= strokes.length) {
      handleDrawingComplete();
      return;
    }

    const color = strokeColors[index % strokeColors.length];
    drawStrokePoints(strokes[index], color, () => {
      const nextIndex = index + 1;
      setCompletedStrokeNumber(index + 1);
      if (nextIndex < strokes.length) {
        drawingRef.current.timer = setTimeout(
          () => drawStrokeSequence(strokes, nextIndex),
          betweenStrokeDelay,
        );
      } else {
        handleDrawingComplete();
      }
    });
  };

  const drawLetter = (letter) => {
    const normalizedLetter = typeof letter === 'string' ? letter.toUpperCase() : null;
    if (!normalizedLetter) {
      return;
    }
    const entry = lettersRef.current[normalizedLetter];
    if (!entry?.strokes?.length) {
      return;
    }

    if (drawingRef.current.isDrawing) {
      drawingRef.current.pendingLetter = normalizedLetter;
      return;
    }

    cancelAnimation();
    clearCanvas();
    drawingRef.current.isDrawing = true;
    setActiveLetter(normalizedLetter);
    setCompletedStrokeNumber(null);
    drawStrokeSequence(entry.strokes, 0);
  };

  useEffect(() => {
    let isMounted = true;
    const cancel = () => {
      drawingRef.current.isDrawing = false;
      drawingRef.current.pendingLetter = null;
      if (drawingRef.current.timer) {
        clearTimeout(drawingRef.current.timer);
        drawingRef.current.timer = null;
      }
    };

    async function loadLetters() {
      setStatus('loading');
      setError(null);

      try {
        const imports = await Promise.all(
          TRACE_LETTER_KEYS.map((letter) =>
            import(`../letter-data/${letter}.json`),
          ),
        );
        if (!isMounted) {
          return;
        }

        const aggregated = {};
        imports.forEach((module) => {
          if (module && module.default && typeof module.default === 'object') {
            Object.assign(aggregated, module.default);
          }
        });

        const letterMap = {};

        Object.keys(aggregated)
          .sort()
          .forEach((letter) => {
            const entry = aggregated[letter];
            if (!entry) {
              return;
            }
            const strokesFromFile = Array.isArray(entry.strokes)
              ? entry.strokes.map((stroke) => convertPoints(stroke))
              : [];
            const pointsFromFile = Array.isArray(entry.points)
              ? convertPoints(entry.points)
              : [];
            const strokes = strokesFromFile.length
              ? strokesFromFile
              : pointsFromFile.length
              ? [pointsFromFile]
              : [];

            if (!strokes.length) {
              return;
            }

            letterMap[letter] = { strokes };
            letterMap[letter.toLowerCase()] = letterMap[letter];
          });

        lettersRef.current = letterMap;
        setStatus('ready');

        if (normalized && letterMap[normalized]) {
          drawLetter(normalized);
        }
      } catch (err) {
        if (!isMounted) {
          return;
        }
        console.error('Unable to load trace letters', err);
        setError('Could not load trace animations.');
        setStatus('error');
      }
    }

    loadLetters();
    return () => {
      isMounted = false;
      cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      status !== 'ready' ||
      !normalized ||
      !lettersRef.current[normalized]
    ) {
      return;
    }
    drawLetter(normalized);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalized, status]);

  return (
    <div className="trace-letter">
      <p className="trace-letter__label">
        Trace animation{activeLetter ? ` · ${activeLetter}` : ''}
      </p>
      <div className="trace-letter__canvas-shell">
        <canvas
          ref={canvasRef}
          width="300"
          height="300"
          className="trace-letter__canvas"
          aria-live="polite"
          aria-label="Letter tracing animation"
        />
        {completedStrokeNumber && (
          <div className="trace-letter__side-badge">
            <span className="trace-letter__side-badge-label">Side</span>
            <span className="trace-letter__side-badge-number">
              {completedStrokeNumber}
            </span>
          </div>
        )}
        {status === 'loading' && (
          <p className="trace-letter__status">Loading letters…</p>
        )}
        {status === 'error' && (
          <p className="trace-letter__status trace-letter__status--error">
            {error}
          </p>
        )}
      </div>
      <div className="trace-letter__legend">
        {strokeColors.map((color, index) => (
          <div key={`${color}-${index}`} className="trace-letter__legend-item">
            <span
              className="trace-letter__legend-dot"
              style={{ background: color }}
            />
            <span>
              Stroke {index + 1} · {strokeColorNames[index]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TraceLetter;
