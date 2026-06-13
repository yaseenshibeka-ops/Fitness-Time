const PaymentService = require('../services/payment.service');

exports.initiatePayment = async (req, res, next) => {
    try {
        const result = await PaymentService.initiatePayment({
            userId: req.user.userId,
            ...req.body
        });
        res.status(200).json({
            status: 'success',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

exports.paymentWebhook = async (req, res, next) => {
    try {
        // In a real app, you would verify webhook signature here
        const { transactionRef, status } = req.body;
        const result = await PaymentService.handlePaymentWebhook(transactionRef, status);
        res.status(200).json({
            status: 'success',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

exports.getPayments = async (req, res, next) => {
    try {
        const payments = await PaymentService.getUserPayments(req.user.userId);
        res.status(200).json({
            status: 'success',
            data: { payments }
        });
    } catch (error) {
        next(error);
    }
};
