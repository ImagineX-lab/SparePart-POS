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
    appTag: "අමතර කොටස් පද්ධතිය",
    nav_dashboard: "ඩෑෂ්බෝඩ් එක",
    nav_pos: "නව විකුණුමක්",
    nav_inventory: "බඩු තොග",
    nav_history: "විකුණුම් ඉතිහාසය",
    nav_settings: "සැකසුම්",
    sub_dashboard: "අද දවසේ සාරාංශය",
    sub_pos: "බිලක් සකසන්න",
    sub_inventory: "භාණ්ඩ නාමාවලිය",
    sub_history: "පෙර විකුණුම් බිල්පත්",
    sub_settings: "ව්‍යාපාරයේ සැකසුම්",
    
    dash_lowStock: "තොග අඩු භාණ්ඩ නිවේදන",
    dash_topSell: "වැඩියෙන්ම අලෙවි වන භාණ්ඩ",
    dash_part: "භාණ්ඩය",
    dash_sku: "කේතය (SKU)",
    dash_category: "වර්ගය",
    dash_stock: "තොගය",
    dash_unitsSold: "විකිණූ ප්‍රමාණය",
    dash_revenue: "ආදායම",
    dash_todayRev: "අද ආදායම",
    dash_todaySales: "අද විකුණුම් ගණන",
    dash_partsCat: "නාමාවලියේ ඇති භාණ්ඩ",
    dash_lowStockItems: "තොග අඩු භාණ්ඩ",
    dash_invValue: "තොගයේ වටිනාකම",
    
    pos_search: "නම, SKU හෝ වර්ගයෙන් සොයන්න...",
    pos_allCat: "සියලුම වර්ග",
    pos_currentSale: "වර්තමාන බිල",
    pos_discountPct: "වට්ටම %",
    pos_taxPct: "බද්ද %",
    pos_subtotal: "එකතුව",
    pos_discount: "වට්ටම",
    pos_tax: "බද්ද",
    pos_total: "මුළු මුදල",
    pos_payMethod: "ගෙවන ක්‍රමය",
    pos_methodCash: "මුදල්",
    pos_methodCard: "කාඩ් පත",
    pos_methodBank: "බැංකු හුවමාරුව",
    pos_methodOther: "වෙනත්",
    pos_amountRec: "ලැබුණු මුදල",
    pos_clear: "මකන්න",
    pos_complete: "බිල අවසන් කරන්න",
    
    inv_title: "භාණ්ඩ තොග",
    inv_addPart: "+ භාණ්ඩයක් එක් කරන්න",
    inv_search: "භාණ්ඩ සොයන්න...",
    inv_cost: "ගැනුම් මිල",
    inv_price: "විකුණුම් මිල",
    inv_stockLevel: "තොග ප්‍රමාණය",
    
    hist_title: "විකුණුම් ඉතිහාසය",
    hist_search: "බිල්පත් අංකය, පාරිභෝගිකයා හෝ භාණ්ඩයෙන් සොයන්න...",
    hist_receipt: "බිල්පත",
    hist_date: "දිනය",
    hist_items: "භාණ්ඩ",
    hist_payment: "ගෙවීම",
    hist_total: "මුළු මුදල",
    

    set_title: "ව්‍යාපාරයේ සැකසුම්",
    set_shopName: "ව්‍යාපාරයේ නම",
    set_shopDesc: "ව්‍යාපාරයේ විස්තරය",
    set_shopLogo: "ව්‍යාපාරයේ ලාංඡනය (Logo)",
    set_logoSize: "ලාංඡනයේ ප්‍රමාණය (Logo size)",
    set_currency: "මුදල් ඒකකය",
    set_tax: "සාමාන්‍ය බදු ප්‍රතිශතය %",
    set_save: "සැකසුම් සුරකින්න",
    set_dataTitle: "දත්ත (Data)",
    set_dataDesc: "මෙය සර්වර් එකේ ඇති සියලුම භාණ්ඩ සහ විකුණුම් දත්ත මකා දමයි. ආපසු හැරවිය නොහැක.",
    set_resetBtn: "සියලු දත්ත මකන්න",
    
    modal_addPart: "භාණ්ඩයක් එක් කරන්න",
    modal_editPart: "භාණ්ඩය සංස්කරණය කරන්න",
    modal_partName: "භාණ්ඩයේ නම",
    modal_partNamePlaceholder: "උදා: බ්‍රේක් පෑඩ් සෙට් එකක්",
    modal_sku: "කේතය / අංකය",
    modal_category: "වර්ගය",
    modal_cost: "ගැනුම් මිල",
    modal_price: "විකුණුම් මිල",
    modal_stock: "තොග ප්‍රමාණය",
    modal_threshold: "අඩු තොග සීමාව",
    modal_cancel: "අවලංගු කරන්න",
    modal_savePart: "භාණ්ඩය සුරකින්න",
    

    modal_close: "වසන්න",
    modal_print: "මුද්‍රණය කරන්න",
    
    gen_edit: "වෙනස් කරන්න",
    gen_delete: "මකන්න",
    gen_change: "ඉතිරිය",
    gen_units: "ඒකක",
    gen_none: "නැත"
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
