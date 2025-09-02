module.exports = {
  apps: [
    {
      name: 'scear-backend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/scear-backend',
      env: {
        NODE_ENV: 'production',
        PORT: 1337
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
}