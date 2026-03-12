export function buildBookCatalog() {
  const context = require.context('../', true, /\.json$/);
  const classes = {};

  context.keys().forEach((key) => {
    const match = key.match(/^\.\/([^/]+)\/([^/]+)\.json$/);
    if (!match) {
      return;
    }

    const className = match[1];
    const fileName = match[2];

    if (['assets', 'components', 'utils', 'letter-data'].includes(className)) {
      return;
    }

    const raw = context(key);
    const data = raw?.default ?? raw;

    if (!data || typeof data !== 'object') {
      return;
    }

    if (!data.book || !Array.isArray(data.topics)) {
      return;
    }

    if (!classes[className]) {
      classes[className] = [];
    }

    classes[className].push({
      key,
      fileName,
      book: data.book,
      topics: data.topics,
    });
  });

  Object.values(classes).forEach((books) => {
    books.sort((a, b) => a.book.localeCompare(b.book));
  });

  return classes;
}
