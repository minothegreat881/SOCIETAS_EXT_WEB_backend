export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1341), // Zmena portu pre SOCIETAS_EXT_WEB
  app: {
    keys: env.array('APP_KEYS'),
  },
});
