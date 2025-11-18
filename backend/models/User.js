import db from '../config/db.js';
import bcrypt from 'bcryptjs';

export const User = {
    async create(userData, callback) {
        const { username, email, password, google_id, role } = userData;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await pool.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );
        return result.insertId;
    },

    async findByEmail(email) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );
            return rows[0];
        } catch (error) {
            console.error('Error in findByEmail:', error);
            throw error;
        }
    },

    async findById(id) {
        const [rows] = await pool.execute(
            'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
            [id]
        );
        return rows[0];
    },

    async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    },

    async isAdmin(userId) {
        const [rows] = await pool.execute(
            'SELECT role FROM users WHERE id = ? AND role = "admin"',
            [userId]
        );
        return rows.length > 0;
    },

    // Method untuk testing
    async getAll() {
        const [rows] = await pool.execute('SELECT id, username, email, role FROM users');
        return rows;
    }
};