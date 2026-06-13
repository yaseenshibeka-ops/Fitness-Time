const AuthService = require('../services/auth.service');
const pool = require('../config/database');

exports.register = async (req, res, next) => {
    try {
        const result = await AuthService.registerUser(req.body);
        res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const result = await AuthService.loginUser(req.body);
        res.status(200).json({
            status: 'success',
            message: 'Login successful',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

exports.getProfile = async (req, res, next) => {
    try {
        const user = await AuthService.getProfile(req.user.userId);
        res.status(200).json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

// Placeholder for logout since JWT is stateless, 
// a real implementation might use a token blacklist or client-side removal
exports.logout = (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Logout successful. Please remove token on client side.'
    });
};

exports.deleteAccount = async (req, res, next) => {
    try {
        await pool.query('DELETE FROM users WHERE user_id=?', [req.user.userId]);
        res.json({ status: 'success', data: { message: 'Account deleted' } });
    } catch (e) { next(e); }
};
