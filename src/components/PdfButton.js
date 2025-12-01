import React from 'react';

export default function PdfButton({ href }) {
  if (!href) {
    return <span className="doc-button doc-button--disabled">PDF unavailable</span>;
  }

  return (
    <a className="doc-button" href={href} target="_blank" rel="noreferrer">
      Open PDF
    </a>
  );
}
