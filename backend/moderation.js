/**
 * Modération à 3 niveaux : BLOCK / REVIEW / ALLOW
 */
const BLOCKED_WORDS = (process.env.MODERATION_BLOCKED_WORDS || 'libolo,masoko').split(',');
const REVIEW_WORDS = ['argent', 'gain', 'investir', 'numéro', 'whatsapp'];

function evaluateText(text) {
  const lower = text.toLowerCase();

  // Niveau 1 : Block
  for (const word of BLOCKED_WORDS) {
    if (lower.includes(word.trim())) {
      return { status: 'BLOCK', reason: `Mot interdit décelé: ${word}` };
    }
  }

  // Niveau 2 : Review
  for (const word of REVIEW_WORDS) {
    if (lower.includes(word.trim())) {
      return { status: 'REVIEW', reason: `Terme ambigu décelé: ${word}` };
    }
  }

  return { status: 'ALLOW' };
}

module.exports = { evaluateText };
