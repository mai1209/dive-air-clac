// src/app.ts
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
const app = express();
// Middlewares
app.use(cors());
app.use(express.json());
// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API funcionando 🚀');
});
//rutas reales
app.use('/api/auth', authRoutes);
app.get('/test', (req, res) => {
    res.send('ok');
});
export default app;
//# sourceMappingURL=app.js.map