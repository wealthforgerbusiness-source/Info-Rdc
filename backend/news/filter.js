/**
 * Classifier automatique des catégories RDC par mots-clés
 */
function classify(title, summary) {
  const text = `${title} ${summary}`.toLowerCase();

  if (text.includes('presidence') || text.includes('parlement') || text.includes('ministre')) return 'Politique';
  if (text.includes('franc') || text.includes('banque') || text.includes('mines')) return 'Économie';
  if (text.includes('kinshasa') || text.includes('gombe')) return 'Kinshasa';
  if (text.includes('goma') || text.includes('katanga') || text.includes('bukavu')) return 'Provinces';
  if (text.includes('m23') || text.includes('fardc') || text.includes('securite')) return 'Sécurité';
  
  return 'Actualités';
}

module.exports = { classify };
