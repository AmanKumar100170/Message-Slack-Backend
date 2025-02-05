import express from "express";
import { getMessageController } from "../../controllers/messageController";
import { isAuthenticated } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/messages/:channelId', isAuthenticated, getMessageController);

export default router;