<template>
  <section>
    <h1>Parser TC JSON</h1>
    <p>
      Cette page fournit un one-liner pret a copier pour recuperer
      <code>qdisc</code> + <code>class</code> (par interface), puis coller le
      resultat en une seule fois pour construire l'arbre interactif.
    </p>
    <TcParser />
  </section>
</template>

<script setup>
import TcParser from '../components/TcParser.vue';
</script>
