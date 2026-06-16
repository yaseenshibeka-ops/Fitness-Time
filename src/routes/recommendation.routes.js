const express = require('express');
const recController = require('../controllers/recommendation.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/workouts', recController.getWorkoutRecommendations);
router.get('/products', recController.getProductRecommendations);
router.get('/progress', recController.getProgressInsights);

module.exports = router;
