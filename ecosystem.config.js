module.exports = {
  apps: [
    {
      name: 'cg-tourism-backend',
      script: 'pnpm',
      args: '--filter backend start',
      cwd: __dirname,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
    },
    {
      name: 'cg-tourism-frontend',
      script: 'pnpm',
      args: '--filter web start',
      cwd: __dirname,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
