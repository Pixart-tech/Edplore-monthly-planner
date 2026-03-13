const INLINE_HIGHLIGHT = '^';
const HEADING_PATTERN =
  /\b(Learning Goal|Activity|Detailed Procedure|Detailed procedure|Teaching Tips|Teaching Tip|Concept|Hook)\s*:/g;

function injectHeadingHighlights(text) {
  const withLineBreaks = text.replace(HEADING_PATTERN, (match, heading, offset) => {
    const needsBreak = offset > 0 && text[offset - 1] !== '\n';
    return `${needsBreak ? '\n' : ''}^${heading}:^`;
  });
  return withLineBreaks;
}

function parseInlineSegments(text) {
  const normalizedText = text;
  const segments = [];
  let buffer = '';
  let bold = false;

  for (let i = 0; i < normalizedText.length; i += 1) {
    const char = normalizedText[i];
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

  const normalizedText = injectHeadingHighlights(rawText);
  const lines = normalizedText.split('\n');
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
