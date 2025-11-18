// controllers/authController.js
import { query } from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// NOTE: gunakan constructor (clientId, clientSecret, redirectUri)
const oauthClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.BACKEND_URL}/api/auth/google/callback`
);

function signToken(userId) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET not set');
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function googleRedirect(req, res) {
  try {
    const authUrl = oauthClient.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ],
      prompt: 'consent',
      include_granted_scopes: true
    });
    return res.redirect(authUrl);
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return res.status(500).json({ message: 'Error initiating Google login' });
  }
}

async function googleCallback(req, res) {
  try {
    const { code, error } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (error) {
      console.error('Google OAuth error:', error);
      return res.redirect(`${frontendUrl}/auth/error?message=Google+authentication+cancelled`);
    }
    if (!code) {
      console.error('No authorization code received');
      return res.redirect(`${frontendUrl}/auth/error?message=No+authorization+code+received`);
    }

    // tukar code -> token
    const tokenResponse = await oauthClient.getToken(code);
    oauthClient.setCredentials(tokenResponse.tokens);

    // ambil user info
    const userInfoResponse = await oauthClient.request({
      url: 'https://www.googleapis.com/oauth2/v2/userinfo',
    });
    const userInfo = userInfoResponse.data;
    const { id: googleId, email, name, picture } = userInfo;

    if (!email) throw new Error('No email received from Google');

    // cari user by google_id
    const existingByGoogle = await query(
      'SELECT id, name, email, role FROM users WHERE google_id = ?',
      [googleId]
    );

    let user;
    let isNewUser = false;

    if (existingByGoogle.length > 0) {
      user = existingByGoogle[0];
      console.log('User found by Google ID:', user);
    } else {
      // cari by email
      const existingByEmail = await query(
        'SELECT id, name, email, role, google_id FROM users WHERE email = ?',
        [email]
      );

      if (existingByEmail.length > 0) {
        user = existingByEmail[0];
        if (!user.google_id) {
          await query('UPDATE users SET google_id = ?, name = ? WHERE id = ?', [googleId, name, user.id]);
          user.name = name;
        }
        console.log('User found by email:', user);
      } else {
        const role = email === 'surodev@gmail.com' ? 'admin' : 'user';
        const insertResult = await query(
          'INSERT INTO users (name, email, google_id, password, role) VALUES (?, ?, ?, ?, ?)',
          [name, email, googleId, '', role]
        );
        // insertResult akan berisi OkPacket -> ambil insertId
        const insertedId = insertResult.insertId;
        user = { id: insertedId, name, email, role };
        isNewUser = true;
      }
    }

    const token = signToken(user.id);
    console.log(`✅ Google login success - User: ${user.email}, Role: ${user.role}`);

    // redirect ke frontend dengan token & user
    const userData = encodeURIComponent(JSON.stringify(user));
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/success?token=${token}&user=${userData}`);
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/auth/error?message=Authentication+failed:+${encodeURIComponent(err.message)}`);
  }
}

async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required' });

    const exists = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (exists.length) return res.status(400).json({ message: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const insertRes = await query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hash, 'user']);
    const userId = insertRes.insertId;

    const token = signToken(userId);

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: userId, name, email, role: 'user' }
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const rows = await query('SELECT id, name, email, password, role, google_id FROM users WHERE email = ?', [email]);
    if (!rows || rows.length === 0) return res.status(400).json({ message: 'Invalid credentials' });

    const user = rows[0];
    if (user.google_id && (!user.password || user.password === '')) {
      return res.status(400).json({ message: 'Account exists via Google. Please sign in with Google.' });
    }
    if (!user.password) return res.status(400).json({ message: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid credentials' });

    const token = signToken(user.id);
    return res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Login error (stack):', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export { register, login, googleRedirect, googleCallback };
