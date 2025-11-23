import { machineIdSync } from 'node-machine-id';

export class MachineUuidService {
  private static uuid: string | null = null;

  /**
   * Get the machine UUID synchronously
   * This will cache the UUID after first call for performance
   */
  static getUuid(): string {
    if (!this.uuid) {
      try {
        this.uuid = machineIdSync();
      } catch (error) {
        console.error('Failed to get machine UUID:', error);
        // Fallback to a random UUID if machine ID cannot be obtained
        this.uuid = 'unknown';
      }
    }
    return this.uuid;
  }

  /**
   * Reset the cached UUID (useful for testing)
   */
  static reset(): void {
    this.uuid = null;
  }
}
