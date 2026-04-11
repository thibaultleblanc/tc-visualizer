<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="brand">TC Visualizer</div>
      <nav>
        <RouterLink to="/">Parser</RouterLink>
        <RouterLink to="/docs">Documentation</RouterLink>
      </nav>
    </header>

    <main class="content">
      <RouterView v-slot="{ Component }">
        <KeepAlive>
          <component :is="Component" />
        </KeepAlive>
      </RouterView>
    </main>
  </div>
</template>

<script setup>
import { KeepAlive } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
</script>
