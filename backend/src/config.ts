import "dotenv/config";

const parsePort = (value: string | undefined): number => {
  const fallback = 4000;

  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const config = {
  port: parsePort(process.env.PORT),
  mongoUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017",
  mongoDbName: process.env.MONGODB_DB_NAME ?? "expense-tracker",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
};
