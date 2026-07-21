const path = require('path');
const { DatabaseSync } = require('node:sqlite');

// When running inside Electron, keep shop.db in the OS's per-user app-data
// folder (the packaged app's install directory is read-only). When running
// as a plain `node server.js` process (the original LAN-server setup),
// keep it next to the project like before.
let dataDir = __dirname;
if (process.versions && process.versions.electron) {
  try {
    const { app } = require('electron');
    dataDir = app.getPath('userData');
  } catch (e) {
    // 'electron' module not resolvable in this context — fall back to __dirname
  }
}

const DB_PATH = path.join(dataDir, 'shop.db');
const db = new DatabaseSync(DB_PATH);
// Enable Write-Ahead Logging to reduce locking issues
db.exec('PRAGMA journal_mode=WAL;');


  // Ensure data/images directory exists for storing uploaded images
  const fs = require('fs');
  // duplicate path import removed
  const imagesDir = path.join(__dirname, 'data', 'images');
  if (!fs.existsSync(imagesDir)) { fs.mkdirSync(imagesDir, { recursive: true }); }

db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    shop_name TEXT NOT NULL DEFAULT 'My Spare Parts Shop',
    shop_desc TEXT,
    shop_logo TEXT,
    currency TEXT NOT NULL DEFAULT 'Rs.',
    tax_rate REAL NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS parts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sku TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL DEFAULT 'Other',
    cost REAL NOT NULL DEFAULT 0,
    price REAL NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    threshold INTEGER NOT NULL DEFAULT 5,
    image_path TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL DEFAULT (datetime('now')),
    subtotal REAL NOT NULL,
    discount REAL NOT NULL,
    tax REAL NOT NULL,
    total REAL NOT NULL,
    payment_method TEXT NOT NULL,
    amount_received REAL NOT NULL,
    change_due REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sale_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    part_id INTEGER REFERENCES parts(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    sku TEXT NOT NULL,
    qty INTEGER NOT NULL,
    price REAL NOT NULL
  );
`);

// Ensure image_path column exists (ignore if already present)
try { db.exec('ALTER TABLE parts ADD COLUMN image_path TEXT;'); } catch (e) { console.log('image_path column may already exist'); }
try { db.exec('ALTER TABLE settings ADD COLUMN shop_desc TEXT;'); } catch (e) {}
try { db.exec('ALTER TABLE settings ADD COLUMN shop_logo TEXT;'); } catch (e) {}

// Ensure a single settings row always exists
db.prepare(`INSERT OR IGNORE INTO settings (id, shop_name, currency, tax_rate) VALUES (1, 'My Spare Parts Shop', 'Rs.', 0)`).run();

// Seed demo parts only on first run (empty catalog)
const partCount = db.prepare('SELECT COUNT(*) AS c FROM parts').get().c;
if (partCount === 0) {
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
}

module.exports = db;
