import mongoose from "mongoose";

export const connectToDatabase = async (mongoUri: string, dbName: string) => {
  await mongoose.connect(mongoUri, {
    dbName,
  });
};

export const disconnectFromDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};
