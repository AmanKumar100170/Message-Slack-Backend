import express from 'express';

import { createOrderController } from '../../controllers/paymentController.js';
import { isAuthenticated } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/order', isAuthenticated, createOrderController);

export default router;