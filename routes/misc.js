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
  const { shop_name, shop_desc, currency, tax_rate, logo_size } = req.body;
  let newLogo = existing.shop_logo;
  if (req.file) {
    if (existing.shop_logo) {
      const oldPath = path.join(dataDir, 'data', 'images', path.basename(existing.shop_logo));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    newLogo = path.join('images', req.file.filename).replace(/\\/g, '/');
  }
  
  db.prepare('UPDATE settings SET shop_name=?, shop_desc=?, currency=?, tax_rate=?, shop_logo=?, logo_size=? WHERE id=1').run(
    shop_name ?? existing.shop_name,
    shop_desc ?? existing.shop_desc,
    currency ?? existing.currency,
    tax_rate !== undefined && tax_rate !== '' ? Number(tax_rate) : existing.tax_rate,
    newLogo,
    logo_size !== undefined && logo_size !== '' ? Number(logo_size) : existing.logo_size
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
  
  // Get current shop logo to avoid deleting it
  let shopLogoFile = null;
  try {
    const settings = db.prepare('SELECT shop_logo FROM settings WHERE id = 1').get();
    if (settings && settings.shop_logo) {
      shopLogoFile = path.basename(settings.shop_logo);
    }
  } catch (e) {}

  // Remove all uploaded images from data/images EXCEPT the shop logo
  try {
    const imagesDir = path.join(dataDir, 'data', 'images');
    if (fs.existsSync(imagesDir)) {
      for (const f of fs.readdirSync(imagesDir)) {
        if (!f || f.startsWith('.')) continue;
        if (f === shopLogoFile) continue; // Skip shop logo
        const p = path.join(imagesDir, f);
        try { if (fs.lstatSync(p).isFile()) fs.unlinkSync(p); } catch (e) { /* ignore individual file errors */ }
      }
    }
  } catch (e) {
    console.error('Error clearing images directory:', e);
  }

  // NOTE: Settings are NOT reset, and demo parts are NOT seeded.
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

    // Use VACUUM INTO to create a safe, consistent backup even in WAL mode
    db.exec(`VACUUM INTO '${backupPath.replace(/'/g, "''")}';`);
    
    res.json({ success: true, path: backupPath, fileName });
  } catch (e) {
    console.error('Backup failed:', e);
    res.status(500).json({ error: `Backup failed: ${e.message}` });
  }
});

const uploadDb = multer({ dest: os.tmpdir() });

router.post('/restore', uploadDb.single('backup'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No backup file provided' });
  try {
    // We attach the uploaded DB to safely copy data without closing the main DB
    db.exec(`ATTACH DATABASE '${req.file.path.replace(/'/g, "''")}' AS restore_db;`);
    
    try {
      db.exec(`
        DELETE FROM sale_items;
        DELETE FROM sales;
        DELETE FROM parts;
        DELETE FROM settings;
      `);
      
      // We use INSERT OR IGNORE just in case, but really we just want to copy if tables exist.
      // If the backup doesn't have the table, it'll throw and we catch it below.
      db.exec(`
        INSERT INTO settings SELECT * FROM restore_db.settings;
        INSERT INTO parts SELECT * FROM restore_db.parts;
        INSERT INTO sales SELECT * FROM restore_db.sales;
        INSERT INTO sale_items SELECT * FROM restore_db.sale_items;
      `);

      // Restore AUTOINCREMENT sequences (ignore if sequence table missing in backup)
      try {
        db.exec(`
          DELETE FROM sqlite_sequence WHERE name IN ('parts', 'sales', 'sale_items');
          INSERT INTO sqlite_sequence SELECT * FROM restore_db.sqlite_sequence WHERE name IN ('parts', 'sales', 'sale_items');
        `);
      } catch (seqErr) {
        // ignore if sequence fails
      }
    } finally {
      // Ensure we always detach the DB so the file handle is released
      db.exec(`DETACH DATABASE restore_db;`);
    }

    fs.unlinkSync(req.file.path);
    res.json({ success: true });
  } catch (e) {
    console.error('Restore failed:', e);
    try { if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path); } catch(ex){}
    res.status(500).json({ error: `Restore failed: ${e.message}` });
  }
});

module.exports = router;
