/**
 * Ambient Sounds Store
 * Centralized state management for ambient sounds
 */

import Vue from 'vue';
import { AmbientSoundPlayer } from './ambient-sound';
import {
  allAmbientSounds,
  builtInPresets,
  type AmbientPreset,
  type AmbientSound,
} from './ambient-sounds-data';

interface SoundState {
  isActive: boolean;
  volume: number; // 0.0 to 1.0
  player: AmbientSoundPlayer | null;
}

interface AmbientSoundsState {
  sounds: Record<string, SoundState>;
  masterVolume: number;
  isPlaying: boolean;
  currentPreset: string | null;
  customPresets: AmbientPreset[];
}

class AmbientSoundsStore {
  public state: AmbientSoundsState;

  constructor() {
    // Initialize state
    const sounds: Record<string, SoundState> = {};
    allAmbientSounds.forEach((sound) => {
      sounds[sound.id] = {
        isActive: false,
        volume: 0.5,
        player: null,
      };
    });

    this.state = Vue.observable({
      sounds,
      masterVolume: 0.7,
      isPlaying: true,
      currentPreset: null,
      customPresets: [],
    });
  }

  /**
   * Load persisted state from storage
   */
  async loadPersistedState(): Promise<void> {
    try {
      const persistedState = await window.electronAPI.loadAmbientState();
      if (persistedState) {
        // Restore master volume FIRST (before initializing players)
        if (persistedState.masterVolume !== undefined) {
          this.state.masterVolume = persistedState.masterVolume;
        }

        // Restore sound states
        if (persistedState.sounds) {
          Object.entries(persistedState.sounds).forEach(([id, soundData]: [string, any]) => {
            if (this.state.sounds[id]) {
              this.state.sounds[id].isActive = soundData.isActive || false;
              this.state.sounds[id].volume = soundData.volume ?? 0.5;

              // Initialize and auto-play active sounds if isPlaying is true
              if (soundData.isActive) {
                this.initPlayer(id);
                if (this.state.isPlaying && this.state.sounds[id].player) {
                  this.state.sounds[id].player.play();
                }
              }
            }
          });
        }

        // Restore current preset
        if (persistedState.currentPreset) {
          this.state.currentPreset = persistedState.currentPreset;
        }

        // Restore custom presets
        if (persistedState.customPresets && Array.isArray(persistedState.customPresets)) {
          this.state.customPresets = persistedState.customPresets;
        }
      }
    } catch (error) {
      console.error('Failed to load persisted ambient sounds state:', error);
    }
  }

  /**
   * Get serializable state (for persistence)
   */
  getSerializableState(): any {
    const serializedSounds: Record<string, { isActive: boolean; volume: number }> = {};
    Object.entries(this.state.sounds).forEach(([id, sound]) => {
      serializedSounds[id] = {
        isActive: sound.isActive,
        volume: sound.volume,
      };
    });

    return {
      sounds: serializedSounds,
      masterVolume: this.state.masterVolume,
      isPlaying: this.state.isPlaying,
      currentPreset: this.state.currentPreset,
      customPresets: this.state.customPresets,
    };
  }

  /**
   * Initialize a sound player
   */
  private initPlayer(soundId: string): void {
    const soundData = allAmbientSounds.find((s) => s.id === soundId);
    if (!soundData || this.state.sounds[soundId].player) return;

    const player = new AmbientSoundPlayer({
      src: soundData.src,
      volume: this.getAdjustedVolume(soundId),
      loop: true,
      preload: false,
    });

    this.state.sounds[soundId].player = player;
  }

  /**
   * Get adjusted volume (individual volume * master volume)
   */
  private getAdjustedVolume(soundId: string): number {
    const soundState = this.state.sounds[soundId];
    return soundState.volume * this.state.masterVolume;
  }

  /**
   * Toggle a sound on/off
   */
  toggleSound(soundId: string): void {
    const soundState = this.state.sounds[soundId];
    if (!soundState) return;

    soundState.isActive = !soundState.isActive;

    if (soundState.isActive) {
      // Initialize player if not exists
      if (!soundState.player) {
        this.initPlayer(soundId);
      }

      // Auto-play if isPlaying is true (respects user's play/pause preference)
      if (this.state.isPlaying && soundState.player) {
        soundState.player.play();
      }
    } else {
      // Pause the sound
      if (soundState.player) {
        soundState.player.pause();
      }
    }

    // Clear preset when manually changing sounds
    this.state.currentPreset = null;
  }

  /**
   * Set volume for a specific sound
   */
  setSoundVolume(soundId: string, volume: number): void {
    const soundState = this.state.sounds[soundId];
    if (!soundState) return;

    soundState.volume = Math.max(0, Math.min(1, volume));

    // Update player volume
    if (soundState.player) {
      soundState.player.setVolume(this.getAdjustedVolume(soundId));
    }

    // Clear preset when manually changing volumes
    this.state.currentPreset = null;
  }

  /**
   * Set master volume (affects all sounds)
   */
  setMasterVolume(volume: number): void {
    this.state.masterVolume = Math.max(0, Math.min(1, volume));

    // Update all active players
    Object.keys(this.state.sounds).forEach((soundId) => {
      const soundState = this.state.sounds[soundId];
      if (soundState.player && soundState.isActive) {
        soundState.player.setVolume(this.getAdjustedVolume(soundId));
      }
    });
  }

  /**
   * Toggle global play/pause
   */
  togglePlayPause(): void {
    this.state.isPlaying = !this.state.isPlaying;

    // Play or pause all active sounds
    Object.keys(this.state.sounds).forEach((soundId) => {
      const soundState = this.state.sounds[soundId];
      if (soundState.isActive && soundState.player) {
        if (this.state.isPlaying) {
          soundState.player.play();
        } else {
          soundState.player.pause();
        }
      }
    });
  }

  /**
   * Stop all sounds
   */
  stopAll(): void {
    Object.keys(this.state.sounds).forEach((soundId) => {
      const soundState = this.state.sounds[soundId];
      soundState.isActive = false;
      if (soundState.player) {
        soundState.player.stop();
      }
    });
    this.state.currentPreset = null;
  }

  /**
   * Load a preset
   */
  loadPreset(preset: AmbientPreset): void {
    // Stop all current sounds
    this.stopAll();

    // Activate preset sounds
    preset.sounds.forEach(({ id, volume }) => {
      const soundState = this.state.sounds[id];
      if (soundState) {
        soundState.isActive = true;
        soundState.volume = volume;

        // Initialize player
        if (!soundState.player) {
          this.initPlayer(id);
        }
        if (soundState.player) {
          soundState.player.setVolume(this.getAdjustedVolume(id));
          // Auto-play if isPlaying is true
          if (this.state.isPlaying) {
            soundState.player.play();
          }
        }
      }
    });

    this.state.currentPreset = preset.id;
  }

  /**
   * Save current state as custom preset
   */
  saveCustomPreset(name: string, description: string): void {
    const activeSounds = Object.entries(this.state.sounds)
      .filter(([_, state]) => state.isActive)
      .map(([id, state]) => ({
        id,
        volume: state.volume,
      }));

    if (activeSounds.length === 0) return;

    const newPreset: AmbientPreset = {
      id: `custom-${Date.now()}`,
      name,
      description,
      sounds: activeSounds,
    };

    this.state.customPresets.push(newPreset);
  }

  /**
   * Delete a custom preset
   */
  deleteCustomPreset(presetId: string): void {
    const index = this.state.customPresets.findIndex((p) => p.id === presetId);
    if (index !== -1) {
      this.state.customPresets.splice(index, 1);
      if (this.state.currentPreset === presetId) {
        this.state.currentPreset = null;
      }
    }
  }

  /**
   * Shuffle: randomly select 3-4 sounds
   */
  shuffle(): void {
    this.stopAll();

    const soundIds = allAmbientSounds.map((s) => s.id);
    const count = Math.floor(Math.random() * 2) + 3; // 3 or 4 sounds

    // Randomly select sounds
    const selected: string[] = [];
    while (selected.length < count && selected.length < soundIds.length) {
      const randomId = soundIds[Math.floor(Math.random() * soundIds.length)];
      if (!selected.includes(randomId)) {
        selected.push(randomId);
      }
    }

    // Activate with random volumes
    selected.forEach((soundId) => {
      const soundState = this.state.sounds[soundId];
      if (soundState) {
        soundState.isActive = true;
        soundState.volume = Math.random() * 0.6 + 0.3; // 0.3 to 0.9

        if (!soundState.player) {
          this.initPlayer(soundId);
        }
        if (soundState.player) {
          soundState.player.setVolume(this.getAdjustedVolume(soundId));
          // Auto-play if isPlaying is true
          if (this.state.isPlaying) {
            soundState.player.play();
          }
        }
      }
    });

    this.state.currentPreset = null;
  }

  /**
   * Get all presets (built-in + custom)
   */
  getAllPresets(): AmbientPreset[] {
    return [...builtInPresets, ...this.state.customPresets];
  }

  /**
   * Get count of active sounds
   */
  getActiveSoundCount(): number {
    return Object.values(this.state.sounds).filter((s) => s.isActive).length;
  }

  /**
   * Cleanup all players
   */
  destroy(): void {
    Object.values(this.state.sounds).forEach((soundState) => {
      if (soundState.player) {
        soundState.player.destroy();
        soundState.player = null;
      }
    });
  }
}

// Export singleton instance
export const ambientSoundsStore = new AmbientSoundsStore();
