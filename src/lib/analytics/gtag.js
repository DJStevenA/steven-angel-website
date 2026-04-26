import { GOOGLE_ADS_ID, CONVERSION_LABELS } from './config';

export const isGtagReady = () => typeof window !== 'undefined' && typeof window.gtag === 'function';

export const trackEvent = (name, params = {}) => {
  if (!isGtagReady()) return;
  window.gtag('event', name, params);
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
