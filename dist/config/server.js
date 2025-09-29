"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ({ env }) => ({
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 1337), // SCEAR backend - port 1337
    app: {
        keys: env.array('APP_KEYS'),
    },
    url: env('PUBLIC_URL', 'https://api.autoweb.store'),
});
