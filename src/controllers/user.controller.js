const pool = require('../config/database');
const bcrypt = require('bcryptjs');

// Profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone, address, dateOfBirth, gender, heightCm, avatarUrl } = req.body;
    await pool.query(
      'UPDATE users SET full_name=?, phone=?, address=?, date_of_birth=?, gender=?, height_cm=?, avatar_url=? WHERE user_id=?',
      [fullName, phone, address, dateOfBirth, gender, heightCm, avatarUrl, req.user.userId]
    );
    const [users] = await pool.query('SELECT user_id, full_name, email, phone, address, role, avatar_url, date_of_birth, gender, height_cm, created_at FROM users WHERE user_id=?', [req.user.userId]);
    res.json({ status: 'success', data: { user: users[0] } });
  } catch (e) { next(e); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const [users] = await pool.query('SELECT password_hash FROM users WHERE user_id=?', [req.user.userId]);
    const isMatch = await bcrypt.compare(req.body.currentPassword, users[0].password_hash);
    if (!isMatch) return res.status(400).json({ status: 'error', message: 'Current password is incorrect' });
    const hash = await bcrypt.hash(req.body.newPassword, 10);
    await pool.query('UPDATE users SET password_hash=? WHERE user_id=?', [hash, req.user.userId]);
    res.json({ status: 'success', data: { message: 'Password changed' } });
  } catch (e) { next(e); }
};

// Wishlist
exports.getWishlist = async (req, res, next) => {
  try {
    const [items] = await pool.query(
      'SELECT w.*, p.name, p.price, p.image_url, p.stock_quantity FROM wishlist w JOIN products p ON w.product_id = p.product_id WHERE w.user_id=? ORDER BY w.created_at DESC',
      [req.user.userId]);
    res.json({ status: 'success', data: { items } });
  } catch (e) { next(e); }
};

exports.addToWishlist = async (req, res, next) => {
  try {
    await pool.query('INSERT IGNORE INTO wishlist (user_id, product_id) VALUES (?,?)', [req.user.userId, req.body.productId]);
    res.status(201).json({ status: 'success', data: { message: 'Added to wishlist' } });
  } catch (e) { next(e); }
};

exports.removeFromWishlist = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM wishlist WHERE wishlist_id=? AND user_id=?', [req.params.id, req.user.userId]);
    res.json({ status: 'success', data: { message: 'Removed from wishlist' } });
  } catch (e) { next(e); }
};

exports.moveToCart = async (req, res, next) => {
  try {
    const [wishItems] = await pool.query('SELECT w.* FROM wishlist w WHERE w.wishlist_id=? AND w.user_id=?', [req.params.id, req.user.userId]);
    if (!wishItems.length) return res.status(404).json({ status: 'error', message: 'Wishlist item not found' });
    let [carts] = await pool.query('SELECT cart_id FROM carts WHERE user_id=?', [req.user.userId]);
    if (!carts.length) {
      const [r] = await pool.query('INSERT INTO carts (user_id) VALUES (?)', [req.user.userId]);
      carts = [{ cart_id: r.insertId }];
    }
    await pool.query('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?,?,1) ON DUPLICATE KEY UPDATE quantity=quantity+1', [carts[0].cart_id, wishItems[0].product_id]);
    await pool.query('DELETE FROM wishlist WHERE wishlist_id=?', [req.params.id]);
    res.json({ status: 'success', data: { message: 'Moved to cart' } });
  } catch (e) { next(e); }
};

// Workouts
exports.getWorkouts = async (req, res, next) => {
  try {
    const { from, to, limit = 50, offset = 0 } = req.query;
    let sql = 'SELECT * FROM workout_history WHERE user_id=?';
    const params = [req.user.userId];
    if (from) { sql += ' AND workout_date>=?'; params.push(from); }
    if (to) { sql += ' AND workout_date<=?'; params.push(to); }
    sql += ' ORDER BY workout_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    const [workouts] = await pool.query(sql, params);
    res.json({ status: 'success', data: { workouts } });
  } catch (e) { next(e); }
};

exports.addWorkout = async (req, res, next) => {
  try {
    const { workoutType, durationMinutes, caloriesBurned, notes, workoutDate } = req.body;
    const [r] = await pool.query(
      'INSERT INTO workout_history (user_id, workout_type, duration_minutes, calories_burned, notes, workout_date) VALUES (?,?,?,?,?,?)',
      [req.user.userId, workoutType, durationMinutes, caloriesBurned || 0, notes, workoutDate]);
    res.status(201).json({ status: 'success', data: { workoutId: r.insertId, message: 'Workout logged' } });
  } catch (e) { next(e); }
};

exports.updateWorkout = async (req, res, next) => {
  try {
    const { workoutType, durationMinutes, caloriesBurned, notes, workoutDate } = req.body;
    await pool.query(
      'UPDATE workout_history SET workout_type=?, duration_minutes=?, calories_burned=?, notes=?, workout_date=? WHERE workout_id=? AND user_id=?',
      [workoutType, durationMinutes, caloriesBurned, notes, workoutDate, req.params.id, req.user.userId]);
    res.json({ status: 'success', data: { message: 'Workout updated' } });
  } catch (e) { next(e); }
};

exports.deleteWorkout = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM workout_history WHERE workout_id=? AND user_id=?', [req.params.id, req.user.userId]);
    res.json({ status: 'success', data: { message: 'Workout deleted' } });
  } catch (e) { next(e); }
};

// Goals
exports.getGoals = async (req, res, next) => {
  try {
    const [goals] = await pool.query('SELECT * FROM fitness_goals WHERE user_id=? ORDER BY deadline ASC', [req.user.userId]);
    res.json({ status: 'success', data: { goals } });
  } catch (e) { next(e); }
};

exports.updateGoal = async (req, res, next) => {
  try {
    const { goalType, targetValue, currentValue, unit, deadline, status } = req.body;
    await pool.query(
      'UPDATE fitness_goals SET goal_type=?, target_value=?, current_value=?, unit=?, deadline=?, status=? WHERE goal_id=? AND user_id=?',
      [goalType, targetValue, currentValue, unit, deadline, status, req.params.id, req.user.userId]);
    res.json({ status: 'success', data: { message: 'Goal updated' } });
  } catch (e) { next(e); }
};

exports.deleteGoal = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM fitness_goals WHERE goal_id=? AND user_id=?', [req.params.id, req.user.userId]);
    res.json({ status: 'success', data: { message: 'Goal deleted' } });
  } catch (e) { next(e); }
};

// Notifications
exports.getUserNotifications = async (req, res, next) => {
  try {
    const { unreadOnly, limit = 20, offset = 0 } = req.query;
    let sql = 'SELECT * FROM user_notifications WHERE user_id=?';
    const params = [req.user.userId];
    if (unreadOnly === 'true') { sql += ' AND is_read=FALSE'; }
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    const [notifications] = await pool.query(sql, params);
    res.json({ status: 'success', data: { notifications } });
  } catch (e) { next(e); }
};

exports.markRead = async (req, res, next) => {
  try {
    await pool.query('UPDATE user_notifications SET is_read=TRUE WHERE notification_id=? AND user_id=?', [req.params.id, req.user.userId]);
    res.json({ status: 'success', data: { message: 'Marked as read' } });
  } catch (e) { next(e); }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await pool.query('UPDATE user_notifications SET is_read=TRUE WHERE user_id=? AND is_read=FALSE', [req.user.userId]);
    res.json({ status: 'success', data: { message: 'All marked as read' } });
  } catch (e) { next(e); }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM user_notifications WHERE notification_id=? AND user_id=?', [req.params.id, req.user.userId]);
    res.json({ status: 'success', data: { message: 'Notification deleted' } });
  } catch (e) { next(e); }
};

// Settings
exports.getUserSettings = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM user_settings WHERE user_id=?', [req.user.userId]);
    const defaults = { theme: 'system', email_notifications: true, push_notifications: true, privacy_share_progress: false };
    if (rows.length) {
      const s = rows[0];
      defaults.theme = s.theme; defaults.email_notifications = Boolean(s.email_notifications);
      defaults.push_notifications = Boolean(s.push_notifications); defaults.privacy_share_progress = Boolean(s.privacy_share_progress);
    }
    res.json({ status: 'success', data: { settings: defaults } });
  } catch (e) { next(e); }
};

exports.updateUserSettings = async (req, res, next) => {
  try {
    const { theme, emailNotifications, pushNotifications, privacyShareProgress } = req.body;
    await pool.query(
      'INSERT INTO user_settings (user_id, theme, email_notifications, push_notifications, privacy_share_progress) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE theme=?, email_notifications=?, push_notifications=?, privacy_share_progress=?',
      [req.user.userId, theme, emailNotifications, pushNotifications, privacyShareProgress, theme, emailNotifications, pushNotifications, privacyShareProgress]);
    res.json({ status: 'success', data: { message: 'Settings saved' } });
  } catch (e) { next(e); }
};
