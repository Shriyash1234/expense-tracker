import { createApp } from "./app";
import { config } from "./config";
import { connectToDatabase } from "./db";

const start = async () => {
  await connectToDatabase(config.mongoUri, config.mongoDbName);
  console.log(`Connected to MongoDB database "${config.mongoDbName}"`);

  const app = createApp();
  app.listen(config.port, () => {
    console.log(`API listening on port ${config.port}`);
  });
};

start().catch((error) => {
  console.error("Failed to start backend", error);
  process.exit(1);
});
