module.exports = {
  apps: [
    {
      name: "chemlife-frontend",
      cwd: ".",
      script: "npm",
      args: "run start",
      env: {
        PORT: 3000,
        NODE_ENV: "production"
      }
    }
  ]
};
