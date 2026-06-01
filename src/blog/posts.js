/**
 * Blog post registry — Vite imports each .md file as raw text (?raw), we
 * parse the YAML frontmatter at module load, and expose a sorted array of
 * published posts.
 *
 * Adding a new post:
 *   1. Drop the .md file in src/blog/posts/
 *   2. Add the import + array entry below
 *   3. Add the slug to public/sitemap.xml
 *   4. Add the slug to PUBLISHED_POST_SLUGS in vite.config.js
 *      (so the static-SEO plugin generates dist/blog/<slug>/index.html)
 */

import clearMasterRaw from './posts/clear-master-afro-house-track.md?raw';
import referenceMatchingRaw from './posts/reference-matching.md?raw';
import signToLabelsRaw from './posts/sign-to-labels.md?raw';
import { parseFrontmatter } from './parseFrontmatter.js';

function build(raw) {
  const { data, content } = parseFrontmatter(raw);
  return { ...data, body: content };
}

const ALL = [
  build(clearMasterRaw),
  build(referenceMatchingRaw),
  build(signToLabelsRaw),
];

const posts = ALL
  .filter((p) => p.status === 'published')
  .sort((a, b) => new Date(b.date) - new Date(a.date));

export default posts;

export function findBySlug(slug) {
  return posts.find((p) => p.slug === slug);
}

/**
 * Excerpt builder — first paragraph of body, stripped of markdown markers,
 * trimmed to ~180 chars. Used by BlogCard.
 */
export function excerpt(post, maxLen = 180) {
  if (!post?.body) return '';
  // Drop the H1 if it's the first line; the title is rendered separately
  const lines = post.body.split('\n');
  let i = 0;
  if (lines[i] && lines[i].startsWith('# ')) i++;
  // Skip blank lines + blockquote lines
  while (i < lines.length && (lines[i].trim() === '' || lines[i].startsWith('>'))) i++;
  // Collect first paragraph
  const para = [];
  while (i < lines.length && lines[i].trim() !== '') {
    para.push(lines[i]);
    i++;
  }
  let text = para.join(' ')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/\[(.+?)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length > maxLen) {
    text = text.slice(0, maxLen).replace(/\s+\S*$/, '') + '…';
  }
  return text;
}
