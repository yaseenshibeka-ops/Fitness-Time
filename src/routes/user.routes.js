const express = require('express');
const { body } = require('express-validator');
const userCtrl = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();
router.use(authenticate);

router.put('/profile', userCtrl.updateProfile);
router.put('/change-password', [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], validate, userCtrl.changePassword);

router.get('/wishlist', userCtrl.getWishlist);
router.post('/wishlist', [body('productId').isInt().withMessage('Product ID is required')], validate, userCtrl.addToWishlist);
router.delete('/wishlist/:id', userCtrl.removeFromWishlist);
router.post('/wishlist/:id/move-to-cart', userCtrl.moveToCart);

router.get('/workouts', userCtrl.getWorkouts);
router.post('/workouts', [
  body('workoutType').notEmpty().withMessage('Workout type is required'),
  body('durationMinutes').isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),
  body('workoutDate').isISO8601().withMessage('Valid date is required')
], validate, userCtrl.addWorkout);
router.put('/workouts/:id', userCtrl.updateWorkout);
router.delete('/workouts/:id', userCtrl.deleteWorkout);

router.get('/goals', userCtrl.getGoals);
router.put('/goals/:id', userCtrl.updateGoal);
router.delete('/goals/:id', userCtrl.deleteGoal);

router.get('/notifications', userCtrl.getUserNotifications);
router.put('/notifications/read-all', userCtrl.markAllRead);
router.put('/notifications/:id/read', userCtrl.markRead);
router.delete('/notifications/:id', userCtrl.deleteNotification);

router.get('/settings', userCtrl.getUserSettings);
router.put('/settings', userCtrl.updateUserSettings);

module.exports = router;
