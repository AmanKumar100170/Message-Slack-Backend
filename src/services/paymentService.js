import paymentRepository from '../repositories/paymentRepository.js';

export const createPaymentService = async (orderId, amount) => {
    const payment = await paymentRepository.create({
        orderId,
        amount
    });

    return payment;
};

export const updatePaymentStatusService = async (orderId, status, paymentId) => {
    const payment = await paymentRepository.updateOrder(orderId, { status, paymentId });
    return payment;
};