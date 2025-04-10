import { Telegraf, Context } from 'telegraf';
import { RemnaAPIService } from './services/api.service';
import { mainMenu } from './keyboards/main.keyboard';
import { logger } from './utils/logger';
import { createApiConfig } from './config/api.config';
import { formatSystemInfo } from './utils/formatters';
import dotenv from 'dotenv';

dotenv.config();

// Проверка наличия необходимых переменных окружения
const requiredEnvVars = ['PANEL_URL', 'API_KEY', 'BOT_TOKEN', 'ADMIN_ID'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        logger.error(`Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
}

const bot = new Telegraf(process.env.BOT_TOKEN!);
const apiConfig = createApiConfig(process.env.PANEL_URL!, process.env.API_KEY!);
const api = new RemnaAPIService(apiConfig);

// Функция инициализации бота
async function initializeBot() {
    try {
        // Проверка подключения к API
        const isApiConnected = await api.checkApiConnection();
        if (!isApiConnected) {
            throw new Error('Failed to connect to Remna API');
        }
        logger.info('Successfully connected to Remna API');

        // Middleware для проверки админа
        bot.use(async (ctx, next) => {
            const userId = ctx.from?.id.toString();
            if (userId !== process.env.ADMIN_ID) {
                logger.warn(`Unauthorized access attempt from ${userId}`);
                await ctx.reply('Доступ запрещен.');
                return;
            }
            return next();
        });

        // Команда start
        bot.command('start', async (ctx) => {
            try {
                const systemInfoResponse = await api.getSystemInfo();
                if (!systemInfoResponse.success || !systemInfoResponse.data) {
                    throw new Error(systemInfoResponse.error || 'Failed to get system info');
                }

                const message = formatSystemInfo(systemInfoResponse.data);
                await ctx.reply(message, { 
                    parse_mode: 'HTML',
                    ...mainMenu 
                });
            } catch (error) {
                logger.error('Error in start command:', error);
                await ctx.reply('Ошибка получения информации о системе. Проверьте подключение к API.');
            }
        });

        // Запуск бота
        await bot.launch();
        logger.info('Bot started successfully');

    } catch (error) {
        logger.error('Failed to initialize bot:', error);
        process.exit(1);
    }
}

// Запуск бота с инициализацией
initializeBot();

// Graceful stop
process.once('SIGINT', () => {
    logger.info('Received SIGINT signal');
    bot.stop('SIGINT');
});
process.once('SIGTERM', () => {
    logger.info('Received SIGTERM signal');
    bot.stop('SIGTERM');
});