const express = require('express');
const { body } = require('express-validator');
const subController = require('../controllers/subscription.controller');
const { validate } = require('../middleware/validator');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.post('/', 
    [
        body('planType').isIn(['basic', 'premium', 'annual']).withMessage('Invalid plan type')
    ],
    validate,
    subController.createSubscription
);

router.get('/current', subController.getCurrentSubscription);
router.post('/:id/cancel', subController.cancelSubscription);

module.exports = router;
