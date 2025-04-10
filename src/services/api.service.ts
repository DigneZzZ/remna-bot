import axios, { AxiosInstance, AxiosError } from 'axios';
import { RemnaConfig, SystemInfo, APIResponse } from '../types';
import { logger } from '../utils/logger';

export class RemnaAPIService {
    private api: AxiosInstance;
    private config: RemnaConfig;

    constructor(config: RemnaConfig) {
        this.config = config;
        this.api = axios.create({
            baseURL: config.baseUrl,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            }
        });

        // Интерцептор для логирования запросов
        this.api.interceptors.request.use(request => {
            logger.debug('API Request:', {
                method: request.method,
                url: request.url,
                timestamp: new Date().toISOString()
            });
            return request;
        });

        // Интерцептор для обработки ответов
        this.api.interceptors.response.use(
            response => {
                logger.debug('API Response:', {
                    status: response.status,
                    url: response.config.url,
                    timestamp: new Date().toISOString()
                });
                return response;
            },
            (error: AxiosError) => {
                logger.error('API Error:', {
                    message: error.message,
                    url: error.config?.url,
                    status: error.response?.status,
                    timestamp: new Date().toISOString(),
                    response: error.response?.data
                });

                // Специальная обработка ошибок API
                if (error.response?.status === 401) {
                    logger.error('API Authentication failed. Please check your API key.');
                }

                return Promise.reject(error);
            }
        );
    }

    // Метод для проверки подключения к API
    async checkApiConnection(): Promise<boolean> {
        try {
            await this.api.get(this.config.apiPaths.system);
            return true;
        } catch (error) {
            logger.error('API connection check failed:', error);
            return false;
        }
    }

    async getSystemInfo(): Promise<APIResponse<SystemInfo>> {
        try {
            const [usersRes, nodesRes, statsRes] = await Promise.all([
                this.api.get(this.config.apiPaths.users),
                this.api.get(this.config.apiPaths.nodes),
                this.api.get(this.config.apiPaths.stats)
            ]);

            const systemInfo: SystemInfo = {
                totalUsers: usersRes.data.total || 0,
                activeUsers: usersRes.data.active || 0,
                totalTraffic: statsRes.data.totalTraffic || 0,
                nodesCount: nodesRes.data.total || 0,
                activeNodes: nodesRes.data.active || 0,
                totalInbounds: statsRes.data.inbounds?.total || 0,
                activeInbounds: statsRes.data.inbounds?.active || 0,
                topCountries: statsRes.data.countries || []
            };

            return {
                success: true,
                data: systemInfo
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.error('Failed to get system info:', error);
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    // Другие методы API...
}