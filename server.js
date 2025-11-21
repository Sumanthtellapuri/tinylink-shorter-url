// server.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const path = require('path');
const linksRouter = require('./routes/links');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/healthz', (req, res) => {
  res.json({ ok: true, version: '1.0' });
});

// API routes
app.use('/api/links', linksRouter);

// Stats page
app.get('/code/:code', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'code.html'));
});

// Redirect route (must be LAST)
app.get('/:code', async (req, res) => {
  const code = req.params.code;

  // Reserved paths
  if (['api', 'code', 'healthz'].includes(code)) {
    return res.status(404).send('Not Found');
  }

  try {
    const { rows } = await db.query(
      'SELECT url FROM links WHERE code=$1',
      [code]
    );

    if (rows.length === 0) return res.status(404).send('Not Found');

    await db.query(
      'UPDATE links SET clicks = clicks + 1, last_clicked = now() WHERE code=$1',
      [code]
    );

    return res.redirect(302, rows[0].url);
  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal server error');
  }
});

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
