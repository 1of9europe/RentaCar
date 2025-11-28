# Analyseur d'affaires Alcopa / Leboncoin

Outil TypeScript/Node.js pour vérifier si un véhicule acheté sur Alcopa peut être revendu avec marge sur Leboncoin.

## Objectifs
- Scraper une fiche véhicule Alcopa avec Playwright (structure prête, sélecteurs à compléter).
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
- `npm run scrape:alcopa` – lance le scraper Playwright (mock actuellement).
- `npm run build` puis `npm start` – compilation + exécution depuis `dist/`.

## Limitations actuelles
- Données Leboncoin mockées depuis `data/leboncoin-samples.json`.
- Enrichissement ChatGPT non implémenté (stubs et TODOs en place).
- Persistance limitée à des fichiers JSON locaux.

## Évolutions futures
- Intégrer une vraie API Leboncoin / lobstr.io avec critères (km, année, rayon).
- Connecter l'API OpenAI pour l'enrichissement automatique.
- Ajouter une base de données pour l'historique des enchères.
- Construire une interface web ou dashboard pour piloter les analyses.
