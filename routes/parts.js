const express = require('express');
const db = require('../db');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const upload = multer({ dest: path.join(__dirname, '..', 'data', 'images') });

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM parts ORDER BY name').all();
  res.json(rows);
});

router.get('/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM parts WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Part not found' });
    return res.json(row);
  } catch (e) {
    console.error('Error fetching part:', e);
    return res.status(500).json({ error: `Could not fetch part: ${e.message}` });
  }
});

router.post('/', upload.single('image'), (req, res) => {
  const { name, sku, category, cost, price, stock, threshold } = req.body;
  if (!name || !sku) return res.status(400).json({ error: 'name and sku are required' });
  const imagePath = req.file ? `images/${req.file.filename}` : null;
  try {
    const info = db.prepare(
      `INSERT INTO parts (name, sku, category, cost, price, stock, threshold, image_path) VALUES (?,?,?,?,?,?,?,?)`
    ).run(
      name,
      sku,
      category || 'Other',
      Number(cost) || 0,
      Number(price) || 0,
      Number(stock) || 0,
      Number(threshold) || 0,
      imagePath
    );
    const row = db.prepare('SELECT * FROM parts WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(row);
  } catch (e) {
    console.error('Error creating part:', e);
    if (String(e.message).includes('UNIQUE')) return res.status(409).json({ error: 'A part with that SKU already exists' });
    res.status(500).json({ error: `Could not create part: ${e.message}` });
  }
});

router.put('/:id', upload.single('image'), (req, res) => {
  const existing = db.prepare('SELECT * FROM parts WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Part not found' });
  const { name, sku, category, cost, price, stock, threshold } = req.body;
  let newImagePath = existing.image_path;
  if (req.file) {
    // Delete old image file if it exists
    if (existing.image_path) {
      const oldPath = path.join(__dirname, '..', 'data', 'images', path.basename(existing.image_path));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    newImagePath = path.join('images', req.file.filename);
  }
  try {
    db.prepare(
      `UPDATE parts SET name=?, sku=?, category=?, cost=?, price=?, stock=?, threshold=?, image_path=? WHERE id=?`
    ).run(
      name ?? existing.name,
      sku ?? existing.sku,
      category ?? existing.category,
      cost !== undefined ? Number(cost) : existing.cost,
      price !== undefined ? Number(price) : existing.price,
      stock !== undefined ? Number(stock) : existing.stock,
      threshold !== undefined ? Number(threshold) : existing.threshold,
      newImagePath,
      req.params.id
    );
    res.json(db.prepare('SELECT * FROM parts WHERE id = ?').get(req.params.id));
  } catch (e) {
    if (String(e.message).includes('UNIQUE')) return res.status(409).json({ error: 'A part with that SKU already exists' });
    res.status(500).json({ error: 'Could not update part' });
  }
});

router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM parts WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Part not found' });
  res.status(204).end();
});

module.exports = router;
