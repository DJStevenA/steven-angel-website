import { trackEvent, trackConversion } from './gtag';
import { WHATSAPP_VALUES } from './config';

const itemFromProduct = (product) => ({
  item_id: product.id,
  item_name: product.name,
  item_category: product.genre,
  item_brand: 'Steven Angel',
  price: product.price,
  quantity: 1,
});

export const trackWhatsAppLead = (productLine, sourceButton) => {
  const value = WHATSAPP_VALUES[productLine] ?? 0;
  trackEvent('whatsapp_lead', {
    product_line: productLine,
    source_button: sourceButton,
    value,
    currency: 'USD',
  });
  trackConversion('whatsapp_lead', { value, currency: 'USD' });
};

export const trackViewItem = (product) => {
  trackEvent('view_item', {
    currency: product.currency || 'USD',
    value: product.price,
    items: [itemFromProduct(product)],
  });
};

export const trackViewItemList = (products, listName = 'shop') => {
  trackEvent('view_item_list', {
    item_list_name: listName,
    items: products.map(itemFromProduct),
  });
};

export const trackSelectItem = (product, listName = 'shop') => {
  trackEvent('select_item', {
    item_list_name: listName,
    items: [itemFromProduct(product)],
  });
};

export const trackAddPaymentInfo = (product, paymentType = 'paypal') => {
  trackEvent('add_payment_info', {
    currency: product.currency || 'USD',
    value: product.price,
    payment_type: paymentType,
    items: [itemFromProduct(product)],
  });
};

export const trackPurchase = (product, { transaction_id } = {}) => {
  trackEvent('purchase', {
    transaction_id,
    currency: product.currency || 'USD',
    value: product.price,
    items: [itemFromProduct(product)],
  });
  trackConversion('purchase', {
    value: product.price,
    currency: product.currency || 'USD',
    transaction_id,
  });
};

export const trackAddToCart = (product) => {
  trackEvent('add_to_cart', {
    currency: product.currency || 'USD',
    value: product.price,
    items: [itemFromProduct(product)],
  });
};

export const trackBeginCheckout = (product) => {
  trackEvent('begin_checkout', {
    currency: product.currency || 'USD',
    value: product.price,
    items: [itemFromProduct(product)],
  });
  trackConversion('begin_checkout', {
    value: product.price,
    currency: product.currency || 'USD',
  });
};

export const trackAudioPreview = (action, params = {}) => {
  trackEvent(`audio_preview_${action}`, params);
};

export const trackVideoPreview = (action, params = {}) => {
  trackEvent(`video_preview_${action}`, params);
};

export const trackPageView = (params = {}) => {
  trackEvent('page_view', params);
};

export const trackScrollDepth = (percent, page_category) => {
  trackEvent('scroll_depth', { percent, page_category });
};

export const trackTimeOnPage = (seconds, page_category) => {
  trackEvent('time_on_page', { seconds, page_category });
};
