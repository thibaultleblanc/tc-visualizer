# TC Visualizer

Site statique construit avec Vue 3 + Vite pour:

- Parser les sorties JSON de `tc -j qdisc show` / `tc -j class show` / `tc -j filter show`
- Visualiser la hierarchie qdisc/class/filter en arbre interactif
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

## Utilisation offline

Pour recuperer une copie locale du site et le consulter hors ligne :

```bash
wget https://github.com/thibaultleblanc/tc-visualizer/archive/refs/heads/gh-pages.tar.gz && tar -xzf gh-pages.tar.gz && cd tc-visualizer-gh-pages && python3 -m http.server 8000 --bind 127.0.0.1
```

La commande telecharge les pages et assets, puis reecrit les liens pour une navigation locale.

## Deploiement GitHub Pages

Le workflow GitHub Actions `.github/workflows/deploy.yml` publie automatiquement sur la branche `gh-pages` via le package `gh-pages` a chaque push sur `master`.

Si tu veux deployer en local:

```bash
npm install
npm run deploy
```
