export interface RemnaConfig {
    baseUrl: string;
    apiKey: string;
    apiPaths: {
        users: string;
        inbounds: string;
        nodes: string;
        stats: string;
        system: string;
    };
}

export interface SystemInfo {
    totalUsers: number;
    activeUsers: number;
    totalTraffic: number;
    nodesCount: number;
    activeNodes: number;
    totalInbounds: number;
    activeInbounds: number;
    topCountries: Array<{
        country: string;
        traffic: number;
        users: number;
    }>;
}

export interface APIResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}