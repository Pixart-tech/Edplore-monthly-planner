import { useEffect, useMemo, useRef, useState } from 'react';

export const TRACE_LETTER_KEYS = ['A', 'B', 'C', 'D', 'E', 'F'];
const strokeDelay = 90;
const betweenStrokeDelay = 220;
const strokeColors = ['#005587ff', '#0e8ee9ff', '#1c425aff', '#677275ff', '#4c6781ff'];
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

 const drawStrokeIndicator = (points, number, color) => {
  const ctx = getContext();
  if (!ctx || points.length < 2) return;

  const badgeRadius = 16;

  // Use END POINT instead of start point
  const [xe, ye] = points[points.length - 1];
  const [x1, y1] = points[points.length - 2];

  // Stroke direction angle (toward arrow)
  const angle = Math.atan2(ye - y1, xe - x1);

  // Offset to place number above arrow neatly
  const distance = 26;
  let circleX = xe + Math.cos(angle + Math.PI / 2) * distance;
  let circleY = ye + Math.sin(angle + Math.PI / 2) * distance;

  // Keep inside canvas
  circleX = Math.min(Math.max(badgeRadius + 4, circleX), 300 - badgeRadius - 4);
  circleY = Math.min(Math.max(badgeRadius + 4, circleY), 300 - badgeRadius - 4);

  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.arc(circleX, circleY, badgeRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.font = 'bold 16px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(number), circleX, circleY);
  ctx.restore();
};


  const drawStrokeArrow = (points, color) => {
    const ctx = getContext();
    if (!ctx || points.length < 2) {
      return;
    }

    let [x2, y2] = points[points.length - 1];
    let [x1, y1] = points[points.length - 2];

    for (let i = points.length - 2; i >= 0; i -= 1) {
      const [px, py] = points[i];
      if (px !== x2 || py !== y2) {
        x1 = px;
        y1 = py;
        break;
      }
    }

    //after end point arrow display
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const arrowLength = 18;
    const arrowWidth = 9;

    // Arrow tip AFTER end point
    const forwardOffset = 10;  
    const tipX = x2 + forwardOffset * Math.cos(angle);
    const tipY = y2 + forwardOffset * Math.sin(angle);
    const baseX = tipX - arrowLength * Math.cos(angle);
    const baseY = tipY - arrowLength * Math.sin(angle);
    const leftX = baseX + arrowWidth * Math.sin(angle);
    const leftY = baseY - arrowWidth * Math.cos(angle);
    const rightX = baseX - arrowWidth * Math.sin(angle);
    const rightY = baseY + arrowWidth * Math.cos(angle);

    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(leftX, leftY);
    ctx.lineTo(rightX, rightY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
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
      drawStrokeIndicator(strokes[index], index + 1, color);
      drawStrokeArrow(strokes[index], color);
      const nextIndex = index + 1;
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
        {status === 'loading' && (
          <p className="trace-letter__status">Loading letters…</p>
        )}
        {status === 'error' && (
          <p className="trace-letter__status trace-letter__status--error">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default TraceLetter;
