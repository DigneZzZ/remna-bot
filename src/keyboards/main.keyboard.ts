import { Markup } from 'telegraf';

export const mainMenu = Markup.inlineKeyboard([
    [
        Markup.button.callback('👥 Пользователи', 'users_menu'),
        Markup.button.callback('📊 Статистика', 'stats_menu')
    ],
    [
        Markup.button.callback('🖥️ Ноды', 'nodes_menu'),
        Markup.button.callback('🔌 Инбаунды', 'inbounds_menu')
    ],
    [
        Markup.button.callback('⚙️ Настройки', 'settings_menu'),
        Markup.button.callback('❓ Помощь', 'help_menu')
    ]
]);

export const userActionMenu = (userId: number) => Markup.inlineKeyboard([
    [
        Markup.button.callback('🔄 Обновить', `refresh_user:${userId}`),
        Markup.button.callback('⛔ Блокировать', `block_user:${userId}`)
    ],
    [
        Markup.button.callback('📈 Статистика', `user_stats:${userId}`),
        Markup.button.callback('🔌 Инбаунды', `user_inbounds:${userId}`)
    ],
    [Markup.button.callback('« Назад', 'users_menu')]
]);