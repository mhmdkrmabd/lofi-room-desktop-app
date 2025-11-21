/**
 * Ambient Sound Player
 * Wrapper around Howler.js for managing individual ambient sounds
 */

import { Howl } from 'howler';

export interface AmbientSoundOptions {
  src: string;
  volume?: number;
  loop?: boolean;
  preload?: boolean;
  onLoad?: () => void;
  onLoadError?: (error: any) => void;
}

export class AmbientSoundPlayer {
  private howl: Howl | null = null;
  private src: string;
  private defaultVolume: number;
  private loaded: boolean = false;
  private loading: boolean = false;

  constructor(options: AmbientSoundOptions) {
    this.src = options.src;
    this.defaultVolume = options.volume ?? 0.5;

    // Create Howl instance
    this.howl = new Howl({
      src: [this.src],
      loop: options.loop ?? true,
      volume: this.defaultVolume,
      preload: options.preload ?? false,
      html5: false, // Use Web Audio API for better performance
      onload: () => {
        this.loaded = true;
        this.loading = false;
        options.onLoad?.();
      },
      onloaderror: (_id, error) => {
        this.loading = false;
        console.error(`Failed to load sound: ${this.src}`, error);
        options.onLoadError?.(error);
      },
    });
  }

  /**
   * Play the sound
   */
  play(): void {
    if (!this.howl) return;

    // If not loaded yet, trigger loading
    if (!this.loaded && !this.loading) {
      this.loading = true;
      this.howl.load();
    }

    this.howl.play();
  }

  /**
   * Pause the sound
   */
  pause(): void {
    if (!this.howl) return;
    this.howl.pause();
  }

  /**
   * Stop the sound
   */
  stop(): void {
    if (!this.howl) return;
    this.howl.stop();
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    if (!this.howl) return;
    this.howl.volume(Math.max(0, Math.min(1, volume)));
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    if (!this.howl) return 0;
    return this.howl.volume();
  }

  /**
   * Fade to a new volume over duration (in ms)
   */
  fade(from: number, to: number, duration: number): void {
    if (!this.howl) return;
    this.howl.fade(from, to, duration);
  }

  /**
   * Check if sound is playing
   */
  isPlaying(): boolean {
    if (!this.howl) return false;
    return this.howl.playing();
  }

  /**
   * Check if sound is loaded
   */
  isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * Check if sound is loading
   */
  isLoading(): boolean {
    return this.loading;
  }

  /**
   * Destroy the sound instance and free memory
   */
  destroy(): void {
    if (this.howl) {
      this.howl.unload();
      this.howl = null;
    }
    this.loaded = false;
    this.loading = false;
  }
}
