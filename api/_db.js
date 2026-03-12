import { MongoClient } from 'mongodb';

let client;

export async function getDb() {
  if (!client) {
    if (!process.env.MONGODB) {
      throw new Error('MONGODB environment variable is not set');
    }
    client = new MongoClient(process.env.MONGODB);
    await client.connect();
  }
  return client.db('steps');
}
