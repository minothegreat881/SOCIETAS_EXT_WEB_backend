"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    routes: [
        {
            method: 'POST',
            path: '/raw-upload',
            handler: 'raw-upload.upload',
            config: {
                policies: [],
                middlewares: ['strapi::cors'],
            },
        },
    ],
};
