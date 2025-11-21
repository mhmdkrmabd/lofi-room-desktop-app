<template>
  <div v-if="visible" class="ambient-modal-overlay" @click="close">
    <div class="ambient-modal" @click.stop>
      <!-- Header -->
      <div class="ambient-header">
        <h2>Ambient Sounds</h2>
        <div class="ambient-header-controls">
          <button class="ambient-btn" @click="shuffle" title="Shuffle">
            <svg width="20" height="20">
              <use xlink:href="#i-shuffle" />
            </svg>
          </button>
          <button class="ambient-btn-close" @click="close" title="Close">
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
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { ambientSoundsStore } from '../ambient-sounds-store';
import { ambientCategories } from '../ambient-sounds-data';

export default Vue.extend({
  name: 'AmbientSoundsModal',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      categories: ambientCategories,
      selectedPreset: null as string | null,
    };
  },
  computed: {
    masterVolume(): number {
      return ambientSoundsStore.state.masterVolume;
    },
    allPresets() {
      return ambientSoundsStore.getAllPresets();
    },
    activeCount(): number {
      return ambientSoundsStore.getActiveSoundCount();
    },
  },
  methods: {
    close() {
      this.$emit('close');
    },
    getSoundState(soundId: string) {
      return ambientSoundsStore.state.sounds[soundId] || { isActive: false, volume: 0.5 };
    },
    toggleSound(soundId: string) {
      ambientSoundsStore.toggleSound(soundId);
      this.selectedPreset = ambientSoundsStore.state.currentPreset;
    },
    setSoundVolume(soundId: string, event: Event) {
      const target = event.target as HTMLInputElement;
      const volume = parseInt(target.value) / 100;
      ambientSoundsStore.setSoundVolume(soundId, volume);
      this.selectedPreset = null;
    },
    setMasterVolume(event: Event) {
      const target = event.target as HTMLInputElement;
      const volume = parseInt(target.value) / 100;
      ambientSoundsStore.setMasterVolume(volume);
    },
    applyPreset() {
      if (!this.selectedPreset) {
        ambientSoundsStore.stopAll();
        return;
      }
      const preset = this.allPresets.find((p) => p.id === this.selectedPreset);
      if (preset) {
        ambientSoundsStore.loadPreset(preset);
      }
    },
    shuffle() {
      ambientSoundsStore.shuffle();
      this.selectedPreset = null;
    },
  },
});
</script>

<style scoped>
/* Modal Overlay */
.ambient-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Modal Container */
.ambient-modal {
  background: var(--bg);
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Header */
.ambient-header {
  padding: 20px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
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

/* Master Controls */
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

/* Content Area */
.ambient-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

/* Category */
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

/* Sounds Grid */
.ambient-sounds-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

/* Individual Sound */
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

/* Footer */
.ambient-footer {
  padding: 12px 20px;
  border-top: 1px solid rgba(128, 128, 128, 0.2);
  text-align: center;
  font-size: 13px;
  color: var(--text);
  opacity: 0.6;
}
</style>
