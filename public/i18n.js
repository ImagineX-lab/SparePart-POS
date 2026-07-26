const i18nDict = {
  en: {
    appTitle: "Gearbox POS",
    appTag: "Spare parts register",
    nav_dashboard: "Dashboard",
    nav_pos: "New Sale",
    nav_inventory: "Inventory",
    nav_history: "Sales History",
    nav_settings: "Settings",
    sub_dashboard: "Today's snapshot",
    sub_pos: "Ring up a sale",
    sub_inventory: "Manage your parts catalog",
    sub_history: "Past transactions",
    sub_settings: "Shop configuration",
    
    // Dashboard
    dash_lowStock: "Low stock alerts",
    dash_topSell: "Top selling parts",
    dash_part: "Part",
    dash_sku: "SKU",
    dash_category: "Category",
    dash_stock: "Stock",
    dash_unitsSold: "Units sold",
    dash_revenue: "Revenue",
    dash_todayRev: "Today's revenue",
    dash_todaySales: "Today's sales",
    dash_partsCat: "Parts in catalog",
    dash_lowStockItems: "Low stock items",
    dash_invValue: "Inventory value (cost)",
    
    // POS
    pos_search: "Search by name, SKU, or category...",
    pos_allCat: "All categories",
    pos_currentSale: "Current Sale",
    pos_discountPct: "Discount %",
    pos_taxPct: "Tax %",
    pos_subtotal: "Subtotal",
    pos_discount: "Discount",
    pos_tax: "Tax",
    pos_total: "Total",
    pos_payMethod: "Payment method",
    pos_methodCash: "Cash",
    pos_methodCard: "Card",
    pos_methodBank: "Bank Transfer",
    pos_methodOther: "Other",
    pos_amountRec: "Amount received",
    pos_clear: "Clear",
    pos_complete: "Complete Sale",
    
    // Inventory
    inv_title: "Parts inventory",
    inv_addPart: "+ Add part",
    inv_search: "Search inventory...",
    inv_cost: "Cost",
    inv_price: "Price",
    inv_stockLevel: "Stock level",
    
    // History
    hist_title: "Sales history",
    hist_search: "Search by receipt #, customer, or part...",
    hist_receipt: "Receipt",
    hist_date: "Date",
    hist_items: "Items",
    hist_payment: "Payment",
    hist_total: "Total",
    

    // Settings
    set_title: "Shop settings",
    set_shopName: "Shop name",
    set_shopDesc: "Shop description",
    set_shopLogo: "Shop logo",
    set_logoSize: "Logo size (height)",
    set_currency: "Currency symbol",
    set_tax: "Default tax rate %",
    set_save: "Save settings",
    set_dataTitle: "Data",
    set_dataDesc: "This resets all parts and sales on the server. Cannot be undone.",
    set_resetBtn: "Reset all data",
    set_backupTitle: "Data Backup",
    set_backupBtn: "Create Backup",
    
    // Modals
    modal_addPart: "Add part",
    modal_editPart: "Edit part",
    modal_partName: "Part name",
    modal_partNamePlaceholder: "e.g. Brake Pad Set - Front",
    modal_sku: "SKU / part no.",
    modal_category: "Category",
    modal_cost: "Cost price",
    modal_price: "Selling price",
    modal_stock: "Stock quantity",
    modal_threshold: "Low stock threshold",
    modal_cancel: "Cancel",
    modal_savePart: "Save part",
    

    modal_close: "Close",
    modal_print: "Print",
    
    // General
    gen_edit: "Edit",
    gen_delete: "Delete",
    gen_change: "Change",
    gen_units: "units",
    gen_none: "None"
  },
  si: {
    appTitle: "ගියර්බොක්ස් POS",
    appTag: "Spare Parts System එක",
    nav_dashboard: "Dashboard එක",
    nav_pos: "බිලක් දාන්න",
    nav_inventory: "ස්ටොක් එක",
    nav_history: "පරණ බිල්",
    nav_settings: "සෙටින්ග්ස්",
    sub_dashboard: "අද දවසේ තත්වෙ",
    sub_pos: "අලුත් බිලක් හදන්න",
    sub_inventory: "පාට්ස් ස්ටොක් එක Update කරන්න",
    sub_history: "කලින් දාපු බිල් බලන්න",
    sub_settings: "ෂොප් එකේ සෙටින්ග්ස් හදන්න",
    
    dash_lowStock: "ස්ටොක් අඩු අයිතම",
    dash_topSell: "වැඩියෙන්ම විකිණෙන අයිතම",
    dash_part: "part එක",
    dash_sku: "part නම්බර් එක",
    dash_category: "වර්ගය",
    dash_stock: "ස්ටොක් එක",
    dash_unitsSold: "විකිණුන ගාණ",
    dash_revenue: "ආදායම",
    dash_todayRev: "අද දවසේ ආදායම",
    dash_todaySales: "අද දවසේ බිල්",
    dash_partsCat: "සිස්ටම් එකේ තියෙන parts ගාණ",
    dash_lowStockItems: "ස්ටොක් අඩුවෙලා තියෙන parts",
    dash_invValue: "මුළු ස්ටොක් එකේ වටිනාකම",
    
    pos_search: "නමෙන්, පාට් නම්බර් එකෙන් හරි කැටගරි එකෙන් හොයන්න...",
    pos_allCat: "ඔක්කොම",
    pos_currentSale: "දැනට දාන බිල",
    pos_discountPct: "ඩිස්කවුන්ට් %",
    pos_taxPct: "ටැක්ස් %",
    pos_subtotal: "එකතුව",
    pos_discount: "ඩිස්කවුන්ට් එක",
    pos_tax: "ටැක්ස්",
    pos_total: "මුළු ගාණ",
    pos_payMethod: "ගෙවන විදිහ",
    pos_methodCash: "කෑෂ් (Cash)",
    pos_methodCard: "කාඩ් (Card)",
    pos_methodBank: "බෑන්ක් ට්‍රාන්ස්ෆර් (Bank Transfer)",
    pos_methodOther: "වෙනත්",
    pos_amountRec: "දුන්න ගාණ",
    pos_clear: "ක්ලියර් කරන්න",
    pos_complete: "බිල සේව් කරන්න",
    
    inv_title: "part එකේ ස්ටොක් එක",
    inv_addPart: "+ අලුත් part එකක් දාන්න",
    inv_search: "ස්ටොක් එකේ හොයන්න...",
    inv_cost: "ගැනුම් මිල",
    inv_price: "විකුණුම් මිල",
    inv_stockLevel: "ස්ටොක් එකේ තියෙන ප්‍රමාණය",
    
    hist_title: "බිල් විස්තර",
    hist_search: "බිල් නම්බර් එකෙන් හරි part එකෙන් හොයන්න...",
    hist_receipt: "බිල් නම්බර් එක",
    hist_date: "දිනය",
    hist_items: "අයිතම ගණන",
    hist_payment: "ගෙව්වෙ",
    hist_total: "මුළු ගණන",
    
    set_title: "සෙටින්ග්ස්",
    set_shopName: "ෂොප් එකේ නම",
    set_shopDesc: "ෂොප් එක ගැන විස්තරයක්",
    set_shopLogo: "ෂොප් එකේ ලෝගෝ එක",
    set_logoSize: "ලෝගෝ එකේ සයිස් එක",
    set_currency: "මුදල් ඒකකය",
    set_tax: "ටැක්ස් එක %",
    set_save: "සෙටින්ග්ස් සේව් කරන්න",
    set_dataTitle: "දත්ත (Data)",
    set_dataDesc: "මේකෙන් සිස්ටම් එකේ තියෙන ඔක්කොම පාට්ස් සහ බිල් මැකිලා යනවා. ආයේ ගන්න බෑ.",
    set_resetBtn: "ඔක්කොම ඩේටා මකන්න",
    set_backupTitle: "බැකප්",
    set_backupBtn: "බැකප් එකක් ගන්න",
    
    modal_addPart: "+ අලුත් part එකක් දාන්න",
    modal_editPart: "පාට් එක වෙනස් කරන්න",
    modal_partName: "පාට් එකේ නම",
    modal_partNamePlaceholder: "උදා: Brake Pad Set - Front",
    modal_sku: "පාට් නම්බර් එක",
    modal_category: "කැටගරි එක",
    modal_cost: "ගත්ත ගාණ",
    modal_price: "විකුණන ගාණ",
    modal_stock: "ස්ටොක් එකට දාන ගාණ",
    modal_threshold: "ස්ටොක් අඩුයි කියල පෙන්නන්න ඕන ගාණ",
    modal_cancel: "කැන්සල් කරන්න",
    modal_savePart: "පාට් එක සේව් කරන්න",
    
    modal_close: "ක්ලෝස් කරන්න",
    modal_print: "ප්‍රින්ට් කරන්න",
    
    gen_edit: "වෙනස් කරන්න",
    gen_delete: "මකන්න",
    gen_change: "ඉතුරු සල්ලි",
    gen_units: "කෑලි",
    gen_none: "නැහැ"
  }
};

let currentLang = localStorage.getItem('appLang') || 'en';

function t(key) {
  return i18nDict[currentLang][key] || key;
}

function updateDOMTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (el.tagName === 'INPUT' && el.getAttribute('placeholder') !== null) {
      el.setAttribute('placeholder', t(key));
    } else {
      el.textContent = t(key);
    }
  });
}

function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'si' : 'en';
  localStorage.setItem('appLang', currentLang);
  
  const btn = document.getElementById('langToggleBtn');
  if (btn) btn.textContent = currentLang === 'en' ? 'EN / සිං' : 'සිං / EN';

  // preserve amount entered in the POS cash field when switching language
  const cashEl = document.getElementById('cashReceived');
  const cashVal = cashEl ? cashEl.value : null;

  updateDOMTranslations();
  
  if (typeof renderNav === 'function') renderNav();
  
  const activeView = document.querySelector('.view.active');
  if (activeView) {
    const id = activeView.id.replace('view-', '');
    if (typeof switchView === 'function') switchView(id);
  }

  // restore preserved cash amount (if any)
  if (cashEl && cashVal !== null) {
    // small timeout to ensure view rendering finished
    setTimeout(() => { try { cashEl.value = cashVal; updateChange(); } catch (e) {} }, 50);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateDOMTranslations();
  const btn = document.getElementById('langToggleBtn');
  if (btn) btn.textContent = currentLang === 'en' ? 'EN / සිං' : 'සිං / EN';
});
