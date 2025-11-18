import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path'; 
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js'; 
import businessRoutes from './routes/business.js';
import productRoutes from './routes/product.js';
import { testConnection } from './config/db.js'; // <-- import di sini


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routes
app.use('/api/auth', authRoutes);
console.log('🔗 ROUTER MOUNTED at /api/auth');

app.use('/api/business', businessRoutes);
app.use('/api/products', productRoutes);

// simple root and health
app.get('/', (req, res) => res.send('Culinary API is running'));
app.get('/api/health', (req, res) => res.json({ ok: true }));

(async () => {
  const ok = await testConnection();
  if (!ok) {
    console.error('Database not available. Exiting.');
    process.exit(1);
  }
  app.listen(PORT,'0.0.0.0', () => console.log(`Server listening on ${PORT}`));
})();