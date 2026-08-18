/**
 * INFO + RDC — Main Express Backend Engine
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const aggregator = require('./news/aggregator');
const publicationManager = require('./publicationManager');
const moderation = require('./moderation');
const pushManager = require('./pushManager');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Limiteur strict anti-spam pour les soumissions publiques
const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5,
  message: { message: "Trop de soumissions depuis cette adresse IP. Réessayez plus tard." }
});

// Route: Récupération des actualités externes
app.get('/api/news', async (req, res) => {
  try {
    const news = await aggregator.getLatestNews();
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: "Erreur agrégation actualités" });
  }
});

// Route: Récupération des publications administrées Google Sheets
app.get('/api/publications', async (req, res) => {
  try {
    const data = await publicationManager.getAdministeredContent();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Erreur chargement publications" });
  }
});

// Route: Soumission d'une nouvelle publication utilisateur
app.post('/api/publications', submitLimiter, async (req, res) => {
  try {
    const payload = req.body;

    // 1. Validation de la moderation
    const modResult = moderation.evaluateText(`${payload.titre} ${payload.texte}`);
    if (modResult.status === 'BLOCK') {
      return res.status(400).json({ message: "Le contenu proposé ne respecte pas les règles de la communauté." });
    }

    // 2. Transmettre à Google Sheets via Apps Script
    const response = await publicationManager.submitToSheet({
      ...payload,
      statut: modResult.status === 'REVIEW' ? 'attente' : 'attente' // Forcer l'attente administrative
    });

    res.json({ success: true, response });
  } catch (err) {
    res.status(500).json({ error: "Échec du traitement de la soumission" });
  }
});

// Routes Push
app.post('/api/push/subscribe', (req, res) => {
  const sub = req.body;
  pushManager.addSubscription(sub);
  res.status(201).json({});
});

app.post('/api/push/send', async (req, res) => {
  // Optionnellement sécuriser avec un token admin
  const { title, body, url } = req.body;
  await pushManager.sendNotificationToAll({ title, body, url });
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Serveur INFO + RDC exécuté sur le port ${PORT}`);
});
