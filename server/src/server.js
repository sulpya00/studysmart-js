import app from "./app.js";

const port = Number(process.env.PORT) || 4000;
const server = app.listen(port, () => {
  console.log(`StudySmart API running at http://localhost:${port}`);
  console.log(`AI provider: ${process.env.AI_PROVIDER || "mock"}`);
});

function shutdown(signal) {
  console.log(`\n${signal} received. Closing server...`);
  server.close(() => process.exit(0));
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
