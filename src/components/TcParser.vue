<template>
  <section class="parser-grid">
    <div class="panel input-panel">
      <h2>Entrées JSON TC</h2>
      <p>Colle la sortie de <code>tc -j qdisc show</code> et <code>tc -j class show</code>.</p>

      <label for="qdisc-input">qdisc JSON</label>
      <textarea id="qdisc-input" v-model="qdiscRaw" rows="10" />

      <label for="class-input">class JSON</label>
      <textarea id="class-input" v-model="classRaw" rows="10" />

      <div class="actions">
        <button @click="loadSample">Exemple</button>
        <button class="primary" @click="buildTree">Construire l'arbre</button>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
    </div>

    <div class="panel details-panel">
      <h2>Détails du noeud</h2>
      <p v-if="!selectedNode">Clique un noeud dans l'arbre pour afficher ses propriétés.</p>
      <pre v-else>{{ JSON.stringify(selectedNode.raw, null, 2) }}</pre>
    </div>

    <TcTree :tree-data="treeData" @node-click="selectedNode = $event" class="tree-area" />
  </section>
</template>

<script setup>
import { ref } from 'vue';
import TcTree from './TcTree.vue';

const qdiscRaw = ref('[]');
const classRaw = ref('[]');
const treeData = ref(null);
const selectedNode = ref(null);
const error = ref('');

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

function buildTreeFromTc(qdiscItems, classItems) {
  const root = { id: 'tc-root', type: 'root', label: 'TC', raw: {}, children: [] };
  const deviceMap = new Map();
  const qdiscByHandle = new Map();
  const classById = new Map();

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

  return root;
}

function buildTree() {
  error.value = '';

  try {
    const qdiscs = asArray(qdiscRaw.value, 'qdisc');
    const classes = asArray(classRaw.value, 'class');

    treeData.value = buildTreeFromTc(qdiscs, classes);
    selectedNode.value = null;
  } catch (runtimeError) {
    error.value = runtimeError.message;
  }
}

function loadSample() {
  qdiscRaw.value = JSON.stringify(
    [
      { dev: 'eth0', kind: 'htb', handle: '1:', parent: 'root' },
      { dev: 'eth0', kind: 'fq_codel', handle: '10:', parent: '1:10' },
      { dev: 'eth0', kind: 'fq_codel', handle: '20:', parent: '1:20' }
    ],
    null,
    2
  );

  classRaw.value = JSON.stringify(
    [
      { dev: 'eth0', kind: 'htb', classid: '1:1', parent: '1:' },
      { dev: 'eth0', kind: 'htb', classid: '1:10', parent: '1:1' },
      { dev: 'eth0', kind: 'htb', classid: '1:20', parent: '1:1' }
    ],
    null,
    2
  );

  buildTree();
}

loadSample();
</script>

<style scoped>
.parser-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.input-panel,
.details-panel {
  animation: slideIn 0.55s ease-out;
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
  grid-column: 1 / span 2;
}

@media (max-width: 1000px) {
  .parser-grid {
    grid-template-columns: 1fr;
  }

  .tree-area {
    grid-column: 1;
  }
}
</style>
