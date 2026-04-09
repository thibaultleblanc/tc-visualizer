# TC Visualizer

Site statique construit avec Vue 3 + Vite pour:

- Parser les sorties JSON de `tc -j qdisc show` / `tc -j class show`
- Visualiser la hierarchie qdisc/class en arbre interactif
- Afficher la documentation Markdown depuis `docs/`

## Demarrage en conteneur

### 1. Lancer le mode dev

```bash
docker compose up --build web
```

Application disponible sur `http://localhost:5173`.

### 2. Lancer un apercu de build

```bash
docker compose up --build preview
```

Apercu disponible sur `http://localhost:4173`.

## Deploiement GitHub Pages

Le workflow GitHub Actions `.github/workflows/deploy.yml` publie automatiquement sur la branche `gh-pages` via le package `gh-pages` a chaque push sur `master`.

Si tu veux deployer en local:

```bash
npm install
npm run deploy
```
