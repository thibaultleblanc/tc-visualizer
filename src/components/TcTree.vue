<template>
  <div class="tree-wrap panel">
    <div class="tree-toolbar">
      <strong>Arbre qdisc/class/filter</strong>
      <span>Zoom: molette | Déplacement: glisser</span>
    </div>
    <svg ref="svgRef" class="tree-svg" role="img" aria-label="Arbre TC"></svg>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { hierarchy, linkHorizontal, select, tree, zoom } from 'd3';

const props = defineProps({
  treeData: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['node-click']);
const svgRef = ref(null);

function colorFromType(type) {
  if (type === 'device') return '#005f73';
  if (type === 'qdisc') return '#d1495b';
  if (type === 'class') return '#2a9d8f';
  if (type === 'filter') return '#6f42c1';
  return '#6c757d';
}

function renderTree(data) {
  const svg = select(svgRef.value);
  svg.selectAll('*').remove();

  if (!data) {
    return;
  }

  const width = svgRef.value.clientWidth || 960;
  const height = 620;

  svg.attr('viewBox', `0 0 ${width} ${height}`);

  const viewport = svg.append('g');
  svg.call(zoom().scaleExtent([0.45, 2]).on('zoom', (event) => viewport.attr('transform', event.transform)));

  const root = hierarchy(data);
  const layout = tree().nodeSize([42, 190]);
  layout(root);

  const xOffset = 44;
  const yOffset = 90;

  viewport
    .append('g')
    .selectAll('path')
    .data(root.links())
    .join('path')
    .attr('fill', 'none')
    .attr('stroke', 'rgba(29, 35, 45, 0.3)')
    .attr('stroke-width', 1.35)
    .attr(
      'd',
      linkHorizontal()
        .x((d) => d.y + yOffset)
        .y((d) => d.x + xOffset)
    );

  const nodes = viewport
    .append('g')
    .selectAll('g')
    .data(root.descendants())
    .join('g')
    .attr('transform', (d) => `translate(${d.y + yOffset}, ${d.x + xOffset})`)
    .style('cursor', 'pointer')
    .on('click', (_, d) => emit('node-click', d.data));

  nodes
    .append('circle')
    .attr('r', 8)
    .attr('fill', (d) => colorFromType(d.data.type))
    .attr('stroke', '#fff')
    .attr('stroke-width', 2);

  nodes
    .append('text')
    .attr('dy', 4)
    .attr('x', 13)
    .text((d) => d.data.label)
    .style('font-size', '0.82rem')
    .style('font-weight', (d) => (d.data.type === 'device' ? 700 : 500))
    .style('fill', '#1d232d');
}

onMounted(() => renderTree(props.treeData));
watch(() => props.treeData, (value) => renderTree(value), { deep: true });
</script>

<style scoped>
.tree-wrap {
  overflow: hidden;
}

.tree-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.6rem;
  color: #3f4750;
}

.tree-svg {
  width: 100%;
  height: 620px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.66);
}

@media (max-width: 800px) {
  .tree-toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
  }

  .tree-svg {
    height: 520px;
  }
}
</style>
