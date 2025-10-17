export default (config, { strapi }) => {
  return async (ctx, next) => {
    const allowedOrigins = [
      'https://www.autoweb.store',
      'https://autoweb.store',
      'https://www.scear.sk',
      'https://scear.sk',
      'https://api.autoweb.store',
      'https://api.scear.sk',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
    ];

    const origin = ctx.request.header.origin;
    
    // Check if origin matches allowed origins or Vercel pattern
    const isAllowed = origin && (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app')
    );

    // If origin is allowed, set CORS headers
    if (isAllowed) {
      ctx.set('Access-Control-Allow-Origin', origin);
      ctx.set('Access-Control-Allow-Credentials', 'true');
      ctx.set('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
      ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    }

    // Handle preflight
    if (ctx.method === 'OPTIONS') {
      ctx.status = 200;
      return;
    }

    await next();
  };
};
