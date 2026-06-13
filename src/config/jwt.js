const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
    return jwt.sign(
        { userId, role },
        process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_in_production',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_in_production');
    } catch (error) {
        return null;
    }
};

module.exports = {
    generateToken,
    verifyToken
};
