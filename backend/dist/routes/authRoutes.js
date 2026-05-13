// src/routes/authRoutes.ts
import { Router } from 'express';
import { changePassword, getMe, login, register, requestPasswordReset, resetPassword, } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = Router();
// Registro
router.post('/register', register);
// Login
router.post('/login', login);
// Solicitar codigo de recuperacion
router.post('/forgot-password', requestPasswordReset);
// Restablecer contrasena con codigo
router.post('/reset-password', resetPassword);
// Usuario actual (protegido con JWT)
router.get('/me', protect, getMe);
// Cambiar contrasena desde sesion activa
router.post('/change-password', protect, changePassword);
export default router;
//# sourceMappingURL=authRoutes.js.map