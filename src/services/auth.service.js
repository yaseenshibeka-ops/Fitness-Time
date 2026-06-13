const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { generateToken } = require('../config/jwt');

class AuthService {
    static async registerUser({ fullName, email, password, phone, address }) {
        // Check if user exists
        const [existingUsers] = await pool.query('SELECT user_id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            throw { statusCode: 400, message: 'Email already in use' };
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insert new user
        const [result] = await pool.query(
            'INSERT INTO users (full_name, email, password_hash, phone, address, role) VALUES (?, ?, ?, ?, ?, ?)',
            [fullName, email, passwordHash, phone || null, address || null, 'user']
        );

        const userId = result.insertId;
        
        // Generate Token
        const token = generateToken(userId, 'user');

        return {
            user: {
                id: userId,
                fullName,
                email,
                role: 'user'
            },
            token
        };
    }

    static async loginUser({ email, password }) {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (!user) {
            throw { statusCode: 401, message: 'Invalid credentials' };
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            throw { statusCode: 401, message: 'Invalid credentials' };
        }

        const token = generateToken(user.user_id, user.role);

        return {
            user: {
                id: user.user_id,
                fullName: user.full_name,
                email: user.email,
                role: user.role
            },
            token
        };
    }

    static async getProfile(userId) {
        const [users] = await pool.query('SELECT user_id, full_name, email, phone, address, role, avatar_url, created_at FROM users WHERE user_id = ?', [userId]);
        const user = users[0];

        if (!user) {
            throw { statusCode: 404, message: 'User not found' };
        }

        return user;
    }
}

module.exports = AuthService;
