<template>
  <div class="tree-wrap panel">
    <div class="tree-toolbar">
      <strong>Arbre qdisc/class/filter</strong>
      <div class="toolbar-actions">
        <span>Zoom: molette | Déplacement: glisser</span>
        <button class="toggle-filters" @click="emit('toggle-filters')">
          {{ showFilters ? 'Cacher les filtres' : 'Afficher les filtres' }}
        </button>
      </div>
    </div>
    <svg ref="svgRef" class="tree-svg" role="img" aria-label="Arbre TC"></svg>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { hierarchy, linkHorizontal, select, tree, zoom, zoomIdentity } from 'd3';

const props = defineProps({
  treeData: {
    type: Object,
    default: null
  },
  showFilters: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['node-click', 'toggle-filters']);
const svgRef = ref(null);
const currentTransform = ref(zoomIdentity);

function colorFromType(type) {
  if (type === 'device') return '#005f73';
  if (type === 'qdisc') return '#d1495b';
  if (type === 'class') return '#2a9d8f';
  if (type === 'filter') return '#6f42c1';
  if (type === 'filter-group') return '#7c3aed';
  if (type === 'filter-pref') return '#8b5cf6';
  if (type === 'filter-table') return '#a78bfa';
  if (type === 'filter-rule') return '#6d28d9';
  return '#6c757d';
}

function cubicPointAt(link, t) {
  const inv = 1 - t;

  return {
    x:
      inv * inv * inv * link.sourceX +
      3 * inv * inv * t * link.controlX1 +
      3 * inv * t * t * link.controlX2 +
      t * t * t * link.targetX,
    y:
      inv * inv * inv * link.sourceY +
      3 * inv * inv * t * link.controlY1 +
      3 * inv * t * t * link.controlY2 +
      t * t * t * link.targetY
  };
}

function cubicTangentAt(link, t) {
  const inv = 1 - t;

  return {
    x:
      3 * inv * inv * (link.controlX1 - link.sourceX) +
      6 * inv * t * (link.controlX2 - link.controlX1) +
      3 * t * t * (link.targetX - link.controlX2),
    y:
      3 * inv * inv * (link.controlY1 - link.sourceY) +
      6 * inv * t * (link.controlY2 - link.controlY1) +
      3 * t * t * (link.targetY - link.controlY2)
  };
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
  const zoomBehavior = zoom()
    .scaleExtent([0.45, 2])
    .on('zoom', (event) => {
      viewport.attr('transform', event.transform);
      currentTransform.value = event.transform;
    });

  svg.call(zoomBehavior);
  svg.call(zoomBehavior.transform, currentTransform.value || zoomIdentity);

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

  const positionedNodes = root.descendants();
  const nodeById = new Map(positionedNodes.map((entry) => [entry.data.id, entry]));
  const linkSeed = (Array.isArray(data.raw?.filterLinks) ? data.raw.filterLinks : [])
    .map((link) => ({
      ...link,
      source: nodeById.get(link.sourceId),
      target: nodeById.get(link.targetId)
    }))
    .filter((link) => link.source && link.target);

  const sourceCounts = new Map();
  linkSeed.forEach((link) => {
    const currentCount = sourceCounts.get(link.sourceId) || 0;
    sourceCounts.set(link.sourceId, currentCount + 1);
  });

  const sourceIndexes = new Map();
  const filterLinks = linkSeed
    .sort((a, b) => a.sourceId.localeCompare(b.sourceId) || a.targetId.localeCompare(b.targetId))
    .map((link) => {
      const sourceIdx = sourceIndexes.get(link.sourceId) || 0;
      const sourceTotal = sourceCounts.get(link.sourceId) || 1;
      sourceIndexes.set(link.sourceId, sourceIdx + 1);

      const laneOffset = (sourceIdx - (sourceTotal - 1) / 2) * 20;
      const sourceX = link.source.y + yOffset;
      const sourceY = link.source.x + xOffset;
      const targetX = link.target.y + yOffset;
      const targetY = link.target.x + xOffset;
      const controlX1 = sourceX + (targetX - sourceX) * 0.33;
      const controlX2 = sourceX + (targetX - sourceX) * 0.67;
      const controlY1 = sourceY + laneOffset;
      const controlY2 = targetY + laneOffset;
      const path = `M ${sourceX} ${sourceY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${targetX} ${targetY}`;

      const cubicLink = {
        sourceX,
        sourceY,
        controlX1,
        controlY1,
        controlX2,
        controlY2,
        targetX,
        targetY
      };
      const anchor = cubicPointAt(cubicLink, 0.5);
      const tangent = cubicTangentAt(cubicLink, 0.5);
      const tangentLength = Math.hypot(tangent.x, tangent.y) || 1;
      const normalX = -tangent.y / tangentLength;
      const normalY = tangent.x / tangentLength;

      return {
        ...link,
        sourceX,
        sourceY,
        targetX,
        targetY,
        controlX1,
        controlY1,
        controlX2,
        controlY2,
        path,
        anchorX: anchor.x,
        anchorY: anchor.y,
        normalX,
        normalY,
        nodeX: anchor.x,
        nodeY: anchor.y
      };
    });

  const overlapBuckets = new Map();
  filterLinks.forEach((link) => {
    const bucketKey = `${Math.round(link.anchorX / 24)}:${Math.round(link.anchorY / 20)}`;

    if (!overlapBuckets.has(bucketKey)) {
      overlapBuckets.set(bucketKey, []);
    }

    overlapBuckets.get(bucketKey).push(link);
  });

  overlapBuckets.forEach((bucket) => {
    if (bucket.length < 2) {
      return;
    }

    bucket.forEach((link, idx) => {
      const spread = (idx - (bucket.length - 1) / 2) * 18;
      link.nodeX = link.anchorX + link.normalX * spread;
      link.nodeY = link.anchorY + link.normalY * spread;
    });
  });

  if (props.showFilters) {
    viewport
      .append('g')
      .selectAll('path')
      .data(filterLinks)
      .join('path')
      .attr('fill', 'none')
      .attr('stroke', '#7c3aed')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '7 5')
      .attr('opacity', 0.8)
      .attr('d', (link) => link.path);

    const filterRuleNodes = viewport
      .append('g')
      .selectAll('g')
      .data(filterLinks)
      .join('g')
      .attr('transform', (link) => `translate(${link.nodeX}, ${link.nodeY})`)
      .style('cursor', 'pointer')
      .on('click', (_, link) =>
        emit('node-click', {
          id: link.id,
          type: 'filter-rule',
          label: link.label,
          raw: link.raw,
          children: []
        })
      );

    filterRuleNodes
      .append('rect')
      .attr('x', -38)
      .attr('y', -11)
      .attr('rx', 10)
      .attr('ry', 10)
      .attr('width', 76)
      .attr('height', 22)
      .attr('fill', '#ffffff')
      .attr('stroke', '#6d28d9')
      .attr('stroke-width', 2);

    filterRuleNodes
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 4)
      .text((link) => link.label)
      .style('font-size', '0.72rem')
      .style('font-weight', 600)
      .style('fill', '#4c1d95');
  }

  const nodes = viewport
    .append('g')
    .selectAll('g')
    .data(positionedNodes)
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
watch(
  () => [props.treeData, props.showFilters],
  ([value]) => renderTree(value),
  { deep: true }
);
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

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.toggle-filters {
  border: 1px solid rgba(29, 35, 45, 0.25);
  border-radius: 999px;
  padding: 0.3rem 0.8rem;
  background: #fff;
  cursor: pointer;
  font-size: 0.76rem;
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

  .toolbar-actions {
    width: 100%;
    justify-content: space-between;
  }

  .tree-svg {
    height: 520px;
  }
}
</style>
