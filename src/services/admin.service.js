const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class AdminService {

  // ===================== DASHBOARD =====================

  static async getDashboardStats() {
    const [[userStats]] = await pool.query('SELECT COUNT(*) as total_users FROM users WHERE role = "user"');
    const [[allUsers]] = await pool.query('SELECT COUNT(*) as total FROM users');
    const [[orderStats]] = await pool.query('SELECT COUNT(*) as total_orders, COALESCE(SUM(grand_total),0) as total_revenue FROM orders WHERE status != "cancelled"');
    const [[productStats]] = await pool.query('SELECT COUNT(*) as total_products FROM products WHERE is_active = TRUE');
    const [[subscriptionStats]] = await pool.query('SELECT COUNT(*) as active_subscriptions FROM subscriptions WHERE status = "active"');
    const [[pendingOrders]] = await pool.query('SELECT COUNT(*) as pending FROM orders WHERE status = "pending"');
    const [[lowStock]] = await pool.query('SELECT COUNT(*) as low FROM products WHERE is_active = TRUE AND stock_quantity < 10');
    const [[fitnessStats]] = await pool.query('SELECT COUNT(*) as total FROM fitness_progress');

    const [monthlySales] = await pool.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COALESCE(SUM(grand_total),0) as total
       FROM orders WHERE status != "cancelled" AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
       GROUP BY month ORDER BY month`
    );

    const [orderChart] = await pool.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as total
       FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
       GROUP BY month ORDER BY month`
    );

    const [subChart] = await pool.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as total
       FROM subscriptions WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
       GROUP BY month ORDER BY month`
    );

    const [recentOrders] = await pool.query(
      'SELECT o.*, u.full_name FROM orders o JOIN users u ON o.user_id = u.user_id ORDER BY o.created_at DESC LIMIT 5'
    );

    return {
      totalUsers: userStats.total_users,
      totalAccounts: allUsers.total,
      totalOrders: orderStats.total_orders,
      totalRevenue: orderStats.total_revenue,
      totalProducts: productStats.total_products,
      activeSubscriptions: subscriptionStats.active_subscriptions,
      pendingOrders: pendingOrders.pending,
      lowStockProducts: lowStock.low,
      totalFitnessRecords: fitnessStats.total,
      monthlySales,
      orderChart,
      subscriptionChart: subChart,
      recentOrders
    };
  }

  // ===================== USERS =====================

  static async getAllUsers({ page = 1, limit = 20, search, role, status } = {}) {
    const offset = (page - 1) * limit;
    let where = ['1=1'];
    let params = [];

    if (search) {
      where.push('(u.full_name LIKE ? OR u.email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (role) {
      where.push('u.role = ?');
      params.push(role);
    }

    const [{ count }] = await pool.query(`SELECT COUNT(*) as count FROM users u WHERE ${where.join(' AND ')}`, params);
    const [users] = await pool.query(
      `SELECT u.* FROM users u WHERE ${where.join(' AND ')} ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    return { users, total: count, page: parseInt(page), pages: Math.ceil(count / limit) };
  }

  static async getUserById(userId) {
    const [users] = await pool.query('SELECT user_id, full_name, email, phone, address, role, avatar_url, created_at, updated_at FROM users WHERE user_id = ?', [userId]);
    if (!users.length) throw { statusCode: 404, message: 'User not found' };
    return users[0];
  }

  static async updateUser(userId, data) {
    const { full_name, email, phone, address, role } = data;
    await pool.query('UPDATE users SET full_name=?, email=?, phone=?, address=?, role=? WHERE user_id=?',
      [full_name, email, phone, address, role, userId]);
    return { message: 'User updated successfully' };
  }

  static async deleteUser(userId) {
    await pool.query('DELETE FROM users WHERE user_id = ? AND role != "admin"', [userId]);
    return { message: 'User deleted successfully' };
  }

  // ===================== PRODUCTS =====================

  static async getAllProducts({ page = 1, limit = 20, search, category_id } = {}) {
    const offset = (page - 1) * limit;
    let where = ['1=1'];
    let params = [];

    if (search) {
      where.push('(p.name LIKE ? OR p.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category_id) {
      where.push('p.category_id = ?');
      params.push(category_id);
    }

    const [{ count }] = await pool.query(
      `SELECT COUNT(*) as count FROM products p WHERE ${where.join(' AND ')}`, params);
    const [products] = await pool.query(
      `SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.category_id
       WHERE ${where.join(' AND ')} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );
    return { products, total: count, page: parseInt(page), pages: Math.ceil(count / limit) };
  }

  static async addProduct(data) {
    const { name, description, price, stock_quantity, category_id, image_url } = data;
    const [result] = await pool.query(
      'INSERT INTO products (name, description, price, stock_quantity, category_id, image_url) VALUES (?,?,?,?,?,?)',
      [name, description, price, stock_quantity, category_id, image_url || null]
    );
    return { productId: result.insertId, message: 'Product added successfully' };
  }

  static async updateProduct(id, data) {
    const { name, description, price, stock_quantity, category_id, image_url, is_active } = data;
    await pool.query(
      'UPDATE products SET name=?, description=?, price=?, stock_quantity=?, category_id=?, image_url=?, is_active=? WHERE product_id=?',
      [name, description, price, stock_quantity, category_id, image_url, is_active !== undefined ? is_active : true, id]
    );
    return { message: 'Product updated successfully' };
  }

  static async deleteProduct(id) {
    await pool.query('UPDATE products SET is_active=FALSE WHERE product_id=?', [id]);
    return { message: 'Product deactivated' };
  }

  static async bulkDeleteProducts(ids) {
    if (!ids || !ids.length) throw { statusCode: 400, message: 'No IDs provided' };
    await pool.query('UPDATE products SET is_active=FALSE WHERE product_id IN (?)', [ids]);
    return { message: `${ids.length} products deactivated` };
  }

  // ===================== CATEGORIES =====================

  static async getAllCategories({ search, page = 1, limit = 50 } = {}) {
    let where = ['1=1'];
    let params = [];
    if (search) { where.push('c.name LIKE ?'); params.push(`%${search}%`); }
    const offset = (page - 1) * limit;
    const [{ count }] = await pool.query(`SELECT COUNT(*) as count FROM categories c WHERE ${where.join(' AND ')}`, params);
    const [categories] = await pool.query(
      `SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.category_id) as product_count
       FROM categories c WHERE ${where.join(' AND ')} ORDER BY c.name LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );
    return { categories, total: count, page: parseInt(page), pages: Math.ceil(count / limit) };
  }

  static async addCategory(data) {
    const { name, description, image_url } = data;
    const [result] = await pool.query('INSERT INTO categories (name, description, image_url) VALUES (?,?,?)',
      [name, description, image_url || null]);
    return { categoryId: result.insertId, message: 'Category created' };
  }

  static async updateCategory(id, data) {
    const { name, description, image_url } = data;
    await pool.query('UPDATE categories SET name=?, description=?, image_url=? WHERE category_id=?',
      [name, description, image_url, id]);
    return { message: 'Category updated' };
  }

  static async deleteCategory(id) {
    const [products] = await pool.query('SELECT COUNT(*) as count FROM products WHERE category_id=?', [id]);
    if (products[0].count > 0) throw { statusCode: 400, message: 'Cannot delete category with existing products' };
    await pool.query('DELETE FROM categories WHERE category_id=?', [id]);
    return { message: 'Category deleted' };
  }

  // ===================== ORDERS =====================

  static async getAllOrders({ page = 1, limit = 20, search, status } = {}) {
    const offset = (page - 1) * limit;
    let where = ['1=1'];
    let params = [];

    if (search) {
      where.push('(o.order_reference LIKE ? OR o.full_name LIKE ? OR o.email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) {
      where.push('o.status = ?');
      params.push(status);
    }

    const [{ count }] = await pool.query(`SELECT COUNT(*) as count FROM orders o WHERE ${where.join(' AND ')}`, params);
    const [orders] = await pool.query(
      `SELECT o.*, u.full_name as customer_name FROM orders o JOIN users u ON o.user_id = u.user_id
       WHERE ${where.join(' AND ')} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );
    return { orders, total: count, page: parseInt(page), pages: Math.ceil(count / limit) };
  }

  static async getOrderDetails(orderId) {
    const [orders] = await pool.query(
      'SELECT o.*, u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone FROM orders o JOIN users u ON o.user_id = u.user_id WHERE o.order_id=?',
      [orderId]);
    if (!orders.length) throw { statusCode: 404, message: 'Order not found' };
    const [items] = await pool.query(
      'SELECT oi.*, p.name, p.image_url FROM order_items oi JOIN products p ON oi.product_id = p.product_id WHERE oi.order_id=?',
      [orderId]);
    orders[0].items = items;
    return orders[0];
  }

  static async updateOrderStatus(orderId, status) {
    await pool.query('UPDATE orders SET status=? WHERE order_id=?', [status, orderId]);
    return { message: 'Order status updated' };
  }

  static async deleteOrder(orderId) {
    const [orders] = await pool.query('SELECT * FROM orders WHERE order_id=?', [orderId]);
    if (!orders.length) throw { statusCode: 404, message: 'Order not found' };
    await pool.query('DELETE FROM orders WHERE order_id=?', [orderId]);
    return { message: 'Order deleted successfully' };
  }

  static async deleteOrders(ids) {
    if (!ids || !ids.length) throw { statusCode: 400, message: 'No IDs provided' };
    await pool.query('DELETE FROM orders WHERE order_id IN (?)', [ids]);
    return { message: `${ids.length} orders deleted` };
  }

  // ===================== PAYMENTS =====================

  static async getAllPayments({ page = 1, limit = 20, search, status, payment_method } = {}) {
    const offset = (page - 1) * limit;
    let where = ['1=1'];
    let params = [];

    if (search) {
      where.push('(p.transaction_reference LIKE ? OR u.full_name LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (status) {
      where.push('p.payment_status = ?');
      params.push(status);
    }
    if (payment_method) {
      where.push('p.payment_method = ?');
      params.push(payment_method);
    }

    const [{ count }] = await pool.query(
      `SELECT COUNT(*) as count FROM payments p JOIN users u ON p.user_id = u.user_id WHERE ${where.join(' AND ')}`, params);
    const [payments] = await pool.query(
      `SELECT p.*, u.full_name as user_name, u.email as user_email FROM payments p JOIN users u ON p.user_id = u.user_id
       WHERE ${where.join(' AND ')} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );
    return { payments, total: count, page: parseInt(page), pages: Math.ceil(count / limit) };
  }

  static async updatePaymentStatus(paymentId, status) {
    await pool.query('UPDATE payments SET payment_status=? WHERE payment_id=?', [status, paymentId]);
    return { message: 'Payment status updated' };
  }

  static async refundPayment(paymentId) {
    const [payments] = await pool.query('SELECT * FROM payments WHERE payment_id=?', [paymentId]);
    if (!payments.length) throw { statusCode: 404, message: 'Payment not found' };
    if (payments[0].payment_status !== 'completed') throw { statusCode: 400, message: 'Only completed payments can be refunded' };

    const payment = payments[0];
    const orderId = payment.order_id;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query('UPDATE payments SET payment_status="refunded" WHERE payment_id=?', [paymentId]);

      if (orderId) {
        await connection.query('UPDATE orders SET status="refunded" WHERE order_id=?', [orderId]);

        // Restore product stock
        const [items] = await connection.query(
          'SELECT product_id, quantity FROM order_items WHERE order_id=?', [orderId]
        );
        for (const item of items) {
          await connection.query(
            'UPDATE products SET stock_quantity = stock_quantity + ? WHERE product_id = ?',
            [item.quantity, item.product_id]
          );
        }
      }

      await connection.commit();
      return { message: 'Payment refunded successfully' };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // ===================== SUBSCRIPTIONS =====================

  static async getAllSubscriptions({ page = 1, limit = 20, plan, plan_type, status } = {}) {
    const offset = (page - 1) * limit;
    let where = ['1=1'];
    let params = [];

    const pt = plan || plan_type;
    if (pt) { where.push('s.plan_type = ?'); params.push(pt); }
    if (status) { where.push('s.status = ?'); params.push(status); }

    const [{ count }] = await pool.query(
      `SELECT COUNT(*) as count FROM subscriptions s JOIN users u ON s.user_id = u.user_id WHERE ${where.join(' AND ')}`, params);
    const [subscriptions] = await pool.query(
      `SELECT s.*, u.full_name, u.email FROM subscriptions s JOIN users u ON s.user_id = u.user_id
       WHERE ${where.join(' AND ')} ORDER BY s.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );
    return { subscriptions, total: count, page: parseInt(page), pages: Math.ceil(count / limit) };
  }

  static async updateSubscriptionStatus(subscriptionId, status) {
    await pool.query('UPDATE subscriptions SET status=? WHERE subscription_id=?', [status, subscriptionId]);

    if (status === 'active') {
      await pool.query(
        'UPDATE subscriptions SET start_date=CURDATE(), end_date=DATE_ADD(CURDATE(), INTERVAL 1 MONTH) WHERE subscription_id=?',
        [subscriptionId]);
    }
    return { message: `Subscription ${status} successfully` };
  }

  static async getSubscriptionAnalytics() {
    const [byPlan] = await pool.query('SELECT plan_type, COUNT(*) as count, COALESCE(SUM(price),0) as revenue FROM subscriptions WHERE status="active" GROUP BY plan_type');
    const [[expiringSoon]] = await pool.query('SELECT COUNT(*) as count FROM subscriptions WHERE status="active" AND end_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)');
    const [[totalRev]] = await pool.query('SELECT COALESCE(SUM(price),0) as revenue FROM subscriptions WHERE status="active"');
    return { byPlan, expiringSoon: expiringSoon.count, monthlyRevenue: totalRev.revenue };
  }

  // ===================== FITNESS TRACKING =====================

  static async getFitnessRecords({ page = 1, limit = 20, search, record_type, user_id, from, to } = {}) {
    const offset = (page - 1) * limit;
    let where = ['1=1'];
    let params = [];

    if (user_id) { where.push('f.user_id = ?'); params.push(user_id); }
    if (search) { where.push('u.full_name LIKE ?'); params.push(`%${search}%`); }
    if (record_type) { where.push('f.record_type = ?'); params.push(record_type); }
    if (from) { where.push('f.recorded_date >= ?'); params.push(from); }
    if (to) { where.push('f.recorded_date <= ?'); params.push(to); }

    const [{ count }] = await pool.query(
      `SELECT COUNT(*) as count FROM fitness_progress f JOIN users u ON f.user_id = u.user_id WHERE ${where.join(' AND ')}`, params);
    const [records] = await pool.query(
      `SELECT f.*, u.full_name, u.email FROM fitness_progress f JOIN users u ON f.user_id = u.user_id
       WHERE ${where.join(' AND ')} ORDER BY f.recorded_date DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );
    return { records, total: count, page: parseInt(page), pages: Math.ceil(count / limit) };
  }

  static async getFitnessReport(month, year) {
    const [records] = await pool.query(
      `SELECT f.*, u.full_name, u.email FROM fitness_progress f JOIN users u ON f.user_id = u.user_id
       WHERE MONTH(f.recorded_date)=? AND YEAR(f.recorded_date)=? ORDER BY f.recorded_date`,
      [month, year]);
    return records;
  }

  static async deleteFitnessRecord(id) {
    await pool.query('DELETE FROM fitness_progress WHERE record_id=?', [id]);
    return { message: 'Fitness record deleted' };
  }

  // ===================== NOTIFICATIONS =====================

  static async getNotifications({ page = 1, limit = 20, unreadOnly = false } = {}) {
    const offset = (page - 1) * limit;
    let where = unreadOnly ? 'WHERE is_read = FALSE' : '';
    const [{ count }] = await pool.query(`SELECT COUNT(*) as count FROM notifications ${where}`);
    const [notifications] = await pool.query(
      `SELECT * FROM notifications ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)]
    );
    return { notifications, total: count, page: parseInt(page), pages: Math.ceil(count / limit) };
  }

  static async markNotificationRead(id) {
    await pool.query('UPDATE notifications SET is_read=TRUE WHERE notification_id=?', [id]);
    return { message: 'Notification marked as read' };
  }

  static async markAllNotificationsRead() {
    await pool.query('UPDATE notifications SET is_read=TRUE WHERE is_read=FALSE');
    return { message: 'All notifications marked as read' };
  }

  static async createNotification(type, title, message, relatedId = null, relatedType = null) {
    const [result] = await pool.query(
      'INSERT INTO notifications (type, title, message, related_id, related_type) VALUES (?,?,?,?,?)',
      [type, title, message, relatedId, relatedType]
    );
    return result.insertId;
  }

  static async deleteNotification(id) {
    await pool.query('DELETE FROM notifications WHERE notification_id=?', [id]);
    return { message: 'Notification deleted' };
  }

  // ===================== SETTINGS =====================

  static async getSettings() {
    const [rows] = await pool.query('SELECT setting_key, setting_value FROM settings');
    const settings = {};
    rows.forEach(r => { settings[r.setting_key] = r.setting_value; });
    return settings;
  }

  static async updateSettings(data) {
    for (const [key, value] of Object.entries(data)) {
      await pool.query('INSERT INTO settings (setting_key, setting_value) VALUES (?,?) ON CONFLICT (setting_key) DO UPDATE SET setting_value=?',
        [key, value, value]);
    }
    return { message: 'Settings updated' };
  }

  static async changeAdminPassword(userId, currentPassword, newPassword) {
    const [users] = await pool.query('SELECT password_hash FROM users WHERE user_id=?', [userId]);
    if (!users.length) throw { statusCode: 404, message: 'User not found' };
    const isMatch = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!isMatch) throw { statusCode: 400, message: 'Current password is incorrect' };
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash=? WHERE user_id=?', [hash, userId]);
    return { message: 'Password changed successfully' };
  }

  // ===================== REPORTS =====================

  static async getSalesReport({ from, to, groupBy = 'month' } = {}) {
    let dateFormat = groupBy === 'month' ? '%Y-%m' : '%Y-%m-%d';
    let where = 'WHERE o.status != "cancelled"';
    let params = [];

    if (from) { where += ' AND o.created_at >= ?'; params.push(from); }
    if (to) { where += ' AND o.created_at <= ?'; params.push(to); }

    const [data] = await pool.query(
      `SELECT DATE_FORMAT(o.created_at, '${dateFormat}') as period, COUNT(*) as orders, COALESCE(SUM(o.grand_total),0) as revenue
       FROM orders o ${where} GROUP BY period ORDER BY period`, params);
    return data;
  }

  static async getProductReport({ from, to } = {}) {
    let where = 'WHERE o.status != "cancelled"';
    let params = [];
    if (from) { where += ' AND o.created_at >= ?'; params.push(from); }
    if (to) { where += ' AND o.created_at <= ?'; params.push(to); }

    const [data] = await pool.query(
      `SELECT p.product_id, p.name, SUM(oi.quantity) as units_sold, SUM(oi.total_price) as revenue
       FROM order_items oi JOIN orders o ON oi.order_id = o.order_id JOIN products p ON oi.product_id = p.product_id
       ${where} GROUP BY p.product_id ORDER BY revenue DESC LIMIT 20`, params);
    return data;
  }

  static async getReport({ type, date_from, date_to } = {}) {
    if (type === 'revenue') return this.getSalesReport({ from: date_from, to: date_to });
    if (type === 'products') return this.getProductReport({ from: date_from, to: date_to });
    if (type === 'users') {
      const where = [];
      const params = [];
      if (date_from) { where.push('created_at >= ?'); params.push(date_from); }
      if (date_to) { where.push('created_at <= ?'); params.push(date_to); }
      const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
      const [data] = await pool.query(`SELECT user_id, full_name, email, role, created_at FROM users ${whereClause} ORDER BY created_at DESC`, params);
      return data;
    }
    if (type === 'orders') {
      const where = [];
      const params = [];
      if (date_from) { where.push('created_at >= ?'); params.push(date_from); }
      if (date_to) { where.push('created_at <= ?'); params.push(date_to); }
      const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
      const [data] = await pool.query(`SELECT order_id, order_reference, full_name, status, grand_total as total, created_at FROM orders ${whereClause} ORDER BY created_at DESC`, params);
      return data;
    }
    return [];
  }
}

module.exports = AdminService;
