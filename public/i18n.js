const i18nDict = {
  en: {
    appTitle: "KN Motors",
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
    appTitle: "KN Motors",
    appTag: "අමතර කොටස් ෂොප්",
    nav_dashboard: "ප්‍රධාන තිරය",
    nav_pos: "බිල දාන්න",
    nav_inventory: "ස්ටොක්",
    nav_history: "පැරණි බිල්",
    nav_settings: "සකසන්න",
    sub_dashboard: "අද දවසේ තත්ත්වය",
    sub_pos: "අලුත් බිලක් හදන්න",
    sub_inventory: "ස්ටොක් එක හදන්න",
    sub_history: "කලින් දාපු බිල් බලන්න",
    sub_settings: "ෂොප් එකේ විස්තර හදන්න",

    dash_lowStock: "ස්ටොක් අඩු ඒවා",
    dash_topSell: "වැඩිපුරම විකිණෙන ඒවා",
    dash_part: "Part",
    dash_sku: "Part No.",
    dash_category: "වර්ගය",
    dash_stock: "ස්ටොක්",
    dash_unitsSold: "විකිණ ගාණ",
    dash_revenue: "ආදායම",
    dash_todayRev: "අද ආදායම",
    dash_todaySales: "අද දාපු බිල්",
    dash_partsCat: "ස්ටොක් ඇති parts ගාණ",
    dash_lowStockItems: "ස්ටොක් අඩු parts",
    dash_invValue: "ස්ටොක් වටිනාකම",

    pos_search: "Part නම, No. හෝ වර්ගයෙන් හොයන්න...",
    pos_allCat: "ඔක්කොම",
    pos_currentSale: "දැනට දාන බිල",
    pos_discountPct: "වට්ටම %",
    pos_taxPct: "බදු %",
    pos_subtotal: "එකතුව",
    pos_discount: "වට්ටම",
    pos_tax: "බදු",
    pos_total: "මුළු මුදල",
    pos_payMethod: "ගෙවීමේ ක්‍රමය",
    pos_methodCash: "මුදල් (Cash)",
    pos_methodCard: "කාඩ් (Card)",
    pos_methodBank: "බැංකු හුවමාරුව",
    pos_methodOther: "වෙනත්",
    pos_amountRec: "ගනුදෙනුකරු දුන් මුදල",
    pos_clear: "ඉවත් කරන්න",
    pos_complete: "බිල නිම කරන්න",

    inv_title: "Parts ස්ටොක්",
    inv_addPart: "+ Part එකක් දාන්න",
    inv_search: "ස්ටොක් හොයන්න...",
    inv_cost: "ගත් මිල",
    inv_price: "විකිණුම් මිල",
    inv_stockLevel: "ස්ටොක් ප්‍රමාණය",

    hist_title: "විකිණුම් ඉතිහාසය",
    hist_search: "බිල් No. හෝ Part නමින් හොයන්න...",
    hist_receipt: "බිල් No.",
    hist_date: "දිනය",
    hist_items: "ඒවා ගාණ",
    hist_payment: "ගෙව්ව ක්‍රමය",
    hist_total: "මුළු මුදල",

    set_title: "සකසන්න",
    set_shopName: "ෂොප් නම",
    set_shopDesc: "ෂොප් ගැන විස්තරය",
    set_shopLogo: "ෂොප් Logo",
    set_logoSize: "Logo ප්‍රමාණය",
    set_currency: "මුදල් ලකුණ",
    set_tax: "සාමාන්‍ය බදු % ප්‍රමාණය",
    set_save: "සුරකින්න",
    set_dataTitle: "දත්ත",
    set_dataDesc: "මෙයින් ස්ටොක් සහ බිල් ඔක්කොම මැකෙනවා. නැවත ලබාගත නොහැක.",
    set_resetBtn: "ඔක්කොම ඉවත් කරන්න",
    set_backupTitle: "Backup",
    set_backupBtn: "Backup ගන්න",

    modal_addPart: "Part එකක් දාන්න",
    modal_editPart: "Part හදන්න",
    modal_partName: "Part නම",
    modal_partNamePlaceholder: "උදා: Brake Pad Set - Front",
    modal_sku: "Part No. / Code",
    modal_category: "වර්ගය",
    modal_cost: "ගත් මිල",
    modal_price: "විකිණුම් මිල",
    modal_stock: "ස්ටොක් ගාණ",
    modal_threshold: "ස්ටොක් අඩු warning සීමාව",
    modal_cancel: "අවලංගු කරන්න",
    modal_savePart: "Part සුරකින්න",

    modal_close: "වසන්න",
    modal_print: "Print කරන්න",

    gen_edit: "හදන්න",
    gen_delete: "මකන්න",
    gen_change: "ඉතිරි මුදල",
    gen_units: "ගාණ",
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
