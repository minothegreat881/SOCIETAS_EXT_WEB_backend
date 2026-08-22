import cronTasks from './cron-tasks';

export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1341), // Zmena portu pre SOCIETAS_EXT_WEB
  app: {
    keys: env.array('APP_KEYS'),
  },
  // za nginx: bez toho by rate limiter videl všetkých návštevníkov ako jednu IP
  proxy: env.bool('IS_PROXIED', true),
  cron: {
    enabled: env.bool('CRON_ENABLED', true),
    tasks: cronTasks,
  },
});
