const VIDEO_MIME_TYPE_MAP = {
  mp4: 'video/mp4',
  webm: 'video/webm',
  ogg: 'video/ogg',
};

const getVideoExtension = (url) => {
  if (!url) return '';
  const match = url.match(/\\.([a-z0-9]+)(?:[?#].*)?$/i);
  return match ? match[1].toLowerCase() : '';
};

export const getVideoMimeType = (url) => {
  const ext = getVideoExtension(url);
  return VIDEO_MIME_TYPE_MAP[ext] || '';
};

export const isDirectVideoUrl = (url) => Boolean(getVideoMimeType(url));
