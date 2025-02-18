import { StatusCodes } from "http-status-codes";

import razorpay from '../config/razorpayConfig.js';
import { CURRENCY, RECEIPT_SECRET } from "../config/serverConfig.js";
import { internalErrorResponse } from '../utils/common/responseObjects.js';

export const createOrderController = async (req, res) => {
    try {
        const options = {
            amount: req.body.amount * 100,
            currency: CURRENCY,
            receipt: RECEIPT_SECRET
        }
        
        const order = await razorpay.orders.create(options);
        if (!order){
            throw new Error('Failed to create order');
        }

        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Order created successfully',
            data: order
        });
    } catch (error) {
        console.log('Error in create order controller', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(internalErrorResponse(error));
    }
};