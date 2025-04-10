import { RemnaConfig } from '../types';
import { logger } from './logger';

export class ConfigValidator {
    static validateConfig(config: RemnaConfig): boolean {
        try {
            // Проверка baseUrl
            if (!config.baseUrl || !this.isValidUrl(config.baseUrl)) {
                throw new Error('Invalid PANEL_URL');
            }

            // Проверка apiKey
            if (!config.apiKey || config.apiKey.length < 32) {
                throw new Error('Invalid API_KEY');
            }

            // Проверка путей API
            const requiredPaths = ['users', 'inbounds', 'nodes', 'stats', 'system'];
            for (const path of requiredPaths) {
                if (!config.apiPaths[path]) {
                    throw new Error(`Missing API path: ${path}`);
                }
            }

            return true;
        } catch (error) {
            logger.error('Configuration validation failed:', error);
            return false;
        }
    }

    private static isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
}