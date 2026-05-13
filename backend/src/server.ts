// src/server.ts
import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './database/db.js';

dotenv.config();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

await connectDB();

app.listen(Number(PORT), HOST, () => {
  console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
});
