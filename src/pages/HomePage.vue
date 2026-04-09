<template>
  <section>
    <h1>Parser TC JSON</h1>
    <p>
      Cette page convertit les sorties JSON de <code>tc -j qdisc show</code> et
      <code>tc -j class show</code> en arbre interactif.
    </p>
    <TcParser />
  </section>
</template>

<script setup>
import TcParser from '../components/TcParser.vue';
</script>
