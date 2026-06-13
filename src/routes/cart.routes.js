const express = require('express');
const { body } = require('express-validator');
const cartController = require('../controllers/cart.controller');
const { validate } = require('../middleware/validator');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All cart routes require authentication
router.use(authenticate);

router.get('/', cartController.getCart);

router.post('/items', 
    [
        body('productId').isInt().withMessage('Valid product ID is required'),
        body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
    ], 
    validate, 
    cartController.addItem
);

router.put('/items/:itemId', 
    [
        body('quantity').isInt({ min: 0 }).withMessage('Quantity must be 0 or greater')
    ], 
    validate, 
    cartController.updateItem
);

router.delete('/items/:itemId', cartController.removeItem);

module.exports = router;
