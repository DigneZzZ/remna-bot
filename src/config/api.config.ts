import { RemnaConfig } from '../types';

export const createApiConfig = (baseUrl: string, apiKey: string): RemnaConfig => {
    if (!baseUrl || !apiKey) {
        throw new Error('PANEL_URL and API_KEY must be provided in environment variables');
    }

    return {
        baseUrl: baseUrl.replace(/\/$/, ''),
        apiKey,
        apiPaths: {
            users: '/api/users',
            inbounds: '/api/inbounds',
            nodes: '/api/nodes',
            stats: '/api/stats',
            system: '/api/system'
        }
    };
};