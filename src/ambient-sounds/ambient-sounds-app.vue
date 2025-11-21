<template>
  <div id="ambient-root" :class="{ darkTheme: darkTheme }">
    <!-- Gradient background -->
    <div class="ambient-gradient-bg"></div>

    <div class="ambient-window">
      <!-- Header with window controls -->
      <div class="ambient-header">
        <h2>Ambient Sounds</h2>
        <div class="ambient-header-controls">
          <button class="ambient-btn" @click="togglePlayPause" :title="isPlaying ? 'Pause All' : 'Play All'">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <use v-if="isPlaying" xlink:href="#i-pause" />
              <use v-else xlink:href="#i-play" />
            </svg>
          </button>
          <button class="ambient-btn" @click="shuffle" title="Shuffle">
            <svg width="20" height="20">
              <use xlink:href="#i-shuffle" />
            </svg>
          </button>
          <button class="ambient-btn" @click="clearAll" title="Clear All">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <use xlink:href="#i-clear" />
            </svg>
          </button>
          <button class="ambient-btn-close" @click="closeWindow" title="Close">
            <svg width="20" height="20">
              <use xlink:href="#i-close" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Master Controls -->
      <div class="ambient-master-controls">
        <div class="ambient-control-row">
          <label>Master Volume</label>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            :value="masterVolume * 100"
            @input="setMasterVolume($event)"
            class="ambient-slider"
          />
          <span class="ambient-volume-label">{{ Math.round(masterVolume * 100) }}%</span>
        </div>

        <div class="ambient-control-row">
          <label>Preset</label>
          <select v-model="selectedPreset" @change="applyPreset" class="ambient-select">
            <option :value="null">None</option>
            <option v-for="preset in allPresets" :key="preset.id" :value="preset.id">
              {{ preset.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Sound Categories -->
      <div class="ambient-content">
        <div v-for="category in categories" :key="category.id" class="ambient-category">
          <h3 class="ambient-category-title">
            <svg width="16" height="16">
              <use :xlink:href="category.icon" />
            </svg>
            {{ category.title }}
          </h3>
          <div class="ambient-sounds-grid">
            <div
              v-for="sound in category.sounds"
              :key="sound.id"
              class="ambient-sound"
              :class="{ active: getSoundState(sound.id).isActive }"
            >
              <button class="ambient-sound-toggle" @click="toggleSound(sound.id)">
                <svg width="24" height="24">
                  <use :xlink:href="sound.icon" />
                </svg>
                <span>{{ sound.label }}</span>
              </button>
              <div v-if="getSoundState(sound.id).isActive" class="ambient-sound-volume">
                <input
                  type="range"
                  min="0"
                  max="100"
                  :value="getSoundState(sound.id).volume * 100"
                  @input="setSoundVolume(sound.id, $event)"
                  class="ambient-slider-small"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Sounds Counter -->
      <div class="ambient-footer">
        <span>{{ activeCount }} sound{{ activeCount !== 1 ? 's' : '' }} playing</span>
      </div>
    </div>

    <!-- Include SVG icons -->
    <svg display="none">
      <!-- UI Control Icons -->
      <symbol viewBox="0 0 24 24" id="i-play">
        <polygon fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="5 3 19 12 5 21 5 3"/>
      </symbol>
      <symbol viewBox="0 0 24 24" id="i-pause">
        <rect fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" x="6" y="4" width="4" height="16"/>
        <rect fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" x="14" y="4" width="4" height="16"/>
      </symbol>
      <symbol viewBox="0 0 24 24" id="i-shuffle">
        <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>
      </symbol>
      <symbol viewBox="0 0 24 24" id="i-close">
        <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M18 6 6 18M6 6l12 12"/>
      </symbol>
      <symbol viewBox="0 0 24 24" id="i-clear">
        <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
      </symbol>

      <!-- Inject Lucide icons dynamically -->
      <g v-html="iconSymbols"></g>
    </svg>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { ambientCategories, builtInPresets } from '../renderer/ambient-sounds-data';
import { generateIconSymbols } from '../renderer/lucide-icons';

interface SoundState {
  isActive: boolean;
  volume: number;
}

export default Vue.extend({
  name: 'AmbientSoundsApp',
  data() {
    return {
      categories: ambientCategories,
      selectedPreset: null as string | null,
      sounds: {} as Record<string, SoundState>,
      masterVolume: 1,
      isPlaying: true,
      darkTheme: true,
      iconSymbols: generateIconSymbols(),
    };
  },
  computed: {
    allPresets() {
      return builtInPresets;
    },
    activeCount(): number {
      return Object.values(this.sounds).filter((s) => s.isActive).length;
    },
  },
  mounted() {
    // Request initial state from main window
    window.electronAPI.ambientRequestState();

    // Listen for state updates from main window
    window.electronAPI.onAmbientStateUpdate((state: any) => {
      this.sounds = state.sounds || {};
      this.masterVolume = state.masterVolume !== undefined ? state.masterVolume : 1;
      this.isPlaying = state.isPlaying !== undefined ? state.isPlaying : true;
      this.selectedPreset = state.currentPreset || null;
      this.darkTheme = state.darktheme !== undefined ? state.darktheme : true;
    });
  },
  methods: {
    closeWindow() {
      window.close();
    },
    togglePlayPause() {
      window.electronAPI.ambientTogglePlayPause();
    },
    getSoundState(soundId: string) {
      return this.sounds[soundId] || { isActive: false, volume: 0.5 };
    },
    toggleSound(soundId: string) {
      window.electronAPI.ambientToggleSound(soundId);
      this.selectedPreset = null;
    },
    setSoundVolume(soundId: string, event: Event) {
      const target = event.target as HTMLInputElement;
      const volume = parseInt(target.value) / 100;
      window.electronAPI.ambientSetSoundVolume(soundId, volume);
      this.selectedPreset = null;
    },
    setMasterVolume(event: Event) {
      const target = event.target as HTMLInputElement;
      const volume = parseInt(target.value) / 100;
      window.electronAPI.ambientSetMasterVolume(volume);
    },
    applyPreset() {
      if (!this.selectedPreset) {
        window.electronAPI.ambientStopAll();
        return;
      }
      window.electronAPI.ambientLoadPreset(this.selectedPreset);
    },
    shuffle() {
      window.electronAPI.ambientShuffle();
      this.selectedPreset = null;
    },
    clearAll() {
      window.electronAPI.ambientStopAll();
      this.selectedPreset = null;
    },
  },
});
</script>

<style scoped>
/* Sniglet Font */
@font-face {
  font-family: 'Sniglet';
  src: url('../renderer/assets/fonts/Sniglet/Sniglet-Regular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Sniglet';
  src: url('../renderer/assets/fonts/Sniglet/Sniglet-ExtraBold.ttf') format('truetype');
  font-weight: 800;
  font-style: normal;
  font-display: swap;
}

#ambient-root {
  width: 100%;
  height: 100vh;
  position: relative;
  background: var(--bg);
  overflow: hidden;
  font-family: 'Sniglet', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Ensure buttons and selects use Sniglet */
#ambient-root button,
#ambient-root select {
  font-family: 'Sniglet', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

#ambient-root.darkTheme {
  --text: #fff;
  --bg: #1a1a1a;
  --shadow: rgba(0, 0, 0, 0.5);
}

.ambient-gradient-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(98, 204, 149, 0.1), rgba(93, 157, 217, 0.1));
  z-index: 0;
}

.ambient-window {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
}

/* Reuse styles from modal */
.ambient-header {
  padding: 20px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  -webkit-app-region: drag; /* Allow window dragging */
}

.ambient-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
}

.ambient-header-controls {
  display: flex;
  gap: 8px;
  -webkit-app-region: no-drag; /* Buttons should be clickable */
}

.ambient-btn,
.ambient-btn-close {
  background: none;
  border: none;
  color: var(--text);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  opacity: 0.7;
  transition: opacity 0.2s, background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ambient-btn:hover,
.ambient-btn-close:hover {
  opacity: 1;
  background: rgba(128, 128, 128, 0.1);
}

.ambient-master-controls {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ambient-control-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ambient-control-row label {
  min-width: 100px;
  font-size: 14px;
  color: var(--text);
  opacity: 0.8;
}

.ambient-select {
  flex: 1;
  background: rgba(128, 128, 128, 0.1);
  border: 1px solid rgba(128, 128, 128, 0.2);
  border-radius: 8px;
  padding: 8px 12px;
  color: var(--text);
  font-size: 14px;
  cursor: pointer;
}

.ambient-slider {
  flex: 1;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(128, 128, 128, 0.2);
  border-radius: 2px;
  outline: none;
}

.ambient-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--text);
  cursor: pointer;
}

.ambient-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--text);
  cursor: pointer;
  border: none;
}

.ambient-volume-label {
  min-width: 40px;
  text-align: right;
  font-size: 13px;
  color: var(--text);
  opacity: 0.7;
}

.ambient-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.ambient-category {
  margin-bottom: 24px;
}

.ambient-category:last-child {
  margin-bottom: 0;
}

.ambient-category-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ambient-sounds-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.ambient-sound {
  background: rgba(128, 128, 128, 0.05);
  border-radius: 12px;
  overflow: hidden;
  transition: background 0.2s, transform 0.2s;
}

.ambient-sound.active {
  background: rgba(128, 128, 128, 0.15);
}

.ambient-sound-toggle {
  width: 100%;
  background: none;
  border: none;
  padding: 16px 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text);
  opacity: 0.6;
  transition: opacity 0.2s;
}

.ambient-sound.active .ambient-sound-toggle {
  opacity: 1;
}

.ambient-sound-toggle:hover {
  opacity: 1;
}

.ambient-sound-toggle span {
  font-size: 12px;
  text-align: center;
}

.ambient-sound-volume {
  padding: 0 12px 12px;
  position: relative;
  bottom: 5px;
}

.ambient-slider-small {
  width: 100%;
  height: 3px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(128, 128, 128, 0.2);
  border-radius: 2px;
  outline: none;
}

.ambient-slider-small::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--text);
  cursor: pointer;
}

.ambient-slider-small::-moz-range-thumb {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--text);
  cursor: pointer;
  border: none;
}

.ambient-footer {
  padding: 12px 20px;
  border-top: 1px solid rgba(128, 128, 128, 0.2);
  text-align: center;
  font-size: 13px;
  color: var(--text);
  opacity: 0.6;
}

/* Custom scrollbar styling */
.ambient-content::-webkit-scrollbar {
  width: 8px;
}

.ambient-content::-webkit-scrollbar-track {
  background: rgba(128, 128, 128, 0.1);
  border-radius: 4px;
}

.ambient-content::-webkit-scrollbar-thumb {
  background: rgba(128, 128, 128, 0.3);
  border-radius: 4px;
  transition: background 0.2s;
}

.ambient-content::-webkit-scrollbar-thumb:hover {
  background: rgba(128, 128, 128, 0.5);
}

/* Custom select styling */
.ambient-select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
}

.ambient-select:hover {
  background-color: rgba(128, 128, 128, 0.15);
  border-color: rgba(128, 128, 128, 0.3);
}

.ambient-select:focus {
  outline: none;
  border-color: rgba(128, 128, 128, 0.4);
  background-color: rgba(128, 128, 128, 0.15);
}

.ambient-select option {
  background-color: #1a1a1a;
  color: #fff;
  padding: 8px;
}

#ambient-root:not(.darkTheme) .ambient-select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333333' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
}

#ambient-root:not(.darkTheme) .ambient-select option {
  background-color: #fff;
  color: #333;
}
</style>
