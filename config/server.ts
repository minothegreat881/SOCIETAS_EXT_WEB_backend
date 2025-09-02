export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1342), // SCEAR backend - port 1342
  app: {
    keys: env.array('APP_KEYS'),
  },
});
