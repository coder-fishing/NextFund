import express from 'express';
import { syncUser, getUser, getMyWallet, updateMyWallet } from '../controllers/userController.js';
import { verifyInternalRequest, verifyJWTOptional } from '../middleware/auth.js';
const router = express.Router();
router.post('/sync', syncUser);
router.get('/', verifyJWTOptional, getUser);
router.get('/wallet', verifyInternalRequest, getMyWallet);
router.patch('/wallet', verifyInternalRequest, updateMyWallet);
export default router;
//# sourceMappingURL=users.js.map