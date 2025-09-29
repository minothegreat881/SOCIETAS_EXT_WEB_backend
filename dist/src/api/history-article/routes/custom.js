"use strict";
/**
 * custom history-article routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    routes: [
        {
            method: 'GET',
            path: '/history-articles/by-slug/:slug',
            handler: 'api::history-article.history-article.findBySlug',
            config: {
                auth: false,
            },
        },
    ],
};
