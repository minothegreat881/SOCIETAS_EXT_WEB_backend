import { mergeConfig, type UserConfig } from 'vite';

export default (config: UserConfig) => {
  // Important: always return the modified config
  return mergeConfig(config, {
    server: {
      host: true, // Allow external access
      allowedHosts: ['api.autoweb.store', 'localhost', '127.0.0.1']
    },
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  });
};