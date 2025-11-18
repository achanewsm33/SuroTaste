// backend/middleware/auth.js
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import dotenv from 'dotenv';
dotenv.config();

export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token missing' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = payload.id || payload.userId || (payload.user && payload.user.id);
    if (!userId) return res.status(401).json({ message: 'Invalid token payload' });

    // fetch minimal user
    const [rows] = await db.query('SELECT id, name, email, role FROM users WHERE id = ?', [userId]);
    if (!rows || rows.length === 0) return res.status(401).json({ message: 'User not found' });

    req.user = rows[0];
    return next();
  } catch (err) {
    console.error('authenticateToken error:', err.stack || err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export const requireAdmin = (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    return next();
  } catch (err) {
    console.error('requireAdmin error:', err);
    return res.status(500).json({ message: 'Server error in requireAdmin' });
  }
};
