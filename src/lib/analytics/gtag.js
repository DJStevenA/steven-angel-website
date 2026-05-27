import { GOOGLE_ADS_ID, CONVERSION_LABELS } from './config';

export const isGtagReady = () => typeof window !== 'undefined' && typeof window.gtag === 'function';

export const trackEvent = (name, params = {}) => {
  if (!isGtagReady()) return;
  window.gtag('event', name, params);
};

/**
 * Enhanced Conversions for Google Ads.
 *
 * Sets `user_data` so Google can hash + match the converter against signed-in
 * Google users — recovers ~20-40% of conversions lost to cookie restrictions
 * (iOS 14+, ITP, etc) and gives Smart Bidding a much stronger signal.
 *
 * Pass RAW email — Google's tag normalizes (trim, lowercase) and SHA-256
 * hashes it client-side before sending. The raw email never leaves the
 * browser. We also lowercase + trim defensively in case the GA tag version
 * doesn't auto-normalize.
 *
 * Must be called BEFORE trackConversion so the user_data is attached to
 * the next conversion event in the same pageview.
 *
 * Pre-req on the Google Ads side: Tools → Conversions → Enhanced Conversions
 * → toggle ON for each conversion action. Match rate >30% means it's working.
 */
export const setEnhancedConversionsUserData = ({ email, phone } = {}) => {
  if (!isGtagReady()) return;
  if (!email && !phone) return;
  const userData = {};
  if (email && typeof email === 'string') {
    userData.email = email.trim().toLowerCase();
  }
  if (phone && typeof phone === 'string') {
    userData.phone_number = phone.trim();
  }
  if (Object.keys(userData).length === 0) return;
  window.gtag('set', 'user_data', userData);
};

export const trackConversion = (labelKey, { value, currency = 'USD', transaction_id } = {}) => {
  if (!isGtagReady()) return;
  const label = CONVERSION_LABELS[labelKey];
  if (!label) return;
  const params = { send_to: `${GOOGLE_ADS_ID}/${label}` };
  if (value !== undefined) params.value = value;
  if (currency) params.currency = currency;
  if (transaction_id) params.transaction_id = transaction_id;
  window.gtag('event', 'conversion', params);
};
