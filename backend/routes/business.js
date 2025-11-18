import express from 'express';
import { 
  createBusiness, 
  updateBusiness, 
  getBusiness, 
  getBusinessDetail, 
  getAdminBusiness,
  deleteBusiness
} from '../controllers/businessController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/', authenticateToken, requireAdmin, upload.single('image'), createBusiness);
router.put('/:id', authenticateToken, requireAdmin, upload.single('image'), updateBusiness);
router.delete('/:id', authenticateToken, requireAdmin, deleteBusiness);
router.get('/admin', authenticateToken, requireAdmin, getAdminBusiness);
router.get('/my-business', authenticateToken, requireAdmin, getAdminBusiness); // Tambahkan route ini
// Routes public - tidak butuh authentication
router.get('/', getBusiness);
router.get('/:id', getBusinessDetail);

export default router;