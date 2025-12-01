const INLINE_HIGHLIGHT = '^';

function parseInlineSegments(text) {
  const segments = [];
  let buffer = '';
  let bold = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === INLINE_HIGHLIGHT) {
      if (buffer.length) {
        segments.push({ text: buffer, bold });
        buffer = '';
      }
      bold = !bold;
      continue;
    }
    buffer += char;
  }

  if (buffer.length) {
    segments.push({ text: buffer, bold });
  }

  return segments;
}

export function parseLessonContent(rawText = '') {
  if (!rawText) return [];

  const lines = rawText.split('\n');
  const blocks = [];

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return;
    }

    const bulletMatch = trimmed.match(/^(\*+)\s+(.*)$/);
    if (bulletMatch) {
      const [, stars, content] = bulletMatch;
      const level = Math.max(stars.length, 1);
      blocks.push({
        type: 'bullet',
        level,
        children: parseInlineSegments(content),
      });
      return;
    }

    blocks.push({
      type: 'paragraph',
      children: parseInlineSegments(trimmed),
    });
  });

  return blocks;
}
