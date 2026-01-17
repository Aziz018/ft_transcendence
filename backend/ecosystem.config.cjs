// ecosystem.config.cjs - PM2 Ecosystem Configuration
// Usage: pm2 start ecosystem.config.cjs

module.exports = {
  apps: [
    {
      name: "pong-rush-backend",
      script: "./dist/app.js", // Use compiled JS in production
      interpreter: "node",
      instances: 1,
      exec_mode: "fork", // Use fork for single instance
      
      // Environment - Production Safe Port Handling
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        SHUTDOWN_TIMEOUT: "15000",
      },
      env_development: {
        NODE_ENV: "development",
        PORT: 3000,
        SHUTDOWN_TIMEOUT: "10000",
      },
      
      // Resource Management
      max_memory_restart: "512M",
      max_restarts: 5,
      min_uptime: "10s",
      
      // Graceful Shutdown - CRITICAL for EADDRINUSE prevention
      kill_timeout: 5000,       // Wait 5s for graceful shutdown
      listen_timeout: 5000,     // Wait 5s for server to listen
      wait_ready: false,        // Don't wait for ready signal
      
      // Logging
      merge_logs: true,
      out_file: "./logs/out.log",
      error_file: "./logs/err.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      
      // Auto-Restart
      autorestart: true,
      watch: false,
      ignore_watch: ["node_modules", ".env", "*.db", "logs"],
    },
  ],

  // Deploy configuration for remote servers
  deploy: {
    production: {
      user: "node",
      host: "your-server.com",
      ref: "origin/main",
      repo: "your-repo.git",
      path: "/var/www/pong-rush",
      "post-deploy": "npm install && npm run build && pm2 reload ecosystem.config.cjs --env production",
    },
  },
};
  apps: [
    {
      name: "pong-rush-backend",
      script: "./src/app.ts",
      interpreter: "npx tsx",
      instances: 1,
      exec_mode: "cluster",
      
      // Environment
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      env_development: {
        NODE_ENV: "development",
        PORT: 3000,
      },
      
      // Resource Management
      max_memory_restart: "512M",
      max_restarts: 10,
      min_uptime: "10s",
      
      // Graceful Shutdown
      kill_timeout: 5000,
      listen_timeout: 3000,
      wait_ready: true,
      
      // Logging
      merge_logs: true,
      out_file: "./logs/out.log",
      error_file: "./logs/err.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      
      // Monitoring & Auto-Restart
      autorestart: true,
      watch: false,
      ignore_watch: ["node_modules", ".env", "*.db"],
      
      // Development Watch Mode
      watch_delay: 500,
    },
  ],

  // Deploy configuration for remote servers
  deploy: {
    production: {
      user: "node",
      host: "your-server.com",
      ref: "origin/main",
      repo: "your-repo.git",
      path: "/var/www/pong-rush",
      "post-deploy": "npm install && npm run build && pm2 reload ecosystem.config.cjs --env production",
    },
  },
};
