// Dev-only helper: spins up an ephemeral in-memory MongoDB and runs the
// real server against it, for local testing when no MONGO_URI is configured.
// Not used in production; not referenced by server.js.
import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv';

dotenv.config();

const mongod = await MongoMemoryServer.create();
process.env.MONGO_URI = process.env.MONGO_URI || mongod.getUri();
process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

console.log(`[dev-memory-server] Using in-memory MongoDB at ${process.env.MONGO_URI}`);

await import('./server.js');
