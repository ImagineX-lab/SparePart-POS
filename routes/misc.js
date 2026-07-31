const express = require('express');
const db = require('../db');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

let dataDir = path.join(__dirname, '..');
if (process.versions && process.versions.electron) {
  try { dataDir = require('electron').app.getPath('userData'); } catch (e) {}
}
const upload = multer({ dest: path.join(dataDir, 'data', 'images') });

router.get('/settings', (req, res) => {
  res.json(db.prepare('SELECT * FROM settings WHERE id = 1').get());
});

router.put('/settings', upload.single('logo'), (req, res) => {
  const existing = db.prepare('SELECT * FROM settings WHERE id = 1').get();
  const { shop_name, shop_desc, currency, tax_rate, logo_size, ui_font_size } = req.body;
  let newLogo = existing.shop_logo;
  if (req.file) {
    if (existing.shop_logo) {
      const oldPath = path.join(dataDir, 'data', 'images', path.basename(existing.shop_logo));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    newLogo = path.join('images', req.file.filename).replace(/\\/g, '/');
  }
  
  db.prepare('UPDATE settings SET shop_name=?, shop_desc=?, currency=?, tax_rate=?, shop_logo=?, logo_size=?, ui_font_size=? WHERE id=1').run(
    shop_name ?? existing.shop_name,
    shop_desc ?? existing.shop_desc,
    currency ?? existing.currency,
    tax_rate !== undefined && tax_rate !== '' ? Number(tax_rate) : existing.tax_rate,
    newLogo,
    logo_size !== undefined && logo_size !== '' ? Number(logo_size) : existing.logo_size,
    ui_font_size ?? existing.ui_font_size
  );
  res.json(db.prepare('SELECT * FROM settings WHERE id = 1').get());
});

router.get('/dashboard', (req, res) => {
  const parts = db.prepare('SELECT * FROM parts').all();
  const today = new Date().toISOString().slice(0, 10);
  const todaySales = db.prepare(`SELECT * FROM sales WHERE date LIKE ?`).all(today + '%');
  const revenueToday = todaySales.reduce((a, s) => a + s.total, 0);
  const invValue = parts.reduce((a, p) => a + p.stock * p.cost, 0);
  const lowStock = parts.filter(p => p.stock <= p.threshold);

  const topRows = db.prepare(`
    SELECT part_id, name, sku, SUM(qty) AS qty, SUM(qty * price) AS revenue
    FROM sale_items
    WHERE part_id IS NOT NULL
    GROUP BY part_id
    ORDER BY qty DESC
    LIMIT 5
  `).all();

  res.json({
    revenueToday,
    salesToday: todaySales.length,
    partsCount: parts.length,
    lowStockCount: lowStock.length,
    inventoryValue: invValue,
    lowStock,
    topSelling: topRows
  });
});

router.post('/reset', (req, res) => {
  db.exec('DELETE FROM sale_items; DELETE FROM sales; DELETE FROM parts;');
  // Remove all uploaded images from data/images
  try {
    const imagesDir = path.join(dataDir, 'data', 'images');
    if (fs.existsSync(imagesDir)) {
      for (const f of fs.readdirSync(imagesDir)) {
        // skip hidden files (like .gitkeep) and directories
        if (!f || f.startsWith('.')) continue;
        const p = path.join(imagesDir, f);
        try { if (fs.lstatSync(p).isFile()) fs.unlinkSync(p); } catch (e) { /* ignore individual file errors */ }
      }
    }
  } catch (e) {
    console.error('Error clearing images directory:', e);
  }

  // Reset settings to defaults (clear shop logo and description)
  try {
    db.prepare("UPDATE settings SET shop_name = ?, shop_desc = NULL, currency = ?, tax_rate = ?, shop_logo = NULL, ui_font_size = 'small' WHERE id = 1")
      .run('My Spare Parts Shop', 'Rs.', 0);
  } catch (e) { console.error('Error resetting settings:', e); }

  const seed = [
    ['Brake Pad Set - Front', 'BRK-1042', 'Brakes', 18.00, 32.00, 24, 5],
    ['Brake Pad Set - Rear', 'BRK-1043', 'Brakes', 16.00, 28.00, 18, 5],
    ['Engine Oil Filter', 'FLT-2210', 'Filters', 3.50, 7.50, 60, 10],
    ['Air Filter - Standard', 'FLT-2233', 'Filters', 4.00, 8.50, 42, 10],
    ['Spark Plug (single)', 'ELC-3305', 'Electrical', 2.20, 4.50, 120, 20],
    ['12V Car Battery 45Ah', 'ELC-3390', 'Electrical', 55.00, 89.00, 6, 2],
    ['Shock Absorber - Front', 'SUS-4410', 'Suspension', 34.00, 62.00, 10, 3],
    ['Radiator Coolant 1L', 'FLU-5501', 'Fluids', 5.00, 9.50, 30, 8],
    ['Headlight Bulb H4', 'ELC-3410', 'Electrical', 3.00, 6.00, 4, 10],
    ['Timing Belt Kit', 'ENG-6601', 'Engine', 28.00, 54.00, 8, 3]
  ];
  const insert = db.prepare(`INSERT INTO parts (name, sku, category, cost, price, stock, threshold) VALUES (?,?,?,?,?,?,?)`);
  for (const p of seed) insert.run(...p);
  res.status(204).end();
});

// POST /api/backup — copies shop.db to <Desktop>/Desktop Backups/backup-YYYY-MM-DD.db
router.post('/backup', (req, res) => {
  try {
    const desktopPath = path.join(os.homedir(), 'Desktop');
    const backupDir = path.join(desktopPath, 'Desktop Backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Resolve the live shop.db location the same way db.js does
    let dataDir = path.join(__dirname, '..');
    if (process.versions && process.versions.electron) {
      try {
        const { app } = require('electron');
        dataDir = app.getPath('userData');
      } catch (e) {
        // fall back to project dir if not resolvable
      }
    }
    const dbPath = path.join(dataDir, 'shop.db');

    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ error: 'Database file not found, nothing to back up' });
    }

    const now = new Date();
    const stamp = now.toISOString().slice(0, 10); // YYYY-MM-DD
    let fileName = `backup-${stamp}.db`;
    let backupPath = path.join(backupDir, fileName);

    // Avoid clobbering a same-day backup — append HH-MM-SS if one already exists
    if (fs.existsSync(backupPath)) {
      const timeStamp = now.toTimeString().slice(0, 8).replace(/:/g, '-');
      fileName = `backup-${stamp}_${timeStamp}.db`;
      backupPath = path.join(backupDir, fileName);
    }

    fs.copyFileSync(dbPath, backupPath);
    res.json({ success: true, path: backupPath, fileName });
  } catch (e) {
    console.error('Backup failed:', e);
    res.status(500).json({ error: `Backup failed: ${e.message}` });
  }
});

module.exports = router;
