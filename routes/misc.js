const express = require('express');
const db = require('../db');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const upload = multer({ dest: path.join(__dirname, '..', 'data', 'images') });

router.get('/settings', (req, res) => {
  res.json(db.prepare('SELECT * FROM settings WHERE id = 1').get());
});

router.put('/settings', upload.single('logo'), (req, res) => {
  const existing = db.prepare('SELECT * FROM settings WHERE id = 1').get();
  const { shop_name, shop_desc, currency, tax_rate } = req.body;
  let newLogo = existing.shop_logo;
  if (req.file) {
    if (existing.shop_logo) {
      const oldPath = path.join(__dirname, '..', 'data', 'images', path.basename(existing.shop_logo));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    newLogo = path.join('images', req.file.filename).replace(/\\/g, '/');
  }
  
  db.prepare('UPDATE settings SET shop_name=?, shop_desc=?, currency=?, tax_rate=?, shop_logo=? WHERE id=1').run(
    shop_name ?? existing.shop_name,
    shop_desc ?? existing.shop_desc,
    currency ?? existing.currency,
    tax_rate !== undefined && tax_rate !== '' ? Number(tax_rate) : existing.tax_rate,
    newLogo
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

module.exports = router;
