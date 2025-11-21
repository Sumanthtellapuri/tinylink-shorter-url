const express = require('express');
const router = express.Router();
const db = require('../db');
const validUrl = require('valid-url');
const crypto = require('crypto');

const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

function generateCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const random = crypto.randomBytes(length);
  return [...random].map(x => chars[x % chars.length]).join('');
}

// Create link
router.post('/', async (req, res) => {
  const { url, code } = req.body;

  if (!url || !validUrl.isWebUri(url)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  let finalCode = code ? code.trim() : generateCode(6);
  if (!CODE_REGEX.test(finalCode)) {
    return res.status(400).json({ error: 'Code must be 6–8 alphanumeric characters' });
  }

  try {
    await db.query(
      'INSERT INTO links (code, url) VALUES ($1, $2)',
      [finalCode, url]
    );

    return res.status(201).json({ code: finalCode, url });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Code already exists' });
    }
    return res.status(500).json({ error: 'Server error' });
  }
});

// List links
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT code, url, clicks, last_clicked, created_at FROM links ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Stats for one link
router.get('/:code', async (req, res) => {
  const code = req.params.code;
  if (!CODE_REGEX.test(code)) return res.status(400).json({ error: 'Invalid code' });

  try {
    const { rows } = await db.query(
      'SELECT * FROM links WHERE code=$1',
      [code]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete link
router.delete('/:code', async (req, res) => {
  const code = req.params.code;
  console.log('DELETE request for code:', code);

  try {
    const result = await db.query(
      'DELETE FROM links WHERE code=$1',
      [code]
    );

    console.log('Delete result rowCount:', result.rowCount);

    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 
