import { BrowserWindow } from 'electron';
import { satisfies, gt } from 'semver';
import * as packageJson from '../../package.json';

interface ReleaseInfo {
  version: string;
  releaseUrl: string;
  publishedAt: string;
}

export class UpdateService {
  private static lastCheckTime: number = 0;
  private static CHECK_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
  private static GITHUB_API_URL = 'https://api.github.com/repos/mhmdkrmabd/lofi-room-desktop-app/releases/latest';
  private static currentVersion = packageJson.version;

  /**
   * Check for updates from GitHub releases
   * Returns null if no update available or on error
   */
  static async checkForUpdates(): Promise<ReleaseInfo | null> {
    try {
      const response = await fetch(this.GITHUB_API_URL, {
        headers: {
          'User-Agent': `lofi-room-desktop-app/${this.currentVersion}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        console.error('Failed to check for updates:', response.status);
        return null;
      }

      const data = await response.json();
      const latestVersion = data.tag_name.replace(/^v/, ''); // Remove 'v' prefix if present

      // Check if there's a newer version
      if (this.isNewerVersion(latestVersion)) {
        return {
          version: latestVersion,
          releaseUrl: data.html_url,
          publishedAt: data.published_at,
        };
      }

      return null;
    } catch (error) {
      console.error('Error checking for updates:', error);
      return null;
    }
  }

  /**
   * Compare versions to check if latest is newer than current
   */
  private static isNewerVersion(latestVersion: string): boolean {
    try {
      return gt(latestVersion, this.currentVersion);
    } catch (error) {
      console.error('Error comparing versions:', error);
      return false;
    }
  }

  /**
   * Check if enough time has passed since last check
   */
  static shouldCheckForUpdates(): boolean {
    const now = Date.now();
    if (now - this.lastCheckTime >= this.CHECK_INTERVAL) {
      this.lastCheckTime = now;
      return true;
    }
    return false;
  }

  /**
   * Start periodic update checks
   */
  static startPeriodicChecks(window: BrowserWindow): void {
    // Initial check after 5 seconds
    setTimeout(async () => {
      const updateInfo = await this.checkForUpdates();
      if (updateInfo && !window.isDestroyed()) {
        window.webContents.send('update-available', updateInfo);
      }
    }, 5000);

    // Periodic checks every 6 hours
    setInterval(async () => {
      if (this.shouldCheckForUpdates()) {
        const updateInfo = await this.checkForUpdates();
        if (updateInfo && !window.isDestroyed()) {
          window.webContents.send('update-available', updateInfo);
        }
      }
    }, this.CHECK_INTERVAL);
  }
}
