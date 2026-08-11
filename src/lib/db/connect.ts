import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

/**
 * Next.js dev/edge bundling can re-evaluate this module across hot reloads and
 * serverless invocations, so the cached connection lives on `global` to avoid
 * exhausting MongoDB's connection pool.
 */
declare global {
  var __leadflowMongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.__leadflowMongooseCache ?? {
  conn: null,
  promise: null,
};
global.__leadflowMongooseCache = cache;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    // Read lazily (not at module load) so standalone scripts that load .env
    // after their imports resolve (e.g. via dotenv) still see the value.
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not set");
    }
    cache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
