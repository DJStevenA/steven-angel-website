/**
 * Analytics hooks — page_view + scroll depth + time-on-page remarketing signals.
 * Fires GA4 custom events used to build Google Ads remarketing audiences.
 */
import { useEffect, useRef } from 'react';
import { trackPageView, trackScrollDepth, trackTimeOnPage } from './events';

/**
 * Fires a single page_view event with page_category on mount.
 * Used to power "visitors of /lessons", "visitors of /ghost" remarketing audiences.
 * @param {string} page_category  e.g. 'homepage', 'ghost', 'lessons', 'shop'
 */
export function usePageView(page_category) {
  useEffect(() => {
    trackPageView({
      page_category,
      page_path: typeof window !== 'undefined' ? window.location.pathname : '',
      page_title: typeof document !== 'undefined' ? document.title : '',
    });
  }, [page_category]);
}

/**
 * Fires scroll_depth events at 25 / 50 / 75 / 100 % thresholds.
 * @param {string} page_category  e.g. 'homepage', 'ghost', 'lessons', 'shop'
 */
export function useScrollDepth(page_category) {
  const fired = useRef(new Set());

  useEffect(() => {
    fired.current.clear();
    const THRESHOLDS = [25, 50, 75, 100];

    const handler = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      const pct = Math.round((scrolled / total) * 100);

      for (const threshold of THRESHOLDS) {
        if (pct >= threshold && !fired.current.has(threshold)) {
          fired.current.add(threshold);
          trackScrollDepth(threshold, page_category);
        }
      }
    };

    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [page_category]);
}

/**
 * Fires time_on_page events at 30s / 60s / 120s milestones.
 * @param {string} page_category  e.g. 'homepage', 'ghost', 'lessons', 'shop'
 */
export function useTimeOnPage(page_category) {
  useEffect(() => {
    const MILESTONES = [30, 60, 120];
    const timers = MILESTONES.map((s) =>
      setTimeout(() => trackTimeOnPage(s, page_category), s * 1000)
    );
    return () => timers.forEach(clearTimeout);
  }, [page_category]);
}
