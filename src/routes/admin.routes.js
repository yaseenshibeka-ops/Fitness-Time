const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/admin.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validator');

router.use(authenticate, authorizeAdmin);

// Dashboard
router.get('/stats', ctrl.getStats);

// Users
router.get('/users', ctrl.getUsers);
router.get('/users/:id', ctrl.getUser);
router.put('/users/:id', ctrl.updateUser);
router.delete('/users/:id', ctrl.deleteUser);
router.post('/users/bulk-delete', ctrl.bulkDeleteUsers);

// Products
router.get('/products', ctrl.getProducts);
router.post('/products', ctrl.addProduct);
router.put('/products/:id', ctrl.updateProduct);
router.delete('/products/:id', ctrl.deleteProduct);
router.post('/products/bulk-delete', ctrl.bulkDeleteProducts);

// Categories
router.get('/categories', ctrl.getCategories);
router.post('/categories', ctrl.addCategory);
router.put('/categories/:id', ctrl.updateCategory);
router.delete('/categories/:id', ctrl.deleteCategory);

// Orders
router.get('/orders', ctrl.getOrders);
router.get('/orders/:id', ctrl.getOrderDetail);
router.put('/orders/:id/status', ctrl.updateOrderStatus);
router.delete('/orders/:id', ctrl.deleteOrder);
router.post('/orders/bulk-delete', ctrl.bulkDeleteOrders);

// Payments
router.get('/payments', ctrl.getPayments);
router.put('/payments/:id/status', ctrl.updatePaymentStatus);
router.post('/payments/:id/refund', ctrl.refundPayment);

// Subscriptions
router.get('/subscriptions', ctrl.getSubscriptions);
router.get('/subscriptions/analytics', ctrl.getSubscriptionAnalytics);
router.put('/subscriptions/:id/status', ctrl.updateSubscriptionStatus);
router.put('/subscriptions/:id/cancel', ctrl.cancelSubscription);

// Fitness
router.get('/fitness', ctrl.getFitnessRecords);
router.get('/fitness/report', ctrl.getFitnessReport);
router.delete('/fitness/:id', ctrl.deleteFitnessRecord);

// Notifications
router.get('/notifications', ctrl.getNotifications);
router.put('/notifications/read-all', ctrl.markAllNotificationsRead);
router.put('/notifications/:id/read', ctrl.markNotificationRead);
router.delete('/notifications/:id', ctrl.deleteNotification);

// Settings
router.get('/settings', ctrl.getSettings);
router.put('/settings', ctrl.updateSettings);
router.put('/change-password', ctrl.changePassword);

// Reports
router.get('/reports/sales', ctrl.getSalesReport);
router.get('/reports/products', ctrl.getProductReport);
router.get('/reports', ctrl.getReport);

module.exports = router;
