import { BrowserWindow, ipcMain, app, screen, shell, nativeImage } from 'electron';
import Store from 'electron-store';
import { Core } from '../index';
import { AmbientSoundsWindowManager } from './ambient-sounds-window';
import { UpdateService } from '../update-service';
import sharp from 'sharp';
import path from 'path';

interface WindowConfig {
  startup: {
    width: number;
    height: number;
  };
  titleSuffix: string;
}

export default class AppWindow extends BrowserWindow {
  private titleSuffix: string;

  constructor(
    config: WindowConfig,
    private store: Store,
    private webpackEntry: string,
    private preloadEntry: string
  ) {
    const { width, height } = config.startup;
    const settings = store.get('settings') as any || {};

    // Icon path - use __dirname with relative path (works in both dev and packaged)
    // Use PNG for Linux, ICO for Windows
    const iconFile = process.platform === 'win32' ? 'icon.ico' : 'icon.png';
    const iconPath = path.join(__dirname, '../../resources/icons', iconFile);
    const icon = nativeImage.createFromPath(iconPath);

    super({
      width,
      height,
      icon: icon,
      webPreferences: {
        // SECURITY: Disabled nodeIntegration, enabled contextIsolation
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        preload: preloadEntry,
      },
      frame: false,
      transparent: true,
      resizable: false,
      fullscreenable: false,
      fullscreen: false,
      maximizable: false,
      alwaysOnTop: !!settings.ontop,
      title: 'Lofi Room',
    });

    this.titleSuffix = config.titleSuffix;
  }

  public loadContent(): void {
    // Explicitly set icon again (helps with some Linux desktop environments)
    const iconFile = process.platform === 'win32' ? 'icon.ico' : 'icon.png';
    const iconPath = path.join(__dirname, '../../resources/icons', iconFile);
    this.setIcon(iconPath);

    // Set CSP (allow media sources for audio streaming and external images)
    this.webContents.session.webRequest.onHeadersReceived((details, callback) => {
      const csp = process.env.NODE_ENV === 'production'
        ? "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src https://lofiroom.mhmd.io https://api.otakugifs.xyz http://localhost:* file:; media-src https://lofiroom.mhmd.io http://localhost:* data: blob: file:; img-src 'self' https://cdn.otakugifs.xyz data: blob:;"
        : "default-src 'self' 'unsafe-inline' data:; script-src 'self' 'unsafe-eval' 'unsafe-inline'; connect-src * ws: wss:; media-src * http: https: data: blob:; style-src 'self' 'unsafe-inline'; img-src * http: https: data: blob:;";

      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [csp]
        }
      });
    });

    this.loadURL(this.webpackEntry);

    // Open DevTools only in development (not in packaged app)
    if (!app.isPackaged) {
      this.webContents.openDevTools({ mode: 'detach' });
    }
  }

  public registerHandlers(): void {
    const win = this;

    // Exit application
    ipcMain.on('exit', () => {
      app.quit();
    });

    // Initialize - send settings to renderer
    ipcMain.on('init', (e) => {
      e.sender.send('loadSettings', Core.store.get('settings'));
    });

    // Update window title
    ipcMain.on('title', (_e, title: string) => {
      win.setTitle(title + this.titleSuffix);
    });

    // Window dragging
    let moveInterval: NodeJS.Timeout | null = null;
    ipcMain.on('startWindowMove', (_e, mouseX: number, mouseY: number) => {
      if (moveInterval) {
        clearInterval(moveInterval);
      }
      moveInterval = setInterval(() => {
        const { x, y } = screen.getCursorScreenPoint();
        win.setPosition(x - mouseX, y - mouseY);
      }, 10);
    });

    ipcMain.on('stopWindowMove', () => {
      if (moveInterval) {
        clearInterval(moveInterval);
        moveInterval = null;
      }
    });

    // Settings
    ipcMain.on('setting', (_e, name: string, value: any) => {
      Core.store.set(`settings.${name}`, value);

      switch (name) {
        case 'ontop':
          win.setAlwaysOnTop(!!value);
          break;
      }
    });

    // External links
    ipcMain.on('extlink', (_e, url: string) => {
      // Security: Validate URL before opening
      if (url.startsWith('http://') || url.startsWith('https://')) {
        shell.openExternal(url);
      }
    });

    // Ambient Sounds window
    ipcMain.on('open-ambient-sounds', () => {
      AmbientSoundsWindowManager.open();
    });

    // Ambient Sounds IPC handlers (forward to main window)
    ipcMain.on('ambient-toggle-sound', (_e, soundId: string) => {
      win.webContents.send('ambient-toggle-sound', soundId);
    });

    ipcMain.on('ambient-set-sound-volume', (_e, soundId: string, volume: number) => {
      win.webContents.send('ambient-set-sound-volume', soundId, volume);
    });

    ipcMain.on('ambient-set-master-volume', (_e, volume: number) => {
      win.webContents.send('ambient-set-master-volume', volume);
    });

    ipcMain.on('ambient-toggle-play-pause', () => {
      win.webContents.send('ambient-toggle-play-pause');
    });

    ipcMain.on('ambient-load-preset', (_e, presetId: string) => {
      win.webContents.send('ambient-load-preset', presetId);
    });

    ipcMain.on('ambient-shuffle', () => {
      win.webContents.send('ambient-shuffle');
    });

    ipcMain.on('ambient-stop-all', () => {
      win.webContents.send('ambient-stop-all');
    });

    ipcMain.on('ambient-request-state', () => {
      win.webContents.send('ambient-request-state');
    });

    // Broadcast state updates to ambient sounds window
    ipcMain.on('ambient-state-update', (_e, state: any) => {
      const ambientWindow = AmbientSoundsWindowManager.getWindow();
      if (ambientWindow && !ambientWindow.isDestroyed()) {
        ambientWindow.webContents.send('ambient-state-update', state);
      }
    });

    // Ambient Sounds persistence
    ipcMain.on('save-ambient-state', (_e, state: any) => {
      this.store.set('ambientSounds', state);
    });

    ipcMain.handle('load-ambient-state', () => {
      return this.store.get('ambientSounds', null);
    });

    // Get machine UUID
    ipcMain.handle('get-machine-uuid', () => {
      return Core.machineUuid;
    });

    // Check for updates
    ipcMain.handle('check-for-updates', async () => {
      const updateInfo = await UpdateService.checkForUpdates();
      if (updateInfo) {
        win.webContents.send('update-available', updateInfo);
      }
      return updateInfo;
    });

    // Start periodic update checks
    UpdateService.startPeriodicChecks(win);

    // Extract dominant color from anime GIF
    ipcMain.handle('extract-anime-color', async (_e, imageUrl: string) => {
      try {
        // Fetch the image
        const response = await fetch(imageUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Resize for faster processing and extract average color
        const { data, info } = await sharp(buffer)
          .resize(100, 100, { fit: 'cover' })
          .raw()
          .toBuffer({ resolveWithObject: true });

        // Calculate average color
        let r = 0, g = 0, b = 0;
        const pixelCount = info.width * info.height;

        for (let i = 0; i < data.length; i += info.channels) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
        }

        r = Math.round(r / pixelCount);
        g = Math.round(g / pixelCount);
        b = Math.round(b / pixelCount);

        // Convert to hex
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        return hex;
      } catch (error) {
        console.error('Failed to extract color from anime GIF:', error);
        return null;
      }
    });
  }
}
