<template>
  <section class="parser-grid">
    <div class="panel input-panel">
      <h2>Entrées JSON TC</h2>
      <p>Mode rapide: copie le one-liner, exécute-le sur la machine cible, puis colle le JSON dans la zone unique.</p>

      <label for="oneliner">One-liner de collecte</label>
      <textarea id="oneliner" :value="captureOneLiner" rows="4" readonly />

      <div class="actions">
        <button @click="copyOneLiner">Copier le one-liner</button>
      </div>

      <p v-if="copyMessage" class="copy-msg">{{ copyMessage }}</p>

      <div class="bundle-head">
        <label for="bundle-input">Collage unique (qdisc + classes + filtres)</label>
        <button
          type="button"
          class="inline-link"
          @click="showExampleExplanation = !showExampleExplanation"
        >
          {{ showExampleExplanation ? 'masquer l\'explication' : 'expliquer l\'exemple' }}
        </button>
      </div>
      <textarea
        id="bundle-input"
        v-model="bundleRaw"
        rows="10"
        placeholder='{"qdisc":[...],"classByDev":{"eth0":[...]},"filterByDev":{"eth0":[...]}}'
      />

      <div class="actions">
        <button class="primary" @click="buildTreeFromBundle">Parser le collage unique</button>
      </div>

      <details class="advanced-inputs">
        <summary>Mode avancé: trois blocs JSON séparés</summary>

        <label for="qdisc-input">qdisc JSON</label>
        <textarea id="qdisc-input" v-model="qdiscRaw" rows="10" />

        <label for="class-input">class JSON</label>
        <textarea id="class-input" v-model="classRaw" rows="10" />

        <label for="filter-input">filter JSON</label>
        <textarea id="filter-input" v-model="filterRaw" rows="10" />

        <div class="actions">
          <button @click="loadSample">Exemple</button>
          <button class="primary" @click="buildTree">Construire l'arbre</button>
        </div>
      </details>

      <p v-if="error" class="error">{{ error }}</p>
    </div>

    <TrafficProfileTable v-if="showExampleExplanation" :data="trafficProfile" class="profile-area" />

    <div class="panel details-panel">
      <div class="details-head">
        <h2>Détails du noeud</h2>
        <button v-if="selectedNode" class="toggle-json" @click="showRawJson = !showRawJson">
          {{ showRawJson ? 'Masquer JSON' : 'Voir JSON' }}
        </button>
      </div>

      <p v-if="!selectedNode">Clique un noeud dans l'arbre pour afficher ses propriétés.</p>

      <template v-else>
        <div class="node-meta">
          <span class="chip">{{ selectedNode.type }}</span>
          <strong>{{ selectedNode.label }}</strong>
        </div>

        <div class="kv-list">
          <div v-for="entry in nodeEntries" :key="entry.key" class="kv-row">
            <span class="kv-key">{{ entry.key }}</span>
            <span class="kv-value">{{ entry.value }}</span>
          </div>
        </div>

        <pre v-if="showRawJson">{{ JSON.stringify(selectedNode.raw, null, 2) }}</pre>
      </template>
    </div>

    <TcTree :tree-data="treeData" @node-click="selectNode" class="tree-area" />
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import TcTree from './TcTree.vue';
import TrafficProfileTable from './TrafficProfileTable.vue';
import defaultSampleBundle from '../data/oneliner_result.json';
import trafficProfile from '../data/default_traffic_profile.json';

const captureOneLiner =
  "q=\"$(tc -j qdisc show)\"; devs=\"$(echo \"$q\" | jq -r '.[].dev' | sort -u)\"; printf '{\"qdisc\":%s,\"classByDev\":{' \"$q\"; first=1; for dev in $devs; do [ $first -eq 0 ] && printf ','; first=0; printf '\"%s\":' \"$dev\"; tc -j class show dev \"$dev\"; done; printf '},\"filterByDev\":{' ; first=1; for dev in $devs; do [ $first -eq 0 ] && printf ','; first=0; printf '\"%s\":' \"$dev\"; tc -j filter show dev \"$dev\"; done; printf '}}\\n'";

const qdiscRaw = ref('[]');
const classRaw = ref('[]');
const filterRaw = ref('[]');
const bundleRaw = ref('');
const treeData = ref(null);
const selectedNode = ref(null);
const error = ref('');
const copyMessage = ref('');
const showRawJson = ref(false);
const showExampleExplanation = ref(false);

const nodeEntries = computed(() => {
  if (!selectedNode.value || !selectedNode.value.raw || typeof selectedNode.value.raw !== 'object') {
    return [];
  }

  return Object.entries(selectedNode.value.raw).map(([key, value]) => {
    if (value === null || value === undefined) {
      return { key, value: '-' };
    }

    if (typeof value === 'object') {
      return {
        key,
        value: Array.isArray(value) ? `${value.length} element(s)` : JSON.stringify(value)
      };
    }

    return { key, value: String(value) };
  });
});

function asArray(value, label) {
  let parsed;

  try {
    parsed = JSON.parse(value);
  } catch (jsonError) {
    throw new Error(`JSON invalide pour ${label}: ${jsonError.message}`);
  }

  if (!Array.isArray(parsed)) {
    throw new Error(`${label} doit etre un tableau JSON.`);
  }

  return parsed;
}

function ensureDeviceRoot(map, device, globalRoot) {
  if (map.has(device)) {
    return map.get(device);
  }

  const node = {
    id: `device:${device}`,
    type: 'device',
    label: device,
    raw: { dev: device },
    children: []
  };

  globalRoot.children.push(node);
  map.set(device, node);
  return node;
}

function buildTreeFromTc(qdiscItems, classItems, filterItems) {
  const root = { id: 'tc-root', type: 'root', label: 'TC', raw: {}, children: [] };
  const deviceMap = new Map();
  const qdiscByHandle = new Map();
  const classById = new Map();
  const filterNodes = [];

  qdiscItems.forEach((item, idx) => {
    const dev = item.dev || 'unknown';
    const handle = item.handle || `qauto-${idx}`;
    const node = {
      id: `qdisc:${dev}:${handle}`,
      type: 'qdisc',
      label: `${item.kind || 'qdisc'} (${handle})`,
      raw: item,
      parentHint: item.parent || 'root',
      dev,
      children: []
    };

    qdiscByHandle.set(handle, node);
    ensureDeviceRoot(deviceMap, dev, root);
  });

  classItems.forEach((item, idx) => {
    const dev = item.dev || 'unknown';
    const classid = item.classid || `cauto-${idx}`;
    const node = {
      id: `class:${dev}:${classid}`,
      type: 'class',
      label: `${item.kind || 'class'} (${classid})`,
      raw: item,
      parentHint: item.parent || '',
      dev,
      children: []
    };

    classById.set(classid, node);
    ensureDeviceRoot(deviceMap, dev, root);
  });

  filterItems.forEach((item, idx) => {
    const dev = item.dev || 'unknown';
    const parentHint = item.parent || item.classid || '';
    const pref = item.pref || 'pref?';
    const kind = item.kind || 'filter';
    const protocol = item.protocol || '';
    const node = {
      id: `filter:${dev}:${parentHint || 'none'}:${pref}:${kind}:${idx}`,
      type: 'filter',
      label: protocol ? `${kind} (pref ${pref}, ${protocol})` : `${kind} (pref ${pref})`,
      raw: item,
      parentHint,
      dev,
      children: []
    };

    filterNodes.push(node);
    ensureDeviceRoot(deviceMap, dev, root);
  });

  qdiscByHandle.forEach((node) => {
    const parentKey = node.parentHint;
    const devNode = ensureDeviceRoot(deviceMap, node.dev, root);

    if (!parentKey || parentKey === 'root') {
      devNode.children.push(node);
      return;
    }

    const parentClass = classById.get(parentKey);
    const parentQdisc = qdiscByHandle.get(parentKey);

    if (parentClass) {
      parentClass.children.push(node);
      return;
    }

    if (parentQdisc) {
      parentQdisc.children.push(node);
      return;
    }

    devNode.children.push(node);
  });

  classById.forEach((node) => {
    const parentKey = node.parentHint;
    const devNode = ensureDeviceRoot(deviceMap, node.dev, root);

    if (!parentKey) {
      devNode.children.push(node);
      return;
    }

    const parentClass = classById.get(parentKey);
    const parentQdisc = qdiscByHandle.get(parentKey);

    if (parentClass) {
      parentClass.children.push(node);
      return;
    }

    if (parentQdisc) {
      parentQdisc.children.push(node);
      return;
    }

    devNode.children.push(node);
  });

  filterNodes.forEach((node) => {
    const parentKey = node.parentHint;
    const devNode = ensureDeviceRoot(deviceMap, node.dev, root);

    if (!parentKey || parentKey === 'root') {
      devNode.children.push(node);
      return;
    }

    const parentClass = classById.get(parentKey);
    const parentQdisc = qdiscByHandle.get(parentKey);

    if (parentClass) {
      parentClass.children.push(node);
      return;
    }

    if (parentQdisc) {
      parentQdisc.children.push(node);
      return;
    }

    devNode.children.push(node);
  });

  return root;
}

function parseBundle(value) {
  let parsed;

  try {
    parsed = JSON.parse(value);
  } catch (jsonError) {
    throw new Error(`JSON invalide pour le collage unique: ${jsonError.message}`);
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Le collage unique doit etre un objet JSON.');
  }

  const qdiscs = Array.isArray(parsed.qdisc) ? parsed.qdisc : [];
  let classes = [];
  let filters = [];

  if (Array.isArray(parsed.classes)) {
    classes = parsed.classes;
  }

  if (parsed.classByDev && typeof parsed.classByDev === 'object' && !Array.isArray(parsed.classByDev)) {
    Object.entries(parsed.classByDev).forEach(([dev, classList]) => {
      if (!Array.isArray(classList)) {
        return;
      }

      classList.forEach((item) => {
        if (!item || typeof item !== 'object') {
          return;
        }

        classes.push({
          ...item,
          dev: item.dev || dev
        });
      });
    });
  }

  if (Array.isArray(parsed.filters)) {
    filters = parsed.filters;
  }

  if (parsed.filterByDev && typeof parsed.filterByDev === 'object' && !Array.isArray(parsed.filterByDev)) {
    Object.entries(parsed.filterByDev).forEach(([dev, filterList]) => {
      if (!Array.isArray(filterList)) {
        return;
      }

      filterList.forEach((item) => {
        if (!item || typeof item !== 'object') {
          return;
        }

        filters.push({
          ...item,
          dev: item.dev || dev
        });
      });
    });
  }

  return { qdiscs, classes, filters };
}

async function copyOneLiner() {
  copyMessage.value = '';

  try {
    await navigator.clipboard.writeText(captureOneLiner);
    copyMessage.value = 'One-liner copie.';
  } catch {
    copyMessage.value = 'Copie impossible, copie manuelle requise.';
  }
}

function buildTreeFromBundle() {
  error.value = '';
  copyMessage.value = '';

  try {
    const { qdiscs, classes, filters } = parseBundle(bundleRaw.value);

    qdiscRaw.value = JSON.stringify(qdiscs, null, 2);
    classRaw.value = JSON.stringify(classes, null, 2);
    filterRaw.value = JSON.stringify(filters, null, 2);
    treeData.value = buildTreeFromTc(qdiscs, classes, filters);
    selectedNode.value = null;
    showRawJson.value = false;
  } catch (runtimeError) {
    error.value = runtimeError.message;
  }
}

function buildTree() {
  error.value = '';

  try {
    const qdiscs = asArray(qdiscRaw.value, 'qdisc');
    const classes = asArray(classRaw.value, 'class');
    const filters = asArray(filterRaw.value, 'filter');

    treeData.value = buildTreeFromTc(qdiscs, classes, filters);
    selectedNode.value = null;
    showRawJson.value = false;
  } catch (runtimeError) {
    error.value = runtimeError.message;
  }
}

function selectNode(node) {
  selectedNode.value = node;
  showRawJson.value = false;
}

function loadSample() {
  bundleRaw.value = JSON.stringify(defaultSampleBundle, null, 2);

  buildTreeFromBundle();
}

loadSample();
</script>

<style scoped>
.parser-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(300px, 1fr);
  grid-template-areas:
    'input input'
    'profile profile'
    'tree details';
  gap: 1rem;
}

.input-panel,
.details-panel {
  animation: slideIn 0.55s ease-out;
}

.input-panel {
  grid-area: input;
}

.details-panel {
  grid-area: details;
}

.profile-area {
  grid-area: profile;
}

.bundle-head {
  margin-top: 0.6rem;
  margin-bottom: 0.25rem;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.6rem;
}

.bundle-head label {
  margin: 0;
}

.inline-link {
  border: none;
  background: transparent;
  color: #0a4a92;
  text-decoration: underline;
  padding: 0;
  border-radius: 0;
  font-size: 0.82rem;
  font-weight: 600;
}

.inline-link:hover {
  color: #06356b;
}

.details-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}

.toggle-json {
  font-size: 0.78rem;
  padding: 0.3rem 0.7rem;
}

.node-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.7rem;
}

.chip {
  background: rgba(0, 95, 115, 0.1);
  border: 1px solid rgba(0, 95, 115, 0.25);
  color: #005f73;
  border-radius: 999px;
  padding: 0.15rem 0.5rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
}

.kv-list {
  border: 1px solid rgba(29, 35, 45, 0.12);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.62);
  overflow: hidden;
}

.kv-row {
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 0.6rem;
  padding: 0.45rem 0.65rem;
  border-bottom: 1px solid rgba(29, 35, 45, 0.08);
}

.kv-row:last-child {
  border-bottom: none;
}

.kv-key {
  color: #4b5563;
  font-weight: 600;
}

.kv-value {
  color: #111827;
  word-break: break-word;
}

label {
  display: block;
  margin-top: 0.6rem;
  margin-bottom: 0.25rem;
  font-weight: 600;
}

textarea {
  width: 100%;
  padding: 0.7rem;
  border: 1px solid rgba(29, 35, 45, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.65);
  resize: vertical;
}

.actions {
  margin-top: 0.9rem;
  display: flex;
  gap: 0.6rem;
}

.copy-msg {
  margin-top: 0.6rem;
  color: #0a7a37;
  font-weight: 600;
}

.advanced-inputs {
  margin-top: 0.8rem;
  border: 1px dashed rgba(29, 35, 45, 0.25);
  border-radius: 12px;
  padding: 0.6rem 0.7rem;
}

.advanced-inputs summary {
  cursor: pointer;
  font-weight: 600;
}

button {
  border: 1px solid rgba(29, 35, 45, 0.25);
  border-radius: 999px;
  padding: 0.45rem 1rem;
  background: #fff;
  cursor: pointer;
}

button.primary {
  background: #005f73;
  color: #fff;
  border-color: #005f73;
}

.error {
  margin-top: 0.75rem;
  color: #b80f2f;
  font-weight: 600;
}

pre {
  max-height: 355px;
  overflow: auto;
  padding: 0.8rem;
  border-radius: 12px;
  border: 1px solid rgba(29, 35, 45, 0.15);
  background: rgba(255, 255, 255, 0.65);
}

.tree-area {
  grid-area: tree;
}

@media (max-width: 1000px) {
  .parser-grid {
    grid-template-columns: 1fr;
    grid-template-areas:
      'input'
      'profile'
      'details'
      'tree';
  }

  .kv-row {
    grid-template-columns: 1fr;
    gap: 0.15rem;
  }
}
</style>
