// Tina CMS client configuration and singleton instance
// Serverless-compatible implementation for Netlify deployment

import { client } from '../../tina/__generated__/client';
import {
  TinaClient,
  TinaClientConfig,
  TinaQueryExecutor,
  isTinaClient,
  createTinaError,
  DEFAULT_TINA_CONFIG,
} from '../types/tina';

/**
 * Runtime Tina configuration merged with defaults
 */
const TINA_CONFIG: TinaClientConfig = {
  ...DEFAULT_TINA_CONFIG,
  enabled: import.meta.env.VITE_USE_TINA_CMS === 'true',
  clientId: import.meta.env.VITE_TINA_CLIENT_ID,
  branch: import.meta.env.VITE_TINA_BRANCH || 'main',
};

/**
 * Singleton Tina client instance
 */
class TinaClientManager {
  private static instance: TinaClientManager;
  private clientInstance: TinaClient | null = null;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): TinaClientManager {
    if (!TinaClientManager.instance) {
      TinaClientManager.instance = new TinaClientManager();
    }
    return TinaClientManager.instance;
  }

  /**
   * Check if Tina CMS is enabled and properly configured
   */
  isEnabled(): boolean {
    return TINA_CONFIG.enabled;
  }

  /**
   * Get Tina configuration
   */
  getConfig(): TinaClientConfig {
    return { ...TINA_CONFIG };
  }

  /**
   * Initialize Tina client with error handling
   */
  private async initializeClient(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._doInitialize();
    return this.initializationPromise;
  }

  private async _doInitialize(): Promise<void> {
    try {
      if (!TINA_CONFIG.enabled) {
        console.warn('Tina CMS ist deaktiviert - verwende VITE_USE_TINA_CMS=true zum Aktivieren');
        this.isInitialized = true;
        return;
      }

      // Check if client is available
      if (!client) {
        throw createTinaError(
          'Tina client ist nicht verfügbar - prüfen Sie die Konfiguration',
          'CLIENT_NOT_AVAILABLE'
        );
      }

      // Validate client structure
      if (!isTinaClient(client)) {
        throw createTinaError(
          'Tina client hat ungültige Struktur',
          'INVALID_CLIENT_STRUCTURE',
          { client: typeof client }
        );
      }

      // Client is already initialized from the import
      this.clientInstance = client;
      
      // Log initialization mode
      if (import.meta.env.DEV) {
        console.log('Tina CMS Client initialisiert (Development Mode)');
      } else {
        console.log('Tina CMS Client initialisiert (Production Mode)');
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Fehler bei der Tina Client Initialisierung:', error);
      this.isInitialized = false;
      this.clientInstance = null;
      
      if (error instanceof Error && 'code' in error) {
        throw error; // Re-throw TinaError
      }
      
      throw createTinaError(
        `Tina CMS konnte nicht initialisiert werden: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
        'INITIALIZATION_FAILED',
        { originalError: error }
      );
    }
  }

  /**
   * Get the initialized Tina client
   */
  async getClient(): Promise<TinaClient> {
    if (!TINA_CONFIG.enabled) {
      throw new Error('Tina CMS ist nicht aktiviert');
    }

    try {
      await this.initializeClient();
      
      if (!this.clientInstance) {
        throw new Error('Tina Client ist nicht verfügbar');
      }

      return this.clientInstance;
    } catch (error) {
      console.error('Fehler beim Abrufen des Tina Clients:', error);
      throw error;
    }
  }

  /**
   * Check client connection and availability
   */
  async checkConnection(): Promise<boolean> {
    if (!TINA_CONFIG.enabled) {
      return false;
    }

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(createTinaError('Connection timeout', 'CONNECTION_TIMEOUT')), TINA_CONFIG.connectionTimeout);
      });

      const connectionPromise = this.getClient().then(async (tinaClient) => {
        // Validate client structure
        if (!isTinaClient(tinaClient)) {
          console.warn('Tina client hat ungültige Struktur');
          return false;
        }

        // Check if queries are available
        if (!tinaClient.queries || typeof tinaClient.queries !== 'object') {
          console.warn('Tina client queries sind nicht verfügbar');
          return false;
        }

        // For now, just check if client structure is valid
        // In a full Tina setup, we'd try a simple query here
        return true;
      });

      return await Promise.race([connectionPromise, timeoutPromise]);
    } catch (error) {
      console.warn('Tina CMS Verbindung fehlgeschlagen:', error);
      return false;
    }
  }

  /**
   * Execute a GraphQL query with error handling and timeout
   */
  async executeQuery<T>(
    queryFunction: TinaQueryExecutor<T>,
    timeoutMs: number = TINA_CONFIG.queryTimeout
  ): Promise<T> {
    if (!TINA_CONFIG.enabled) {
      throw new Error('Tina CMS ist nicht aktiviert');
    }

    try {
      const client = await this.getClient();

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(createTinaError('Query timeout', 'QUERY_TIMEOUT')), timeoutMs);
      });

      const queryPromise = queryFunction(client);

      return await Promise.race([queryPromise, timeoutPromise]);
    } catch (error) {
      console.error('Tina Query Fehler:', error);
      
      if (error instanceof Error && 'code' in error) {
        throw error; // Re-throw TinaError
      }
      
      throw createTinaError(
        `Tina Query fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
        'QUERY_FAILED',
        { originalError: error }
      );
    }
  }

  /**
   * Reset client instance (useful for testing or configuration changes)
   */
  reset(): void {
    this.clientInstance = null;
    this.isInitialized = false;
    this.initializationPromise = null;
  }
}

// Export singleton instance
export const tinaClient = TinaClientManager.getInstance();

// Export configuration for external use
export const tinaConfig = TINA_CONFIG;

// Export types for TypeScript support
export type { TinaClientConfig };