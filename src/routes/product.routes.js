const express = require('express');
const { body } = require('express-validator');
const productController = require('../controllers/product.controller');
const { validate } = require('../middleware/validator');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/categories', productController.getCategories);
router.get('/', productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/:id', productController.getProduct);

// Reviews
router.get('/:id/reviews', productController.getReviews);
router.post('/:id/reviews',
    authenticate,
    [
        body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
        body('reviewText').notEmpty().trim().withMessage('Review text is required'),
    ],
    validate,
    productController.addReview
);

module.exports = router;
