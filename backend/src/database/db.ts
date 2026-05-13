
import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string);

    console.log(`MongoDB conectado: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error conectando MongoDB: ${error.message}`);
    process.exit(1);
  }
};