import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  exit: () => ipcRenderer.send('exit'),
  setTitle: (title: string) => ipcRenderer.send('title', title),
  startWindowMove: (mouseX: number, mouseY: number) =>
    ipcRenderer.send('startWindowMove', mouseX, mouseY),
  stopWindowMove: () => ipcRenderer.send('stopWindowMove'),

  // Settings
  init: () => ipcRenderer.send('init'),
  setSetting: (name: string, value: any) =>
    ipcRenderer.send('setting', name, value),
  onLoadSettings: (callback: (settings: any) => void) => {
    ipcRenderer.on('loadSettings', (_event, settings) => callback(settings));
  },

  // External links
  openExternal: (url: string) => ipcRenderer.send('extlink', url),

  // Ambient Sounds
  openAmbientSounds: () => ipcRenderer.send('open-ambient-sounds'),
  ambientToggleSound: (soundId: string) => ipcRenderer.send('ambient-toggle-sound', soundId),
  ambientSetSoundVolume: (soundId: string, volume: number) =>
    ipcRenderer.send('ambient-set-sound-volume', soundId, volume),
  ambientSetMasterVolume: (volume: number) => ipcRenderer.send('ambient-set-master-volume', volume),
  ambientTogglePlayPause: () => ipcRenderer.send('ambient-toggle-play-pause'),
  ambientLoadPreset: (presetId: string) => ipcRenderer.send('ambient-load-preset', presetId),
  ambientShuffle: () => ipcRenderer.send('ambient-shuffle'),
  ambientStopAll: () => ipcRenderer.send('ambient-stop-all'),
  ambientRequestState: () => ipcRenderer.send('ambient-request-state'),
  onAmbientStateUpdate: (callback: (state: any) => void) => {
    ipcRenderer.on('ambient-state-update', (_event, state) => callback(state));
  },
  ambientBroadcastState: (state: any) => ipcRenderer.send('ambient-state-update', state),
  saveAmbientState: (state: any) => ipcRenderer.send('save-ambient-state', state),
  loadAmbientState: () => ipcRenderer.invoke('load-ambient-state'),

  // Anime GIF color extraction
  extractAnimeColor: (imageUrl: string) => ipcRenderer.invoke('extract-anime-color', imageUrl),

  // Receivers for main window
  onAmbientToggleSound: (callback: (soundId: string) => void) => {
    ipcRenderer.on('ambient-toggle-sound', (_event, soundId) => callback(soundId));
  },
  onAmbientSetSoundVolume: (callback: (soundId: string, volume: number) => void) => {
    ipcRenderer.on('ambient-set-sound-volume', (_event, soundId, volume) => callback(soundId, volume));
  },
  onAmbientSetMasterVolume: (callback: (volume: number) => void) => {
    ipcRenderer.on('ambient-set-master-volume', (_event, volume) => callback(volume));
  },
  onAmbientTogglePlayPause: (callback: () => void) => {
    ipcRenderer.on('ambient-toggle-play-pause', () => callback());
  },
  onAmbientLoadPreset: (callback: (presetId: string) => void) => {
    ipcRenderer.on('ambient-load-preset', (_event, presetId) => callback(presetId));
  },
  onAmbientShuffle: (callback: () => void) => {
    ipcRenderer.on('ambient-shuffle', () => callback());
  },
  onAmbientStopAll: (callback: () => void) => {
    ipcRenderer.on('ambient-stop-all', () => callback());
  },
  onAmbientRequestState: (callback: () => void) => {
    ipcRenderer.on('ambient-request-state', () => callback());
  },
});

// Type definition for renderer process
declare global {
  interface Window {
    electronAPI: {
      exit: () => void;
      setTitle: (title: string) => void;
      startWindowMove: (mouseX: number, mouseY: number) => void;
      stopWindowMove: () => void;
      init: () => void;
      setSetting: (name: string, value: any) => void;
      onLoadSettings: (callback: (settings: any) => void) => void;
      openExternal: (url: string) => void;
      openAmbientSounds: () => void;
      ambientToggleSound: (soundId: string) => void;
      ambientSetSoundVolume: (soundId: string, volume: number) => void;
      ambientSetMasterVolume: (volume: number) => void;
      ambientTogglePlayPause: () => void;
      ambientLoadPreset: (presetId: string) => void;
      ambientShuffle: () => void;
      ambientStopAll: () => void;
      ambientRequestState: () => void;
      onAmbientStateUpdate: (callback: (state: any) => void) => void;
      ambientBroadcastState: (state: any) => void;
      saveAmbientState: (state: any) => void;
      loadAmbientState: () => Promise<any>;
      extractAnimeColor: (imageUrl: string) => Promise<string | null>;
      onAmbientToggleSound: (callback: (soundId: string) => void) => void;
      onAmbientSetSoundVolume: (callback: (soundId: string, volume: number) => void) => void;
      onAmbientSetMasterVolume: (callback: (volume: number) => void) => void;
      onAmbientTogglePlayPause: (callback: () => void) => void;
      onAmbientLoadPreset: (callback: (presetId: string) => void) => void;
      onAmbientShuffle: (callback: () => void) => void;
      onAmbientStopAll: (callback: () => void) => void;
      onAmbientRequestState: (callback: () => void) => void;
    };
  }
}
