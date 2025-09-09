module.exports = {
  apps: [
    {
      name: 'scear-backend-stable',
      script: './node_modules/.bin/strapi',
      args: 'start',
      cwd: '/root/scear-backend',
      instances: 1,
      exec_mode: 'fork',
      
      // Environment
      env: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: 1337,
        NODE_OPTIONS: '--max-old-space-size=1536'
      },
      
      // Restart policies
      autorestart: true,
      watch: false,
      max_memory_restart: '1400M',
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: '30s',
      
      // Logging
      log_file: '/root/logs/scear-backend.log',
      out_file: '/root/logs/scear-backend-out.log',
      error_file: '/root/logs/scear-backend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Health monitoring
      health_check_url: 'http://localhost:1337/admin',
      health_check_grace_period: 30000,
      
      // Stability optimizations
      kill_timeout: 10000,
      listen_timeout: 10000,
      wait_ready: true,
      
      // Process management
      ignore_watch: ['node_modules', 'logs', '.tmp'],
      source_map_support: false,
      disable_source_map_support: true
    }
  ]
};