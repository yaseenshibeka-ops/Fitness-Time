const express = require('express');
const { body } = require('express-validator');
const paymentController = require('../controllers/payment.controller');
const { validate } = require('../middleware/validator');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Webhook doesn't require JWT auth (it comes from external provider)
router.post('/webhook', 
    [
        body('transactionRef').notEmpty(),
        body('status').isIn(['SUCCESS', 'FAILED'])
    ],
    validate,
    paymentController.paymentWebhook
);

// Below routes require authentication
router.use(authenticate);

router.post('/initiate', 
    [
        body('paymentMethod').isIn(['mtn_momo', 'airtel_money', 'cash_on_delivery', 'bank_transfer', 'paypal']).withMessage('Invalid payment method'),
        body('amount').isNumeric().withMessage('Amount is required'),
        // orderId or subscriptionId should be provided
    ],
    validate,
    paymentController.initiatePayment
);

router.get('/history', paymentController.getPayments);

module.exports = router;
