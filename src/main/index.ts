import { app, BrowserWindow } from 'electron';
import Store from 'electron-store';
import Configs from './configs';
import AppWindow from './app/app-window';
import { MachineUuidService } from './machine-uuid-service';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

class AppCore {
  public readonly configs: Configs;
  public store: Store;
  public window: AppWindow | null = null;
  public machineUuid: string = '';

  constructor() {
    this.configs = new Configs();
    this.store = new Store();
    this.machineUuid = MachineUuidService.getUuid();

    this.createWindow();
  }

  createWindow(): void {
    this.window = new AppWindow(
      this.configs.WindowProperties,
      this.store,
      MAIN_WINDOW_WEBPACK_ENTRY,
      MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
    );

    this.window.registerHandlers();
    this.window.loadContent();
  }
}

export let Core: AppCore;

app.whenReady().then(() => {
  if (process.platform === 'linux') {
    app.setName('Lofi Room');
  }

  Core = new AppCore();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    Core.createWindow();
  }
});
