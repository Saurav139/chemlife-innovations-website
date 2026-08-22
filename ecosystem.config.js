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
    },
    {
      name: "chemlife-backend",
      cwd: "./chatbot-backend",
      script: "./.venv/bin/uvicorn",
      args: "backend.app:app --port 8001 --host 127.0.0.1",
      env: {
        PYTHONPATH: "./backend"
      }
    }
  ]
};
