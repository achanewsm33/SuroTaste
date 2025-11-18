import express from 'express';
import { 
  createProduct, 
  updateProduct, 
  getProducts, 
  getProductsByBusiness, 
  getAdminProducts,
  deleteProduct
} from '../controllers/productController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/', authenticateToken, requireAdmin, upload.single('image'), createProduct);
router.put('/:id', authenticateToken, requireAdmin, upload.single('image'), updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, deleteProduct);
router.get('/', getProducts);
router.get('/admin', authenticateToken, requireAdmin, getAdminProducts);
router.get('/business/:businessId', getProductsByBusiness);

export default router;