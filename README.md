# INFO + RDC — Guide de Déploiement & Configuration

> « Toute l'information utile de la RDC, au même endroit. »

## 1. Google Sheets & Apps Script
1. Créez un Google Sheet nommé `INFO_RDC_DB`.
2. Créez une feuille nommée `PUBLICATIONS` avec les en-têtes exacts sur la ligne 1 :
   `ID`, `TYPE`, `CATEGORIE`, `TITRE`, `TEXTE`, `LIEN`, `DATE_PUBLICATION`, `DATE_DEBUT`, `DATE_FIN`, `VILLE`, `LIEU`, `EMAIL`, `STATUT`, `NOTIFICATION`
3. Allez dans `Extensions > Apps Script`.
4. Remplacez le code par le fichier `google-apps-script/Code.gs`.
5. Cliquez sur **Déployer > Nouveau déploiement > Application Web**.
   - Accès : *N'importe qui (Anyone)*.
6. Copiez l'URL de déploiement et insérez-la dans la variable `GAS_API_URL` du backend.

## 2. Configuration Backend Render
1. Créez un Web Service Node.js sur **Render**.
2. Liez le dossier `backend/`.
3. Configurez les variables d'environnement (.env) :
   - `GAS_API_URL`
   - `VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `MODERATION_BLOCKED_WORDS`

## 3. Utilisation & Gestion du Logo
- Le fichier `logo.jpg` présent à la racine du projet sert d'icône PWA, d'illustration par défaut et de logo de marque dans le Header.
- Ne le renommez pas pour conserver les liaisons manifest & PWA.

## 4. Modération des annonces
- Toute annonce soumise via le bouton public arrive dans Google Sheets avec le statut `attente`.
- Passez manuellement la cellule `STATUT` à `actif` pour la publier sur le frontend.
