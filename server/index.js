const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

const lessonsPath = path.join(__dirname, '..', 'src', 'lessons.json');
const srcRoot = path.join(__dirname, '..', 'src');
const ignoredFolders = new Set(['assets', 'components', 'utils', 'letter-data']);

app.use(express.json({ limit: '2mb' }));

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));
const writeJson = (filePath, data) =>
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

const buildCatalog = () => {
  const catalog = {};
  const folders = fs.readdirSync(srcRoot, { withFileTypes: true });

  folders.forEach((entry) => {
    if (!entry.isDirectory() || ignoredFolders.has(entry.name)) {
      return;
    }

    const classDir = path.join(srcRoot, entry.name);
    const files = fs.readdirSync(classDir, { withFileTypes: true });
    const books = [];

    files.forEach((file) => {
      if (!file.isFile() || !file.name.endsWith('.json')) {
        return;
      }

      const filePath = path.join(classDir, file.name);
      try {
        const data = readJson(filePath);
        if (!data || typeof data !== 'object' || !data.book || !Array.isArray(data.topics)) {
          return;
        }

        books.push({
          key: `./${entry.name}/${file.name.replace(/\.json$/, '')}.json`,
          fileName: file.name.replace(/\.json$/, ''),
          book: data.book,
          topics: data.topics,
        });
      } catch (err) {
        return;
      }
    });

    if (books.length > 0) {
      books.sort((a, b) => a.book.localeCompare(b.book));
      catalog[entry.name] = books;
    }
  });

  return catalog;
};

app.get('/api/lessons', (req, res) => {
  try {
    const lessons = readJson(lessonsPath);
    res.json({ lessons });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read lessons.json' });
  }
});

app.get('/api/books/catalog', (req, res) => {
  try {
    const catalog = buildCatalog();
    res.json({ catalog });
  } catch (err) {
    res.status(500).json({ error: 'Failed to build catalog' });
  }
});

app.post('/books/add', (req, res) => {
  const { className, month, day, lesson } = req.body || {};

  if (!className || !month || !day || !lesson) {
    res.status(400).json({ error: 'className, month, day, and lesson are required' });
    return;
  }

  try {
    const lessons = readJson(lessonsPath);

    if (!lessons[className]) {
      lessons[className] = { months: {} };
    }
    if (!lessons[className].months) {
      lessons[className].months = {};
    }
    if (!lessons[className].months[month]) {
      lessons[className].months[month] = { days: {} };
    }
    if (!lessons[className].months[month].days) {
      lessons[className].months[month].days = {};
    }
    if (!lessons[className].months[month].days[day]) {
      lessons[className].months[month].days[day] = { lessons: [] };
    }

    const dayEntry = lessons[className].months[month].days[day];
    if (!Array.isArray(dayEntry.lessons)) {
      dayEntry.lessons = [];
    }

    if (dayEntry.lessons.length >= 6) {
      res.status(400).json({ error: 'A day can have at most 6 lessons.' });
      return;
    }

    dayEntry.lessons.push(lesson);
    writeJson(lessonsPath, lessons);
    res.json({ ok: true, lessons });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update lessons.json' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
