const express = require('express');
const db = require('../db');
const router = express.Router();

function getSaleWithItems(saleId) {
  const sale = db.prepare('SELECT * FROM sales WHERE id = ?').get(saleId);
  if (!sale) return null;
  sale.items = db.prepare('SELECT * FROM sale_items WHERE sale_id = ?').all(saleId);
  return sale;
}

router.get('/', (req, res) => {
  const sales = db.prepare('SELECT * FROM sales ORDER BY id DESC').all();
  const items = db.prepare('SELECT * FROM sale_items').all();
  const byId = {};
  for (const s of sales) { s.items = []; byId[s.id] = s; }
  for (const it of items) { if (byId[it.sale_id]) byId[it.sale_id].items.push(it); }
  res.json(sales);
});

router.get('/:id', (req, res) => {
  const sale = getSaleWithItems(req.params.id);
  if (!sale) return res.status(404).json({ error: 'Sale not found' });
  res.json(sale);
});

// Checkout: validates stock, records the sale, and decrements inventory atomically.
router.post('/', (req, res) => {
  const { items, discount, tax, paymentMethod, amountReceived } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'At least one item is required' });
  }

  const getPart = db.prepare('SELECT * FROM parts WHERE id = ?');
  const resolved = [];
  let subtotal = 0;

  for (const line of items) {
    const part = getPart.get(line.partId);
    if (!part) return res.status(400).json({ error: `Part ${line.partId} not found` });
    const qty = Number(line.qty) || 0;
    if (qty <= 0) return res.status(400).json({ error: `Invalid quantity for ${part.name}` });
    if (qty > part.stock) return res.status(409).json({ error: `Not enough stock for ${part.name} (have ${part.stock}, need ${qty})` });
    resolved.push({ part, qty });
    subtotal += part.price * qty;
  }

  const discountAmt = Number(discount) || 0;
  const taxAmt = Number(tax) || 0;
  const total = subtotal - discountAmt + taxAmt;
  const received = paymentMethod === 'Cash' ? (Number(amountReceived) || 0) : total;
  if (paymentMethod === 'Cash' && received < total) {
    return res.status(400).json({ error: 'Amount received is less than the total' });
  }
  const changeDue = paymentMethod === 'Cash' ? Math.max(0, received - total) : 0;

  db.exec('BEGIN');
  try {
    const saleInfo = db.prepare(
      `INSERT INTO sales (subtotal, discount, tax, total, payment_method, amount_received, change_due)
       VALUES (?,?,?,?,?,?,?)`
    ).run(subtotal, discountAmt, taxAmt, total, paymentMethod || 'Cash', received, changeDue);

    const insertItem = db.prepare(
      `INSERT INTO sale_items (sale_id, part_id, name, sku, qty, price) VALUES (?,?,?,?,?,?)`
    );
    const decrementStock = db.prepare('UPDATE parts SET stock = stock - ? WHERE id = ?');

    for (const { part, qty } of resolved) {
      insertItem.run(saleInfo.lastInsertRowid, part.id, part.name, part.sku, qty, part.price);
      decrementStock.run(qty, part.id);
    }

    db.exec('COMMIT');
    res.status(201).json(getSaleWithItems(saleInfo.lastInsertRowid));
  } catch (e) {
    db.exec('ROLLBACK');
    res.status(500).json({ error: 'Checkout failed, no changes were made' });
  }
});

module.exports = router;
