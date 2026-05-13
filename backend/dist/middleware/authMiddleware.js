import jwt from 'jsonwebtoken';
import User from '../models/User.js';
export const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'No autorizado, token no enviado',
            });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({
                message: 'No autorizado, usuario no encontrado',
            });
        }
        req.user = {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
        };
        next();
    }
    catch (error) {
        return res.status(401).json({
            message: 'No autorizado, token inválido',
        });
    }
};
//# sourceMappingURL=authMiddleware.js.map