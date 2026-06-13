const express = require('express');
const { body } = require('express-validator');
const orderController = require('../controllers/order.controller');
const { validate } = require('../middleware/validator');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.post('/checkout', 
    [
        body('fullName').notEmpty().withMessage('Full name is required').trim(),
        body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
        body('phone').notEmpty().withMessage('Phone number is required').trim(),
        body('deliveryAddress').notEmpty().withMessage('Delivery address is required').trim()
    ], 
    validate, 
    orderController.checkout
);

router.get('/', orderController.getOrders);
router.get('/:orderId', orderController.getOrderDetails);

module.exports = router;
