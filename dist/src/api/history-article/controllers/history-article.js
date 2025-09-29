"use strict";
/**
 * history-article controller
 */
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreController('api::history-article.history-article', ({ strapi }) => ({
    async findBySlug(ctx) {
        const { slug } = ctx.params;
        const entities = await strapi.entityService.findMany('api::history-article.history-article', {
            filters: { slug: slug, visible: true },
            populate: {
                coverImage: true,
                heroImage: true,
                mainImage: true,
                sections: true,
                images: {
                    populate: {
                        image: true,
                    },
                },
                keyFacts: true,
                timeline: true,
                unitTypes: true,
            },
        });
        if (!entities || entities.length === 0) {
            return ctx.notFound();
        }
        const sanitized = await this.sanitizeOutput(entities[0], ctx);
        return this.transformResponse(sanitized);
    },
}));
