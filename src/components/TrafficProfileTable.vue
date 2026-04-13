<template>
  <section class="panel traffic-profile" aria-labelledby="traffic-profile-title">
    <div class="head">
      <h2 id="traffic-profile-title">Profil de trafic de l'exemple par defaut</h2>
      <p>Tableau de reference correspondant au jeu de donnees charge automatiquement.</p>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th v-for="header in data.headers" :key="header">{{ header }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in data.rows" :key="`${row.interface}-${row.trafficType}`">
            <td>{{ row.interface }}</td>
            <td>{{ row.trafficType }}</td>
            <td>{{ row.bandwidth }}</td>
            <td>{{ row.priority }}</td>
            <td>{{ row.maxLatency }}</td>
            <td>{{ row.protection }}</td>
            <td>{{ row.egressQueue }}</td>
            <td>{{ row.goal }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="table-footer">
      Voir aussi: <a href="https://github.com/thibaultleblanc/tc-visualizer/blob/master/test/example_tc_config.sh" target="_blank">exemple complet de configuration TC</a>
    </p>
  </section>
</template>

<script setup>
defineProps({
  data: {
    type: Object,
    required: true
  }
});
</script>

<style scoped>
.traffic-profile {
  margin-bottom: 1rem;
}

.head p {
  margin-top: 0.35rem;
  margin-bottom: 0.8rem;
  color: #495161;
}

.table-footer {
  margin-top: 0.6rem;
  font-size: 0.74rem;
  color: #495161;
}

.table-footer a {
  color: #0a4a92;
  text-decoration: none;
}

.table-footer a:hover {
  text-decoration: underline;
}

.table-wrap {
  overflow-x: auto;
  border: 1px solid rgba(29, 35, 45, 0.1);
  border-radius: 12px;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 980px;
  background: rgba(255, 255, 255, 0.75);
}

thead th {
  position: sticky;
  top: 0;
  background: #edf2f7;
  color: #1f2937;
  font-weight: 700;
  font-size: 0.76rem;
}

th,
td {
  text-align: left;
  vertical-align: top;
  padding: 0.58rem 0.62rem;
  border-bottom: 1px solid rgba(29, 35, 45, 0.08);
}

td {
  font-size: 0.74rem;
}

tbody tr:hover {
  background: rgba(0, 95, 115, 0.06);
}

tbody tr:last-child td {
  border-bottom: none;
}
</style>
