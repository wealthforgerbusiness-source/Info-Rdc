const express = require('express');
const path = require('path');
const app = express();

// ... TES MIDDLEWARES ET VOS ROUTES API (/api/news, etc.) EXISTANTES ...

// --- SERVIR LE FRONTEND (PWA) ---
// Indique à Express où se trouvent les fichiers HTML/CSS/JS de la PWA
app.use(express.static(path.join(__dirname, '../'))); 

// Pour toute autre requête qui n'est pas une API, renvoyer index.html
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur INFO + RDC lancé sur le port ${PORT}`));
