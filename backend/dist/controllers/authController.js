import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendPasswordResetEmail } from '../services/emailService.js';
import { isPasswordValid, PASSWORD_POLICY_MESSAGE, } from '../utils/passwordPolicy.js';
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};
const normalizeEmail = (email) => email.trim().toLowerCase();
const generateResetCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Todos los campos son obligatorios',
            });
        }
        if (!isPasswordValid(password)) {
            return res.status(400).json({
                message: PASSWORD_POLICY_MESSAGE,
            });
        }
        const normalizedEmail = normalizeEmail(email);
        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            return res.status(400).json({
                message: 'El usuario ya existe',
            });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
        });
        return res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id.toString()),
        });
    }
    catch (error) {
        return res.status(500).json({
            message: 'Error en el registro',
            error,
        });
    }
};
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: 'Email y contraseña son obligatorios',
            });
        }
        const user = await User.findOne({ email: normalizeEmail(email) });
        if (!user) {
            return res.status(401).json({
                message: 'Credenciales inválidas',
            });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                message: 'Credenciales inválidas',
            });
        }
        return res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id.toString()),
        });
    }
    catch (error) {
        return res.status(500).json({
            message: 'Error en el login',
            error,
        });
    }
};
export const getMe = async (req, res) => {
    return res.status(200).json(req.user);
};
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: 'Contrasena actual y nueva son obligatorias',
            });
        }
        if (!isPasswordValid(newPassword)) {
            return res.status(400).json({
                message: PASSWORD_POLICY_MESSAGE,
            });
        }
        const user = await User.findById(req.user?._id);
        if (!user) {
            return res.status(404).json({
                message: 'Usuario no encontrado',
            });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({
                message: 'La contrasena actual no es correcta',
            });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        return res.status(200).json({
            message: 'Contrasena actualizada correctamente',
        });
    }
    catch (error) {
        return res.status(500).json({
            message: 'Error al cambiar la contrasena',
            error,
        });
    }
};
export const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                message: 'Email es obligatorio',
            });
        }
        const user = await User.findOne({ email: normalizeEmail(email) }).select('+passwordResetCode +passwordResetExpires');
        if (!user) {
            return res.status(200).json({
                message: 'Si el correo existe, enviaremos un codigo de verificacion',
            });
        }
        const code = generateResetCode();
        const salt = await bcrypt.genSalt(10);
        user.passwordResetCode = await bcrypt.hash(code, salt);
        user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();
        await sendPasswordResetEmail({
            to: user.email,
            code,
            name: user.name,
        });
        return res.status(200).json({
            message: 'Si el correo existe, enviaremos un codigo de verificacion',
        });
    }
    catch (error) {
        return res.status(500).json({
            message: 'Error al enviar el codigo',
            error,
        });
    }
};
export const resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        if (!email || !code || !newPassword) {
            return res.status(400).json({
                message: 'Email, codigo y nueva contrasena son obligatorios',
            });
        }
        if (!/^\d{6}$/.test(code)) {
            return res.status(400).json({
                message: 'El codigo debe tener 6 digitos',
            });
        }
        if (!isPasswordValid(newPassword)) {
            return res.status(400).json({
                message: PASSWORD_POLICY_MESSAGE,
            });
        }
        const user = await User.findOne({ email: normalizeEmail(email) }).select('+passwordResetCode +passwordResetExpires');
        if (!user ||
            !user.passwordResetCode ||
            !user.passwordResetExpires ||
            user.passwordResetExpires.getTime() < Date.now()) {
            return res.status(400).json({
                message: 'Codigo invalido o vencido',
            });
        }
        const isCodeValid = await bcrypt.compare(code, user.passwordResetCode);
        if (!isCodeValid) {
            return res.status(400).json({
                message: 'Codigo invalido o vencido',
            });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.passwordResetCode = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        return res.status(200).json({
            message: 'Contrasena restablecida correctamente',
        });
    }
    catch (error) {
        return res.status(500).json({
            message: 'Error al restablecer la contrasena',
            error,
        });
    }
};
//# sourceMappingURL=authController.js.map