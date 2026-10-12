
import app from "./app.js";
import pool, { checkDatabaseConnection } from "./src/config/db.js";

const PORT = Number(process.env.PORT || 5000);
const HOST = "0.0.0.0";

let server;

const startServer = async () => {
  try {
    await checkDatabaseConnection();

    server = app.listen(PORT, HOST, () => {
      console.log(`Nivaran backend listening on port ${PORT}`);
    });

   server.on("error", async (error) => {
  console.error("HTTP server error:", error.message);
  process.exitCode = 1;

  try {
    await pool.end();
  } catch (shutdownError) {
    console.error("Error closing database pool:", shutdownError.message);
  }
});
  } catch (error) {
    console.error("Failed to start backend:", error.message);
    await pool.end();
    process.exitCode = 1;
  }
};

const shutdown = (signal) => {
  console.log(`${signal} received; shutting down`);

  if (!server) {
    pool.end().finally(() => process.exit(0));
    return;
  }

  server.close(async () => {
    try {
      await pool.end();
      process.exit(0);
    } catch (error) {
      console.error("Error closing database pool:", error.message);
      process.exit(1);
    }
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer();
