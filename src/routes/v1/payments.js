import express from 'express';

import { capturePaymentController, createOrderController } from '../../controllers/paymentController.js';
import { isAuthenticated } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/order', isAuthenticated, createOrderController);

router.post('/capture', capturePaymentController);

export default router;