module.exports = {
  apps: [
    {
      name: "ft-transcendence-backend",
      script: "./dist/app.js",
      instances: 1,
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      env_development: {
        NODE_ENV: "development",
        PORT: 3000,
      },
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 3000,
      shutdown_with_message: true,
      
      // Auto-restart on crash
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      
      // Logging
      output: "./logs/out.log",
      error: "./logs/error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      
      // Health check
      instance_var: "INSTANCE_ID",
      
      // Ignore files
      ignore_watch: ["node_modules", "dist", "logs", "*.db"],
      watch_ignore: ["node_modules", "dist", "logs"],
    },
  ],

  deploy: {
    production: {
      user: "node",
      host: "your-production-server.com",
      ref: "origin/main",
      repo: "git@github.com:iTsLhaj/backend.git",
      path: "/home/node/apps/ft-transcendence",
      "post-deploy":
        "npm install && npm run build && pm2 reload ecosystem.config.js --env production",
    },
  },
};
