/* ---------- API HELPER ---------- */
async function api(path, options = {}) {
  const res = await fetch('/api' + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) {
    let msg = 'Request failed';
    try { msg = (await res.json()).error || msg; } catch (e) { }
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json();
}

// Helper for multipart/form-data (e.g., image upload)
async function apiFormData(path, options = {}) {
  const res = await fetch('/api' + path, {
    ...options
    // No explicit Content-Type; browser sets boundary
  });
  if (!res.ok) {
    let msg = 'Request failed';
    try { msg = (await res.json()).error || msg; } catch (e) { }
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json();
}



/* ---------- LOCAL CACHES (kept in sync with the server) ---------- */
let partsCache = [];

const DEFAULT_SHOP_NAME = 'KN Motors';
const DEFAULT_SHOP_DESC = 'Automotive spare parts & accessories';
let settings = { shop_name: DEFAULT_SHOP_NAME, shop_desc: DEFAULT_SHOP_DESC, currency: 'Rs.', tax_rate: 0 };
let cart = []; // {partId, qty}
// track recent quantity changes to allow visual highlighting (e.g., qty decreased)
let lastQtyChange = {}; // partId -> { delta: number, ts: epoch }

function markQtyChange(partId, delta) {
  lastQtyChange[partId] = { delta, ts: Date.now() };
  // auto-clear after animation window
  setTimeout(() => { if (lastQtyChange[partId] && Date.now() - lastQtyChange[partId].ts > 1100) delete lastQtyChange[partId]; }, 1200);
}

/* ---------- UTIL ---------- */
function fmt(n) {
  return settings.currency + ' ' + (Math.round((n || 0) * 100) / 100).toFixed(2);
}
function amountParts(n) {
  const cents = Math.round((n || 0) * 100);
  const whole = Math.floor(Math.abs(cents) / 100);
  const fraction = String(Math.abs(cents) % 100).padStart(2, '0');
  return { whole: (cents < 0 ? '-' : '') + whole, fraction };
}
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.remove('show'), 2400);
}
// Show desktop/browser notification for low-stock items with sensible fallbacks
function showLowStockNotification(d) {
  try {
    const title = `🔔 ${d.lowStockCount} low stock item(s)`;
    const body = (d.lowStock || []).slice(0, 6).map(p => `${p.name} — ${p.stock}`).join('\n');
    // simple embedded bell SVG as a data URL so notifications show a bell icon
    const bellSvg = encodeURIComponent(`
      <svg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 24 24' fill='none' stroke='%231b1b1b' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'>
        <path d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5'/>
        <path d='M13.73 21a2 2 0 01-3.46 0'/>
      </svg>
    `);
    const iconDataUrl = `data:image/svg+xml;utf8,${bellSvg}`;
    // If Notifications API available
    if (window.Notification) {
      if (Notification.permission === 'granted') {
        const n = new Notification(title, { body, silent: false, icon: iconDataUrl });
        n.onclick = () => { window.focus(); showLowStockPanel(); n.close(); };
        return;
      }
      if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(perm => {
          if (perm === 'granted') showLowStockNotification(d);
          else showToast(`🔔 ${d.lowStockCount} low-stock item(s). Click the bell to view.`);
        });
        return;
      }
    }
    // Fallback: show a brief toast and ensure top badge is visible
    showToast(`🔔 ${d.lowStockCount} item(s) running low — click the bell to view.`);
  } catch (e) {
    // never crash UI
    console.error('low stock notify error', e);
  }
}
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}
function formatShopName(name){
  const s = String(name || '');
  if(!s) return '';
  // take first two characters as initials and wrap them for special styling
  const firstTwo = esc(s.slice(0,2));
  const rest = esc(s.slice(2));
  return `<span class="r-shop-initials">${firstTwo}</span><span class="r-shop-rest">${rest}</span>`;
}
function stockZone(part) {
  if (part.stock <= part.threshold) return 'bad';
  if (part.stock <= part.threshold * 2) return 'warn';
  return 'good';
}
function gaugeHtml(part) {
  const zone = stockZone(part);
  const max = Math.max(part.stock, part.threshold * 3, 1);
  const fillPct = Math.min(100, (part.stock / max) * 100);
  const markPct = Math.min(100, (part.threshold / max) * 100);
  return `<div class="gauge">
    <div class="gauge-track">
      <div class="gauge-fill ${zone}" style="width:${fillPct}%"></div>
      <div class="gauge-mark" style="left:${markPct}%"></div>
    </div>
    <div class="gauge-num mono">${part.stock} ${t('gen_units')}</div>
  </div>`;
}

/* ---------- NAV ---------- */
const NAV = [
  { id: 'pos',       icon: '🛒', label: 'විකුණුම්',  sub: 'Ring up a sale' },
  { id: 'dashboard', icon: '🏠', label: 'මුල් පිටුව', sub: "Today's snapshot" },
  { id: 'inventory', icon: '📦', label: 'තොග',        sub: 'Manage your parts catalog' },
  { id: 'history',   icon: '🧾', label: 'බිල්',       sub: 'Past transactions' },
  { id: 'settings',  icon: '⚙️', label: 'සැකසුම්',   sub: 'Shop configuration' }
];
function renderNav() {
  document.getElementById('navlist').innerHTML = NAV.map(n =>
    `<button class="navbtn navbtn-lg" id="nav-${n.id}" onclick="switchView('${n.id}')">
       <span class="nav-icon">${n.icon}</span>
       <span class="nav-label">${n.label}</span>
     </button>`
  ).join('');
}
async function switchView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + id).classList.add('active');
  document.querySelectorAll('.navbtn').forEach(b => b.classList.remove('active'));
  document.getElementById('nav-' + id).classList.add('active');
  const meta = NAV.find(n => n.id === id);
  document.getElementById('pageTitle').textContent = meta.label;
  document.getElementById('pageSub').textContent = meta.sub;
  if (id === 'dashboard') await renderDashboard();
  if (id === 'pos') await renderPOS();
  if (id === 'inventory') await renderInventory();
  if (id === 'history') await renderHistory();
  if (id === 'settings') renderSettingsForm();
}

/* ---------- DATA REFRESH ---------- */
async function refreshParts() { partsCache = await api('/parts'); }
function setLowStockBadge(count){
  const el = document.getElementById('topNotifCount');
  if(!el) return;
  if(count && count > 0){
    el.textContent = String(count);
    el.style.display = 'inline-flex';
    el.classList.add('pulse');
  } else {
    el.style.display = 'none';
    el.classList.remove('pulse');
  }
}

async function showLowStockPanel(e){
  // toggle panel
  const existing = document.getElementById('notifPanel');
  if(existing){ existing.remove(); return; }
  // ensure partsCache is fresh
  await refreshParts();
  const low = (partsCache||[]).filter(p => Number(p.stock) <= Number(p.threshold));
  const panel = document.createElement('div');
  panel.id = 'notifPanel';
  panel.className = 'notif-panel';
  if(low.length === 0){
    panel.innerHTML = `<div class="notif-head">Notifications</div><div class="notif-empty">No low-stock items</div>`;
  } else {
    panel.innerHTML = `<div class="notif-head">Low stock items (${low.length})</div>` +
      `<div class="notif-list">` + low.map(p => `<div class="notif-item"><div class="ni-name">${esc(p.name)}</div><div class="ni-meta">${esc(p.sku)} — ${p.stock} ${t('gen_units')}</div><button class="btn btn-sm" onclick="switchView('inventory').then(()=>openPartModal(${p.id}));document.getElementById('notifPanel')?.remove()">Restock</button></div>`).join('') + `</div>`;
  }
  document.body.appendChild(panel);
  // position under clicked button (if event provided)
  const btn = e && e.currentTarget ? e.currentTarget : document.getElementById('topNotifBtn');
  if(btn){
    const r = btn.getBoundingClientRect();
    panel.style.left = Math.max(8, r.left) + 'px';
    panel.style.top = (r.bottom + 8) + 'px';
  }
}

// keep sidebar badge in sync after fetching parts
const _refreshParts = refreshParts;
refreshParts = async function(){
  await _refreshParts();
  try{
    const low = (partsCache||[]).filter(p => Number(p.stock) <= Number(p.threshold)).length;
    setLowStockBadge(low);
  }catch(e){}
}

async function refreshSettings() { settings = await api('/settings'); }

/* ---------- DASHBOARD ---------- */
async function renderDashboard() {
  const d = await api('/dashboard');
  
  // remove inline dashboard low-stock box; use a notification instead
  const notifArea = document.getElementById('dashNotificationArea');
  if (notifArea) notifArea.innerHTML = '';
  if (d.lowStockCount > 0) {
    // show a desktop/browser notification (fallback to toast)
    showLowStockNotification(d);
  }
  setLowStockBadge(d.lowStockCount || 0);

  document.getElementById('dashCards').innerHTML = `
    <div class="stat"><div class="label">${t('dash_todayRev')}</div><div class="value accent">${fmt(d.revenueToday)}</div></div>
    <div class="stat"><div class="label">${t('dash_todaySales')}</div><div class="value">${d.salesToday}</div></div>
    <div class="stat"><div class="label">${t('dash_partsCat')}</div><div class="value">${d.partsCount}</div></div>
    <div class="stat"><div class="label">${t('dash_lowStockItems')}</div><div class="value ${d.lowStockCount ? 'bad' : ''}">${d.lowStockCount}</div></div>
    <div class="stat"><div class="label">${t('dash_invValue')}</div><div class="value">${fmt(d.inventoryValue)}</div></div>
  `;
  document.getElementById('lowStockBody').innerHTML = d.lowStock.length ? d.lowStock.map(p => `
    <tr><td>${esc(p.name)}</td><td class="mono">${esc(p.sku)}</td><td>${esc(p.category)}</td>
    <td>${gaugeHtml(p)}</td>
    <td><button class="btn btn-sm" onclick="switchView('inventory').then(()=>openPartModal(${p.id}))">Restock</button></td></tr>
  `).join('') : `<tr><td colspan="5" class="empty">Nothing running low — all parts are above threshold.</td></tr>`;

  document.getElementById('topSellBody').innerHTML = d.topSelling.length ? d.topSelling.map(t => `
    <tr><td>${esc(t.name)}</td><td class="mono">${esc(t.sku)}</td><td>${t.qty}</td><td class="mono">${fmt(t.revenue)}</td></tr>
  `).join('') : `<tr><td colspan="4" class="empty">No sales recorded yet. Ring up your first sale to see trends here.</td></tr>`;
}

/* ---------- POS ---------- */
function renderCategoryOptions() {
  const cats = [...new Set(partsCache.map(p => p.category).filter(Boolean))].sort();
  const sel = document.getElementById('posCategoryFilter');
  const cur = sel.value;
  sel.innerHTML = '<option value="">' + t('pos_allCat') + '</option>' + cats.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
  sel.value = cur;
  document.getElementById('catList').innerHTML = cats.map(c => `<option value="${esc(c)}">`).join('');
}

async function renderPOS() {
  await Promise.all([refreshParts(), refreshSettings()]);
  renderCategoryOptions();
  renderPosGrid();
  renderCart();
}
function renderPosGrid() {
  const q = document.getElementById('posSearch').value.trim().toLowerCase();
  const cat = document.getElementById('posCategoryFilter').value;
  const grid = document.getElementById('posGrid');
  const list = partsCache.filter(p => {
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    const matchC = !cat || p.category === cat;
    return matchQ && matchC;
  });
  grid.innerHTML = list.length ? list.map(p => {
    const imgBlock = p.image_path
      ? `<img src="/${esc(p.image_path)}" class="pos-thumb" alt="${esc(p.name)}"
           onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'pos-thumb-placeholder',textContent:'No image'}))">`
      : `<div class="pos-thumb-placeholder">No image</div>`;
    const zone = (p.stock <= 0) ? 'bad' : stockZone(p);
    return `
    <div class="part-card ${p.stock <= 0 ? 'oos' : ''}" onclick="${p.stock > 0 ? `addToCart(${p.id})` : ''}">
      ${imgBlock}
      <div class="sku mono">${esc(p.sku)}</div>
      <div class="name">${esc(p.name)}</div>
      <div class="price">${fmt(p.price)}</div>
      <div class="stockline ${zone}">${p.stock <= 0 ? 'Out of stock' : p.stock + ' in stock'}</div>
    </div>`;
  }).join('') : `<div class="empty">No parts match your search.</div>`;
}
function addToCart(partId) {
  const part = partsCache.find(p => p.id === partId);
  if (!part || part.stock <= 0) return;
  const line = cart.find(c => c.partId === partId);
  const currentQty = line ? line.qty : 0;
  if (currentQty + 1 > part.stock) { showToast('Not enough stock available.'); return; }
  if (line) line.qty++; else cart.push({ partId, qty: 1 });
  renderCart();
}
function changeQty(partId, delta) {
  const line = cart.find(c => c.partId === partId);
  if (!line) return;
  const part = partsCache.find(p => p.id === partId);
  const newQty = line.qty + delta;
  if (newQty <= 0) { cart = cart.filter(c => c.partId !== partId); }
  else if (newQty > part.stock) { showToast('Not enough stock available.'); return; }
  else { line.qty = newQty; }
  if (delta < 0) markQtyChange(partId, delta);
  renderCart();
}
function removeFromCart(partId) {
  cart = cart.filter(c => c.partId !== partId);
  renderCart();
}
function clearCart() {
  cart = [];
  document.getElementById('cashReceived').value = '';
  renderCart();
}
function cartTotals() {
  const subtotal = cart.reduce((a, c) => {
    const p = partsCache.find(x => x.id === c.partId);
    return a + (p ? p.price * c.qty : 0);
  }, 0);
  // Subtotal IS the total now — no discount/tax math, nothing sent to the backend for them.
  return { subtotal, discount: 0, tax: 0, total: subtotal };
}
function renderCart() {
  const box = document.getElementById('cartItems');
  box.innerHTML = cart.length ? cart.map(c => {
    const p = partsCache.find(x => x.id === c.partId);
    if (!p) return '';
    const ch = lastQtyChange[p.id];
    const decClass = ch && ch.delta < 0 && (Date.now() - ch.ts < 1200) ? 'qty-decreased' : '';
    return `<div class="cart-line">
      <div style="flex:1">
        <div class="ci-name">${esc(p.name)}</div>
        <div class="ci-sku mono">${esc(p.sku)}</div>
      </div>
      <div class="qty-ctl">
        <button style="color:var(--bad); border-color:var(--bad)" onclick="changeQty(${p.id},-1)">−</button>
        <span class="qty-num ${decClass}">${c.qty}</span>
        <button style="color:var(--good); border-color:var(--good)" onclick="changeQty(${p.id},1)">+</button>
      </div>
      <div class="ci-total mono">${fmt(p.price * c.qty)}</div>
      <button class="btn-ghost" style="color:var(--bad); font-weight:bold" onclick="removeFromCart(${p.id})" title="Remove">✕</button>
    </div>`;
  }).join('') : `<div class="empty">Cart is empty. Tap a part to add it.</div>`;

  const t = cartTotals();
  document.getElementById('tTotal').textContent = fmt(t.total);
  updateChange();
}
function updateChange() {
  const t = cartTotals();
  const method = document.getElementById('payMethod').value;
  const row = document.getElementById('cashRow');
  row.style.display = method === 'Cash' ? 'block' : 'none';
  const received = parseFloat(document.getElementById('cashReceived').value) || 0;
  const change = received - t.total;
  document.getElementById('changeDue').textContent = method === 'Cash'
    ? (received > 0 ? (change >= 0 ? 'Change due: ' + fmt(change) : 'Short by ' + fmt(-change)) : '')
    : '';
}
async function checkout() {
  if (cart.length === 0) { showToast('Add at least one part to the cart.'); return; }
  const t = cartTotals();
  const method = document.getElementById('payMethod').value;
  const received = parseFloat(document.getElementById('cashReceived').value) || 0;
  if (method === 'Cash' && received < t.total) { showToast('Amount received is less than the total.'); return; }

  const btn = document.getElementById('checkoutBtn');
  btn.disabled = true;
  try {
    const sale = await api('/sales', {
      method: 'POST',
      body: JSON.stringify({
        items: cart.map(c => ({ partId: c.partId, qty: c.qty })),
        discount: 0,
        tax: 0,
        paymentMethod: method,
        amountReceived: received
      })
    });
    showReceipt(sale, true); // Auto-print on checkout
    clearCart();
    await refreshParts();
    renderPosGrid();
  } catch (e) {
    showToast(e.message);
  } finally {
    btn.disabled = false;
  }
}

async function restoreBackup(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!confirm("මෙමගින් වත්මන් දත්ත අලුත් දත්ත වලින් වෙනස් වේ. ඉදිරියට යන්නේද?")) {
    event.target.value = "";
    return;
  }
  const formData = new FormData();
  formData.append('backup', file);
  try {
    const res = await fetch('/api/restore', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (res.ok && data.success) {
      alert("දත්ත සාර්ථකව යථා තත්ත්වයට පත් කරන ලදී!");
      location.reload();
    } else {
      showToast(data.error || 'Restore failed');
    }
  } catch (e) {
    showToast(e.message);
  } finally {
    event.target.value = "";
  }
}

/* ---------- INVENTORY ---------- */
async function renderInventory() {
  await refreshParts();
  filterInventory();
}
function filterInventory() {
  const q = document.getElementById('invSearch').value.trim().toLowerCase();
  const body = document.getElementById('invBody');
  const list = partsCache.filter(p => !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  body.innerHTML = list.length ? list.map(p => `
    <tr>
      <td>${esc(p.name)}</td>
      <td class="mono">${esc(p.sku)}</td>
      <td>${esc(p.category)}</td>
      <td class="mono">${fmt(p.cost)}</td>
      <td class="mono">${fmt(p.price)}</td>
      <td>${gaugeHtml(p)}</td>
      <td>${p.image_path ? `<img src="/${esc(p.image_path)}" class="part-thumb"/>` : ''}</td>
      <td>
        <div class="btn-stack">
          <button class="btn btn-sm" onclick="openPartModal(${p.id})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deletePart(${p.id})">Delete</button>
        </div>
      </td>
    </tr>
  `).join('') : `<tr><td colspan="9" class="empty">No parts found. Add your first part to get started.</td></tr>`;
}

function openPartModal(id) {
  document.getElementById('partId').value = id || '';
  document.getElementById('partModalTitle').textContent = id ? 'Edit Part' : 'Add Part';
  if (id) {
    const p = partsCache.find(x => x.id === id);
    document.getElementById('partName').value = p.name;
    document.getElementById('partSku').value = p.sku;
    document.getElementById('partCategory').value = p.category || '';
    document.getElementById('partCost').value = p.cost;
    document.getElementById('partPrice').value = p.price;
    document.getElementById('partStock').value = p.stock;
    document.getElementById('partThreshold').value = p.threshold;
    // Clear image input for fresh upload
    document.getElementById('partImage').value = '';
  } else {
    ['partName', 'partSku', 'partCategory', 'partCost', 'partPrice', 'partStock', 'partThreshold', 'partImage'].forEach(i => document.getElementById(i).value = '');
    document.getElementById('partThreshold').value = 5;
  }
  renderCategoryOptions();
  openModal('partModalBg');
}

async function savePart() {
  const id = document.getElementById('partId').value;
  const formData = new FormData();
  formData.append('name', document.getElementById('partName').value.trim());
  formData.append('sku', document.getElementById('partSku').value.trim());
  formData.append('category', document.getElementById('partCategory').value.trim() || 'Other');
  formData.append('cost', document.getElementById('partCost').value || 0);
  formData.append('price', document.getElementById('partPrice').value || 0);
  formData.append('stock', document.getElementById('partStock').value || 0);
  formData.append('threshold', document.getElementById('partThreshold').value || 0);
  const imgFile = document.getElementById('partImage').files[0];
  if (imgFile) formData.append('image', imgFile);
  if (!formData.get('name') || !formData.get('sku')) { showToast('Part name and SKU are required.'); return; }
  try {
    if (id) await apiFormData('/parts/' + id, { method: 'PUT', body: formData });
    else await apiFormData('/parts', { method: 'POST', body: formData });
    closeModal('partModalBg');
    await renderInventory();
    showToast('Part saved.');
  } catch (e) { showToast(e.message); }
}

async function deletePart(id) {
  if (!confirm('Delete this part? This cannot be undone.')) return;
  try {
    await api('/parts/' + id, { method: 'DELETE' });
    await renderInventory();
  } catch (e) {
    showToast(e.message);
  }
}

async function populateCategorySelect() {
  let categories = [];
  try {
    categories = await api('/parts/categories/list');
  } catch (e) {
    categories = [...new Set(partsCache.map(p => p.category).filter(Boolean))].sort();
  }
  const sel = document.getElementById('partCategorySelect');
  sel.innerHTML = categories.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('')
    + `<option value="__new__">+ Add new category…</option>`;
}

function setCategorySelectValue(category) {
  const sel = document.getElementById('partCategorySelect');
  const exists = Array.from(sel.options).some(o => o.value === category);
  const newRow = document.getElementById('newCategoryRow');
  if (exists) {
    sel.value = category;
    newRow.style.display = 'none';
  } else {
    sel.value = '__new__';
    newRow.style.display = 'block';
    document.getElementById('partCategoryNew').value = category;
  }
}

function onCategorySelectChange() {
  const sel = document.getElementById('partCategorySelect');
  document.getElementById('newCategoryRow').style.display = sel.value === '__new__' ? 'block' : 'none';
}

function getSelectedCategory() {
  const sel = document.getElementById('partCategorySelect');
  if (sel.value === '__new__') {
    return document.getElementById('partCategoryNew').value.trim();
  }
  return sel.value;
}

async function openPartModal(id) {
  document.getElementById('partId').value = id || '';
  document.getElementById('partModalTitle').textContent = id ? 'Edit Part' : 'Add Part';
  await populateCategorySelect();
  if (id) {
    const p = partsCache.find(x => x.id === id);
    document.getElementById('partName').value = p.name;
    document.getElementById('partSku').value = p.sku;
    setCategorySelectValue(p.category || '');
    document.getElementById('partCost').value = p.cost;
    document.getElementById('partPrice').value = p.price;
    document.getElementById('partStock').value = p.stock;
    document.getElementById('partThreshold').value = p.threshold;
    document.getElementById('partImage').value = '';
  } else {
    ['partName', 'partSku', 'partCost', 'partPrice', 'partStock', 'partThreshold', 'partImage']
      .forEach(i => document.getElementById(i).value = '');
    document.getElementById('partThreshold').value = 5;
    document.getElementById('partCategorySelect').value = '';
    document.getElementById('newCategoryRow').style.display = 'none';
    document.getElementById('partCategoryNew').value = '';
  }
  openModal('partModalBg');
}

async function savePart() {
  const id = document.getElementById('partId').value;
  const formData = new FormData();
  formData.append('name', document.getElementById('partName').value.trim());
  formData.append('sku', document.getElementById('partSku').value.trim());
  formData.append('category', getSelectedCategory() || 'Other');
  formData.append('cost', document.getElementById('partCost').value || 0);
  formData.append('price', document.getElementById('partPrice').value || 0);
  formData.append('stock', document.getElementById('partStock').value || 0);
  formData.append('threshold', document.getElementById('partThreshold').value || 0);
  const imgFile = document.getElementById('partImage').files[0];
  if (imgFile) formData.append('image', imgFile);
  if (!formData.get('name') || !formData.get('sku')) { showToast('Part name and SKU are required.'); return; }
  try {
    if (id) await apiFormData('/parts/' + id, { method: 'PUT', body: formData });
    else await apiFormData('/parts', { method: 'POST', body: formData });
    closeModal('partModalBg');
    await renderInventory();
    showToast('Part saved.');
  } catch (e) { showToast(e.message); }
}

function renderCategoryOptions() {
  const cats = [...new Set(partsCache.map(p => p.category).filter(Boolean))].sort();
  const sel = document.getElementById('posCategoryFilter');
  const cur = sel.value;
  sel.innerHTML = '<option value="">' + t('pos_allCat') + '</option>'
    + cats.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
  sel.value = cur;
}

/* ---------- HISTORY ---------- */
let salesCache = [];
async function renderHistory() {
  salesCache = await api('/sales');
  filterHistory();
}
function filterHistory() {
  const q = document.getElementById('histSearch').value.trim().toLowerCase();
  const body = document.getElementById('histBody');
  const list = salesCache.filter(s => {
    if (!q) return true;
    return String(s.id).includes(q) || itemsText.includes(q);
  });
  body.innerHTML = list.length ? list.map(s => {
    return `<tr>
      <td class="mono">#${String(s.id).padStart(4, '0')}</td>
      <td>${new Date(s.date).toLocaleString()}</td>
      <td>${s.items.reduce((a, i) => a + i.qty, 0)} items</td>
      <td>${esc(s.payment_method)}</td>
      <td class="mono">${fmt(s.total)}</td>
      <td><button class="btn btn-sm" onclick='showReceipt(${JSON.stringify(s).replace(/'/g, "&#39;")})'>View</button></td>
    </tr>`;
  }).join('') : `<tr><td colspan="6" class="empty">No sales yet. Completed sales will appear here.</td></tr>`;
}
function showReceipt(sale, autoPrint = false) {
  const shopDesc = settings.shop_desc ? `<div class="r-shop-desc">${esc(settings.shop_desc)}</div>` : '';
  const itemsHtml = sale.items.map(i => {
    return `
      <tr class="r-item-row">
        <td class="r-item-name">${esc(i.name)}</td>
        <td class="r-item-qty">${i.qty}</td>
        <td class="r-item-price">${fmt(i.price * i.qty)}</td>
      </tr>`;
  }).join('');
  const subtotal = fmt(sale.subtotal);
  const total = fmt(sale.total);
  const html = `
    <div class="receipt invoice">
      <div class="r-shop-name">${formatShopName(settings.shop_name)}</div>
      ${shopDesc}
      <div class="r-shop-note">සියලුම වර්ගයේ නවීන වාහන අමතර කොටස් සහ ආනයනය කරන ලද රීකන්ඩිශන් අමතර කොටස්</div>
      <div class="r-meta-row">
        <span class="r-meta-label">Bill No</span>
        <span class="r-meta-value">${String(sale.id).padStart(4, '0')}</span>
      </div>
      <div class="r-meta-row">
        <span class="r-meta-label">Date</span>
        <span class="r-meta-value">${new Date(sale.date).toLocaleString()}</span>
      </div>
      <div class="r-divider-thick"></div>
      <table class="r-items-table">
        <thead>
          <tr class="r-items-head">
            <th class="r-item-name">Item Name</th>
            <th class="r-item-qty">Qty</th>
            <th class="r-item-price">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <div class="r-divider-dashed"></div>
      <div class="r-totals-row grand"><span>Total</span><span>${total}</span></div>
      <div class="r-payment-row"><span>Payment (${esc(sale.payment_method)})</span><span>${fmt(sale.amount_received)}</span></div>
      ${sale.payment_method === 'Cash' ? `<div class="r-payment-row"><span>Change</span><span>${fmt(sale.change_due)}</span></div>` : ''}
      <div class="r-divider-thick"></div>
      <div class="r-disclaimer">අලෙවිකරණ ලද වාහන, විදුලි උපංග නැවත භාරගනු නොලැබේ.</div>
      <div class="r-thank-you">Thank you for your business!</div>
      <div class="r-software-credit">
        ImagineX software solution - 0761945587
      </div>
    </div>`;

  // Put HTML into the hidden print-area
  document.getElementById('print-area').innerHTML = html;

  if (autoPrint) {
    // Automatically print without showing the preview modal
    printReceipt();
  } else {
    // Put HTML into the visible preview body and open the modal
    document.getElementById('receiptPreviewBody').innerHTML = html;
    openModal('receiptPreviewModalBg');
  }
}




/* ---------- SETTINGS ---------- */
function updateLogoSizeDisplay(val) {
  document.getElementById('logoSizeVal').textContent = val + 'px';
  const sidebarLogo = document.getElementById('sidebarLogo');
  if (sidebarLogo) {
    sidebarLogo.style.maxHeight = val + 'px';
  }
}
function renderSettingsForm() {
  document.getElementById('setShopName').value = settings.shop_name || '';
  document.getElementById('setShopDesc').value = settings.shop_desc || '';
  const curEl = document.getElementById('setCurrency');
  if (curEl) curEl.value = settings.currency || '';
  const taxEl = document.getElementById('setTax');
  if (taxEl) taxEl.value = settings.tax_rate || 0;
  if (document.getElementById('setFontSize')) {
    document.getElementById('setFontSize').value = settings.ui_font_size || 'small';
  }

  const preview = document.getElementById('setShopLogoPreview');
  preview.innerHTML = settings.shop_logo ? `<img src="/${esc(settings.shop_logo)}" style="max-height:80px; border-radius:4px;" />` : '';
  document.getElementById('setShopLogo').value = '';

  const size = settings.logo_size || 48;
  const slider = document.getElementById('setLogoSize');
  if (slider) {
    slider.value = size;
    document.getElementById('logoSizeVal').textContent = size + 'px';
  }
}
async function saveSettings() {
  const formData = new FormData();
  formData.append('shop_name', document.getElementById('setShopName').value.trim() || DEFAULT_SHOP_NAME);
  formData.append('shop_desc', document.getElementById('setShopDesc').value.trim() || DEFAULT_SHOP_DESC);
  const curEl = document.getElementById('setCurrency');
  formData.append('currency', curEl ? (curEl.value.trim() || 'Rs.') : (settings.currency || 'Rs.'));
  const taxEl = document.getElementById('setTax');
  formData.append('tax_rate', taxEl ? (taxEl.value || 0) : (settings.tax_rate || 0));
  if (document.getElementById('setFontSize')) {
    formData.append('ui_font_size', document.getElementById('setFontSize').value);
  }

  const slider = document.getElementById('setLogoSize');
  if (slider) {
    formData.append('logo_size', slider.value);
  }

  const logoFile = document.getElementById('setShopLogo').files[0];
  if (logoFile) formData.append('logo', logoFile);

  settings = await apiFormData('/settings', {
    method: 'PUT',
    body: formData
  });
  showToast('Settings saved.');
  updateShopUI();
}
async function resetAllData() {
  if (!confirm("අවධානයයි: මෙමගින් පද්ධතියේ ඇති සියලුම අයිතම (Parts) සහ අලෙවි වාර්තා (Sales) සදහටම මකා දැමෙයි.\n\nඔබට දත්ත නැවත සැකසීමට (Reset) අවශ්‍ය බව තහවුරුද?")) {
    return;
  }
  try {
    await api('/reset', { method: 'POST' });
    showToast('All data has been reset.');
    await switchView('dashboard');
  } catch (e) {
    showToast(e.message || 'Reset failed');
  }
}
async function createBackup() {
  const btn = document.getElementById('backupBtn');
  if (btn) btn.disabled = true;
  try {
    const result = await api('/backup', { method: 'POST' });
    showToast('Backup saved: ' + result.fileName);
  } catch (e) {
    showToast(e.message);
  } finally {
    if (btn) btn.disabled = false;
  }
}


/* ---------- THERMAL PRINT (1-click, no dialog) ---------- */
/**
 * Builds a self-contained receipt HTML document and either:
 *   a) sends it to the Electron main process via IPC for silent printing
 *      (no Windows print dialog; targets XP-80 or the system default printer), OR
 *   b) falls back to an iframe + window.print() when running in a normal browser.
 *
 * For 80 mm thermal printers:
 *   • @page sets size:80mm auto with 0 margins.
 *   • ESC/POS GS V 1 (full cut) is embedded as a hidden element.
 */
function buildReceiptDocument() {
  const printArea = document.getElementById('print-area');
  if (!printArea) return null;

  const receiptHTML = printArea.innerHTML;

  // Carry all stylesheet links into the print document so receipt styles apply
  const styleLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
    .map(l => `<link rel="stylesheet" href="${l.href}">`)
    .join('\n');

  // Resolve relative URLs to absolute so the hidden BrowserWindow can fetch them
  const base = window.location.origin;

  const CUT_CMD = '\x1d\x56\x01'; // ESC/POS GS V 1 — full cut

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <base href="${base}/">
  <title>Print Receipt</title>
  ${styleLinks}
  <style>
    @page { margin: 0; }
    html, body { margin: 0; padding: 0; background: #fff; width: 100%; }
    #receipt-print-frame { margin: 0; padding: 0; }
    .modal-actions, button { display: none !important; }
    * { color: #000 !important; background: transparent !important;
        text-shadow: none !important; box-shadow: none !important; }
    .receipt { width: 100% !important; max-width: none !important;
               padding: 0 !important; margin: 0 !important; border: none !important; }
    .r-watermark { display: none !important; }
    .r-shop-logo { max-width: 60px !important; max-height: 60px !important; }
    .r-shop-name { font-size: 16pt !important; }
    .r-totals-row.grand { font-size: 16pt !important; }
    .r-items-table { width: 100% !important; table-layout: fixed !important;
                     border-collapse: collapse !important; }
    .r-items-table th, .r-items-table td { padding: 4px 2px !important;
                                           font-size: 10pt !important; }
    #escpos-cut { font-family: monospace; font-size: 1px;
                  color: white; height: 0; overflow: hidden; }
  </style>
</head>
<body>
  <div id="receipt-print-frame">
    ${receiptHTML}
    <div id="escpos-cut">${CUT_CMD}</div>
  </div>
</body>
</html>`;
}

function printReceipt() {
  const doc = buildReceiptDocument();
  if (!doc) return;

  // ── Electron path: silent IPC print, no dialog ─────────────────────────────
  if (window.electronAPI && typeof window.electronAPI.printReceiptHtml === 'function') {
    // Subscribe once to the result event to show a toast on failure
    const unsub = window.electronAPI.onPrintResult((result) => {
      unsub();
      if (!result.success) {
        showToast(`Print failed: ${result.errorType || 'unknown error'}`);
      } else {
        showToast('Receipt printed ✓');
      }
    });

    window.electronAPI.printReceiptHtml(doc);
    return; // done — no dialog will appear
  }

  // ── Browser fallback: iframe + window.print() (shows OS print dialog) ──────
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:absolute;width:0;height:0;border:none;';
  document.body.appendChild(iframe);

  iframe.contentWindow.document.open();
  iframe.contentWindow.document.write(doc);
  iframe.contentWindow.document.close();

  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => {
      if (document.body.contains(iframe)) document.body.removeChild(iframe);
    }, 10000);
  }, 250);
}

/* ---------- MODAL HELPERS ---------- */
function openModal(id) { document.getElementById(id).classList.add('show'); }
function closeModal(id) { document.getElementById(id).classList.remove('show'); }
 

/* ---------- UI UPDATES ---------- */
function updateShopUI() {
  // Apply font size class
  document.body.classList.remove('fs-small', 'fs-medium', 'fs-large', 'fs-xl');
  if (settings.ui_font_size) {
    document.body.classList.add(`fs-${settings.ui_font_size}`);
  } else {
    document.body.classList.add('fs-small');
  }

  const sidebarName = document.getElementById('sidebarName');
  if (sidebarName) {
    if (settings.shop_name && settings.shop_name !== DEFAULT_SHOP_NAME) {
      sidebarName.textContent = settings.shop_name;
    } else {
      sidebarName.innerHTML = `⚙ <span data-i18n="appTitle">${typeof t === 'function' ? t('appTitle') : DEFAULT_SHOP_NAME}</span>`;
    }
  }

  const sidebarLogo = document.getElementById('sidebarLogo');
  if (sidebarLogo) {
    if (settings.shop_logo) {
      sidebarLogo.src = '/' + esc(settings.shop_logo);
      sidebarLogo.style.display = 'block';
      sidebarLogo.style.maxHeight = (settings.logo_size || 48) + 'px';
    } else {
      sidebarLogo.src = '/logo.png';
      sidebarLogo.style.display = 'block';
      sidebarLogo.style.maxHeight = (settings.logo_size || 48) + 'px';
    }
  }
}

/* ---------- CLOCK ---------- */
function tickClock() {
  document.getElementById('clock').textContent = new Date().toLocaleString();
}

/* ---------- EVENTS ---------- */
function bindEvents() {
  document.getElementById('posSearch').addEventListener('input', renderPosGrid);
  document.getElementById('posCategoryFilter').addEventListener('change', renderPosGrid);
  document.getElementById('payMethod').addEventListener('change', updateChange);
  document.getElementById('cashReceived').addEventListener('input', updateChange);
  document.getElementById('invSearch').addEventListener('input', filterInventory);
  document.getElementById('histSearch').addEventListener('input', filterHistory);
  document.querySelectorAll('.modal-bg').forEach(bg => {
    bg.addEventListener('click', (e) => { if (e.target === bg) bg.classList.remove('show'); });
  });
}

/* ---------- INIT ---------- */
async function init() {
  renderNav();
  bindEvents();
  await refreshSettings();
  updateShopUI();
  await switchView('pos');
  tickClock();
  setInterval(tickClock, 1000);
}
init();
