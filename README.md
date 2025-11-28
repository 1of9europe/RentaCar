# Analyseur d'affaires Alcopa / Leboncoin

Outil TypeScript/Node.js pour vérifier si un véhicule acheté sur Alcopa peut être revendu avec marge sur Leboncoin.

## Objectifs
- Scraper une salle de vente Alcopa complète (liste + fiches détail) avec Playwright.
- Normaliser, enrichir (stub ChatGPT) et stocker les données dans `data/`.
- Comparer avec des annonces Leboncoin similaires et calculer un prix de revente estimé.
- Évaluer si l'affaire est intéressante en tenant compte des frais (~15 %) et réparations.

Flux : Scraping → Normalisation → Enrichissement → Comparaison → Évaluation.

## Installation
1. Cloner le dépôt.
2. Installer les dépendances npm :
   ```bash
   npm install
   ```
3. Lancer la démo :
   ```bash
   npm run dev
   ```

Scripts utiles :
- `npm run scrape:alcopa -- <URL_SALLE>` – scrape la salle et génère `data/alcopa-<saleId>.json`.
- `npm run build` puis `npm start` – compilation + exécution depuis `dist/`.
- `npm test` – tests rapides sur la normalisation / parsing.

## Limitations actuelles
- Données Leboncoin mockées depuis `data/leboncoin-samples.json`.
- Enrichissement ChatGPT non implémenté (stubs et TODOs en place).
- Persistance limitée à des fichiers JSON locaux.
- Sélecteurs Alcopa basés sur analyse actuelle : à ajuster si le DOM évolue.

## Évolutions futures
- Intégrer une vraie API Leboncoin / lobstr.io avec critères (km, année, rayon).
- Connecter l'API OpenAI pour l'enrichissement automatique.
- Ajouter une base de données pour l'historique des enchères.
- Construire une interface web ou dashboard pour piloter les analyses.
