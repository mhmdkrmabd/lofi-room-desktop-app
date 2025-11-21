/**
 * Ambient Sounds Window Entry Point
 */

import Vue from 'vue';
import AmbientSoundsApp from './ambient-sounds-app.vue';
import '../renderer/styles.css'; // Reuse main styles

new Vue({
  render: (h) => h(AmbientSoundsApp),
}).$mount('#ambient-app');
