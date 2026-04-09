<template>
  <section class="panel docs-page">
    <h1>Documentation TC</h1>
    <p>Les fichiers Markdown proviennent du dossier <code>/docs</code>.</p>

    <div class="doc-controls">
      <label for="doc-select">Document</label>
      <select id="doc-select" v-model="selectedKey">
        <option v-for="doc in docs" :key="doc.key" :value="doc.key">{{ doc.name }}</option>
      </select>
    </div>

    <article class="doc-render" v-html="renderedMarkdown"></article>
  </section>
</template>

<script setup>
import mermaid from 'mermaid';
import { marked } from 'marked';
import { computed, nextTick, onMounted, ref, watch } from 'vue';

const modules = import.meta.glob('../../docs/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
});

const docs = Object.entries(modules)
  .map(([path, content]) => ({
    key: path,
    name: path.split('/').pop().replace('.md', ''),
    content
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const selectedKey = ref(docs[0]?.key || '');

const renderedMarkdown = computed(() => {
  const active = docs.find((doc) => doc.key === selectedKey.value);

  if (!active) {
    return '<p>Aucune documentation disponible.</p>';
  }

  return marked.parse(active.content);
});

async function hydrateMermaid() {
  await nextTick();
  await mermaid.run({ querySelector: '.doc-render .language-mermaid' });
}

onMounted(async () => {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'neutral'
  });

  await hydrateMermaid();
});

watch(renderedMarkdown, async () => {
  await hydrateMermaid();
});
</script>

<style scoped>
.docs-page {
  animation: slideIn 0.5s ease-out;
}

.doc-controls {
  margin-bottom: 1rem;
}

select {
  margin-left: 0.5rem;
  border-radius: 999px;
  border: 1px solid rgba(29, 35, 45, 0.25);
  background: #fff;
  padding: 0.4rem 0.8rem;
}

.doc-render :deep(h2),
.doc-render :deep(h3) {
  margin-top: 1.2rem;
}

.doc-render :deep(pre) {
  overflow: auto;
  background: rgba(255, 255, 255, 0.67);
  border: 1px solid rgba(29, 35, 45, 0.15);
  border-radius: 12px;
  padding: 0.75rem;
}
</style>
