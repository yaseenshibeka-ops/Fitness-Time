const express = require('express');
const { body } = require('express-validator');
const fitnessController = require('../controllers/fitness.controller');
const { validate } = require('../middleware/validator');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.post('/progress', 
    [
        body('recorded_date').notEmpty().isISO8601().withMessage('Valid recorded date is required')
    ],
    validate,
    fitnessController.recordProgress
);

router.get('/progress', fitnessController.getProgressHistory);
router.delete('/progress/:id', fitnessController.deleteProgress);

router.post('/goals', 
    [
        body('goal_type').notEmpty().withMessage('Goal type is required'),
        body('target_value').isNumeric().withMessage('Target value must be numeric')
    ],
    validate,
    fitnessController.setGoal
);

router.get('/goals', fitnessController.getGoals);
router.get('/dashboard-stats', fitnessController.getDashboardStats);

module.exports = router;
