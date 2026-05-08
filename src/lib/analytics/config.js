export const GA4_ID = 'G-KTRD05NY5B';
export const GOOGLE_ADS_ID = 'AW-999991173'; // Conversion tracking ID (differs from customer ID 7337381163)

// Conversion action labels — format: everything after the slash in send_to
export const CONVERSION_LABELS = {
  whatsapp_lead: 'Ja88CKuduZ4cEIXP6twD',   // "WhatsApp Click" conversion action ($50)
  purchase: 'tp6gCKWduZ4cEIXP6twD',          // "Shop Purchase (Templates/Masterclass)"
  begin_checkout: '5j5eCKT596IcEIXP6twD',    // "Shop Begin Checkout (Templates/Masterclass)" — created 2026-04-26
  lead_form_submit: 'b8BYCIHTmJIcEIXP6twD',   // "Ghost Production - Lead" ($300) — wired 2026-05-08 (was empty; root cause for Smart Bidding starvation)
};

// WhatsApp click conversion values — must match the value configured on each
// "WhatsApp Click" conversion action in Google Ads UI. All currently mapped
// to the single WhatsApp Click action ($50), so kept consistent here. Update
// both places together if the conversion value changes.
export const WHATSAPP_VALUES = {
  GP: 50,    // Ghost Production — synced to "WhatsApp Click" action ($50) on 2026-05-08
  PL: 50,    // Production Lessons
  MM: 50,    // Mix & Master
  SH: 50,    // Shop
};

// Lead form submission values — must match the value configured on the
// "Ghost Production - Lead" conversion action in Google Ads (currently $300
// for all leads since they all map to that one conversion action via
// CONVERSION_LABELS.lead_form_submit). If we later split into per-product
// conversion actions, add their labels to CONVERSION_LABELS too.
export const LEAD_FORM_VALUES = {
  GP: 300,    // Ghost Production lead — matches "Ghost Production - Lead" action default ($300)
  PL: 80,     // Production Lessons inquiry
  MM: 80,     // Mix & Master inquiry
  SH: 50,     // Shop inquiry
  default: 50,
};
