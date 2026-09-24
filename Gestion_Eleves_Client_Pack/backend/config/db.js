import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gestion_eleves';

  try {
    // Attempt standard MongoDB connection with 2.5s timeout
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2500
    });
    console.log(`[MongoDB] Connecté à l'instance locale/distante: ${mongoose.connection.host}`);
  } catch (err) {
    console.log(`[MongoDB] Serveur MongoDB local non disponible (${err.message}). Initialisation de MongoDB Memory Server...`);
    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const uri = mongoMemoryServer.getUri();
      await mongoose.connect(uri);
      console.log(`[MongoDB Memory Server] Connecté avec succès en mode mémoire à: ${uri}`);
    } catch (memErr) {
      console.error('[MongoDB Error] Échec de la connexion MongoDB:', memErr);
      process.exit(1);
    }
  }
};
