/**
 * Module d'agrégation, cache & déduplication automatisée
 */
const Parser = require('rss-parser');
const sources = require('./sources');
const dedupe = require('./dedupe');
const parser = new Parser();

let cachedNews = [];
let lastFetchTime = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

async function getLatestNews() {
  const now = Date.now();
  if (cachedNews.length > 0 && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedNews;
  }

  let aggregated = [];

  for (const src of sources) {
    try {
      const feed = await parser.parseURL(src.url);
      const items = feed.items.map(item => ({
        id: item.guid || item.link,
        title: item.title?.trim(),
        summary: item.contentSnippet ? item.contentSnippet.substring(0, 250) + '...' : '',
        link: item.link,
        date: item.pubDate || new Date().toISOString(),
        source: src.name,
        category: src.categoryDefault,
        image: item.enclosure ? item.enclosure.url : null
      }));
      aggregated.push(...items);
    } catch (err) {
      console.warn(`[News Engine] Source inaccessible (${src.name}):`, err.message);
    }
  }

  // Déduplication & tri
  const cleanNews = dedupe.process(aggregated);
  cachedNews = cleanNews.sort((a, b) => new Date(b.date) - new Date(a.date));
  lastFetchTime = now;

  return cachedNews;
}

module.exports = { getLatestNews };
