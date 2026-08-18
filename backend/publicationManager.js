/**
 * Gestionnaire des publications administrées (Google Sheets Integration)
 */
const axios = require('axios');

async function getAdministeredContent() {
  const gasUrl = process.env.GAS_API_URL;
  if (!gasUrl) return [];

  try {
    const response = await axios.get(`${gasUrl}?action=getPublications`);
    return response.data;
  } catch (err) {
    console.error("Erreur d'extraction Google Sheets:", err.message);
    return [];
  }
}

async function submitToSheet(payload) {
  const gasUrl = process.env.GAS_API_URL;
  const response = await axios.post(gasUrl, payload);
  return response.data;
}

module.exports = { getAdministeredContent, submitToSheet };
