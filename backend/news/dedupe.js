/**
 * Algorithme simple de déduplication des actualités similaires
 */
function normalizeTitle(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .trim();
}

function process(items) {
  const seenTitles = new Set();
  const uniqueItems = [];

  for (const item of items) {
    const norm = normalizeTitle(item.title);
    if (!seenTitles.has(norm)) {
      seenTitles.add(norm);
      uniqueItems.push(item);
    }
  }
  return uniqueItems;
}

module.exports = { process };
