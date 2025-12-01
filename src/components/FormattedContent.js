import React, { useMemo } from 'react';
import { parseLessonContent } from '../utils/contentParser';

function InlineText({ segments }) {
  return segments.map((segment, index) => {
    if (!segment.text) return null;
    if (segment.bold) {
      return (
        <strong key={`inline-${index}`} className="formatted-content__inline-bold">
          {segment.text}
        </strong>
      );
    }
    return (
      <span key={`inline-${index}`} className="formatted-content__inline">
        {segment.text}
      </span>
    );
  });
}

export default function FormattedContent({ text }) {
  const blocks = useMemo(() => parseLessonContent(text), [text]);

  if (!blocks.length) {
    return null;
  }

  return (
    <div className="formatted-content">
      {blocks.map((block, index) => {
        if (block.type === 'bullet') {
          return (
            <div
              key={`content-block-${index}`}
              className={`formatted-content__bullet formatted-content__bullet--level-${block.level}`}
            >
              <span className="formatted-content__bullet-symbol">•</span>
              <div className="formatted-content__bullet-text">
                <InlineText segments={block.children} />
              </div>
            </div>
          );
        }

        return (
          <p key={`content-block-${index}`} className="formatted-content__paragraph">
            <InlineText segments={block.children} />
          </p>
        );
      })}
    </div>
  );
}
