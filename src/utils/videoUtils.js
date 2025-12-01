export const YOUTUBE_ID_REGEX =
  /(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?(?:.*&)?v=|v\/))([A-Za-z0-9_-]{11})/;

export const getYoutubeEmbedUrl = (url) => {
  if (!url) return '';
  const match = url.match(YOUTUBE_ID_REGEX);
  if (match) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return url;
};

export const getYoutubeWatchUrl = (url) => {
  if (!url) return '';
  const match = url.match(YOUTUBE_ID_REGEX);
  if (match) {
    return `https://www.youtube.com/watch?v=${match[1]}`;
  }
  return url;
};
