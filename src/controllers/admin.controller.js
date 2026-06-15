const AdminService = require('../services/admin.service');

exports.getStats = async (req, res, next) => {
  try { const stats = await AdminService.getDashboardStats(); res.json({ status: 'success', data: { stats } }); }
  catch (e) { next(e); }
};

// Users
exports.getUsers = async (req, res, next) => {
  try { const data = await AdminService.getAllUsers(req.query); res.json({ status: 'success', data }); }
  catch (e) { next(e); }
};
exports.getUser = async (req, res, next) => {
  try { const user = await AdminService.getUserById(req.params.id); res.json({ status: 'success', data: { user } }); }
  catch (e) { next(e); }
};
exports.updateUser = async (req, res, next) => {
  try { const result = await AdminService.updateUser(req.params.id, req.body); res.json({ status: 'success', data: result }); }
  catch (e) { next(e); }
};
exports.deleteUser = async (req, res, next) => {
  try { const result = await AdminService.deleteUser(req.params.id); res.json({ status: 'success', data: result }); }
  catch (e) { next(e); }
};

// Products
exports.getProducts = async (req, res, next) => {
  try { const data = await AdminService.getAllProducts(req.query); res.json({ status: 'success', data }); }
  catch (e) { next(e); }
};
exports.addProduct = async (req, res, next) => {
  try { const result = await AdminService.addProduct(req.body); res.status(201).json({ status: 'success', data: result }); }
  catch (e) { next(e); }
};
exports.updateProduct = async (req, res, next) => {
  try { const result = await AdminService.updateProduct(req.params.id, req.body); res.json({ status: 'success', data: result }); }
  catch (e) { next(e); }
};
exports.deleteProduct = async (req, res, next) => {
  try { const result = await AdminService.deleteProduct(req.params.id); res.json({ status: 'success', data: result }); }
  catch (e) { next(e); }
};
exports.bulkDeleteProducts = async (req, res, next) => {
  try { const result = await AdminService.bulkDeleteProducts(req.body.ids); res.json({ status: 'success', data: result }); }
  catch (e) { next(e); }
};

// Categories
exports.getCategories = async (req, res, next) => {
  try { const data = await AdminService.getAllCategories(req.query); res.json({ status: 'success', data }); }
  catch (e) { next(e); }
};
exports.addCategory = async (req, res, next) => {
  try { const result = await AdminService.addCategory(req.body); res.status(201).json({ status: 'success', data: result }); }
  catch (e) { next(e); }
};
exports.updateCategory = async (req, res, next) => {
  try { const result = await AdminService.updateCategory(req.params.id, req.body); res.json({ status: 'success', data: result }); }
  catch (e) { next(e); }
};
exports.deleteCategory = async (req, res, next) => {
  try { const result = await AdminService.deleteCategory(req.params.id); res.json({ status: 'success', data: result }); }
  catch (e) { next(e); }
};

// Orders
exports.getOrders = async (req, res, next) => {
  try { const data = await AdminService.getAllOrders(req.query); res.json({ status: 'success', data }); }
  catch (e) { next(e); }
};
exports.getOrderDetail = async (req, res, next) => {
  try { const order = await AdminService.getOrderDetails(req.params.id); res.json({ status: 'success', data: { order } }); }
  catch (e) { next(e); }
};
exports.updateOrderStatus = async (req, res, next) => {
  try { const result = await AdminService.updateOrderStatus(req.params.id, req.body.status); res.json({ status: 'success', data: result }); }
  catch (e) { next(e); }
};
exports.deleteOrder = async (req, res, next) => {
  try { const result = await AdminService.deleteOrder(req.params.id); res.json({ status: 'success', data: result }); }
  catch (e) { next(e); }
};
exports.bulkDeleteOrders = async (req, res, next) => {
  try { const result = await AdminService.deleteOrders(req.body.ids); res.json({ status: 'success', data: result }); }
  catch (e) { next(e); }
};

// Payments
exports.getPayments = async (req, res, next) => {
  try { const data = await AdminService.getAllPayments(req.query); res.json({ status: 'success', data }); }
  catch (e) { next(e); }
};
exports.updatePaymentStatus = async (req, res, next) => {
  try { const result = await AdminService.updatePaymentStatus(req.params.id, req.body.status); res.json({ status: 'success', data: result }); }
  catch (e) { next(e); }
};
exports.refundPayment = async (req, res, next) => {
  try { const result = await AdminService.refundPayment(req.params.id); res.json({ status: 'success', data: result }); }
  catch (e) { next(e); }
};

// Subscriptions
exports.getSubscriptions = async (req, res, next) => {
  try { const data = await AdminService.getAllSubscriptions(req.query); res.json({ status: 'success', data }); }
  catch (e) { next(e); }
};
exports.updateSubscriptionStatus = async (req, res, next) => {
  try { const result = await AdminService.updateSubscriptionStatus(req.params.id, req.body.status); res.json({ status: 'success', data: result }); }
  catch (e) { next(e); }
};
exports.cancelSubscription = async (req, res, next) => {
  try { const result = await AdminService.updateSubscriptionStatus(req.params.id, 'cancelled'); res.json({ status: 'success', data: result }); }
  catch (e) { next(e); }
};
exports.getSubscriptionAnalytics = async (req, res, next) => {
  try { const data = await AdminService.getSubscriptionAnalytics(); res.json({ status: 'success', data }); }
  catch (e) { next(e); }
};

// Fitness
exports.getFitnessRecords = async (req, res, next) => {
  try { const data = await AdminService.getFitnessRecords(req.query); res.json({ status: 'success', data }); }
  catch (e) { next(e); }
};
exports.getFitnessReport = async (req, res, next) => {
  try { const records = await AdminService.getFitnessReport(req.query.month, req.query.year); res.json({ status: 'success', data: { records } }); }
  catch (e) { next(e); }
};
exports.deleteFitnessRecord = async (req, res, next) => {
  try { const result = await AdminService.deleteFitnessRecord(req.params.id); res.json({ status: 'success', data: result }); }
  catch (e) { next(e); }
};

// Notifications
exports.getNotifications = async (req, res, next) => {
  try { const data = await AdminService.getNotifications(req.query); res.json({ status: 'success', data }); }
  catch (e) { next(e); }
};
exports.markNotificationRead = async (req, res, next) => {
  try { const result = await AdminService.markNotificationRead(req.params.id); res.json({ status: 'success', data: result }); }
  catch (e) { next(e); }
};
exports.markAllNotificationsRead = async (req, res, next) => {
  try { const result = await AdminService.markAllNotificationsRead(); res.json({ status: 'success', data: result }); }
  catch (e) { next(e); }
};
exports.deleteNotification = async (req, res, next) => {
  try { const result = await AdminService.deleteNotification(req.params.id); res.json({ status: 'success', data: result }); }
  catch (e) { next(e); }
};

// Settings
exports.getSettings = async (req, res, next) => {
  try { const settings = await AdminService.getSettings(); res.json({ status: 'success', data: { settings } }); }
  catch (e) { next(e); }
};
exports.updateSettings = async (req, res, next) => {
  try { const result = await AdminService.updateSettings(req.body); res.json({ status: 'success', data: result }); }
  catch (e) { next(e); }
};
exports.changePassword = async (req, res, next) => {
  try {
    const result = await AdminService.changeAdminPassword(req.user.userId, req.body.currentPassword, req.body.newPassword);
    res.json({ status: 'success', data: result });
  } catch (e) { next(e); }
};

// Reports
exports.getSalesReport = async (req, res, next) => {
  try { const data = await AdminService.getSalesReport(req.query); res.json({ status: 'success', data }); }
  catch (e) { next(e); }
};
exports.getProductReport = async (req, res, next) => {
  try { const data = await AdminService.getProductReport(req.query); res.json({ status: 'success', data }); }
  catch (e) { next(e); }
};
exports.getReport = async (req, res, next) => {
  try {
    const report = await AdminService.getReport(req.query);
    const summary = {};
    if (req.query.type === 'revenue') {
      summary['Total Orders'] = report.length;
      summary['Total Revenue'] = report.reduce((a, r) => a + Number(r.revenue || 0), 0).toLocaleString() + ' RWF';
    }
    res.json({ status: 'success', data: { report, summary } });
  } catch (e) { next(e); }
};
