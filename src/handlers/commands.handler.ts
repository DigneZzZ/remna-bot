import { Context, Telegraf } from 'telegraf';
import { Message } from 'telegraf/typings/core/types/typegram';
import { RemnaAPIService } from '../services/api.service';
import { logger } from '../utils/logger';
import { formatBytes, formatDate } from '../utils/formatters';

export class CommandHandler {
    private bot: Telegraf;
    private api: RemnaAPIService;

    constructor(bot: Telegraf, api: RemnaAPIService) {
        this.bot = bot;
        this.api = api;
        this.initializeCommands();
    }

    private initializeCommands() {
        // Auth middleware
        this.bot.use(async (ctx, next) => {
            const userId = ctx.from?.id.toString();
            if (userId !== process.env.ADMIN_ID) {
                logger.warn(`Unauthorized access attempt from ${userId}`);
                await ctx.reply('Unauthorized access.');
                return;
            }
            return next();
        });

        // User management commands
        this.bot.command('users', this.handleUsersList.bind(this));
        this.bot.command('u', this.handleUserSearch.bind(this));
        this.bot.command('block', this.handleUserBlock.bind(this));
        
        // Stats commands
        this.bot.command('stats', this.handleSystemStats.bind(this));
    }

    private async handleUsersList(ctx: Context) {
        try {
            const response = await this.api.getUsers();
            if (!response.success || !response.data) {
                throw new Error('Failed to fetch users');
            }

            const userList = response.data
                .map(user => `👤 ${user.username}\n` +
                    `📝 ${user.description || 'No description'}\n` +
                    `📊 Traffic: ${formatBytes(user.traffic_limit || 0)}\n` +
                    `⏰ Expires: ${formatDate(user.expiry_date)}\n` +
                    `Status: ${user.status === 'active' ? '✅' : '❌'}\n`
                )
                .join('\n');

            await ctx.reply(userList || 'No users found');
        } catch (error) {
            logger.error('Error in handleUsersList:', error);
            await ctx.reply('Failed to fetch users list. Please try again later.');
        }
    }

    private async handleUserSearch(ctx: Context & { message: Message.TextMessage }) {
        try {
            const query = ctx.message.text.split(' ').slice(1).join(' ');
            if (!query) {
                await ctx.reply('Please provide a search query. Usage: /u <query>');
                return;
            }

            const response = await this.api.searchUsers(query);
            if (!response.success || !response.data) {
                throw new Error('Failed to search users');
            }

            const results = response.data
                .map(user => `Found: ${user.username}\n${user.description || 'No description'}`)
                .join('\n\n');

            await ctx.reply(results || 'No users found');
        } catch (error) {
            logger.error('Error in handleUserSearch:', error);
            await ctx.reply('Failed to search users. Please try again later.');
        }
    }

    private async handleSystemStats(ctx: Context) {
        try {
            const response = await this.api.getSystemStats();
            if (!response.success || !response.data) {
                throw new Error('Failed to fetch system stats');
            }

            const stats = response.data;
            const message = 
                `📊 System Statistics\n\n` +
                `👥 Total Users: ${stats.user_count}\n` +
                `📈 Total Traffic: ${formatBytes(stats.total_traffic)}\n` +
                `🖥️ Active Nodes: ${stats.active_nodes}\n\n` +
                `🌍 Traffic by Country:\n${Object.entries(stats.country_stats)
                    .map(([country, traffic]) => `${country}: ${formatBytes(traffic)}`)
                    .join('\n')}`;

            await ctx.reply(message);
        } catch (error) {
            logger.error('Error in handleSystemStats:', error);
            await ctx.reply('Failed to fetch system statistics. Please try again later.');
        }
    }
}