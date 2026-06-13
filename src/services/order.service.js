const pool = require('../config/database');
const CartService = require('./cart.service');
const { generateOrderReference } = require('../utils/helpers');

class OrderService {
    static async createOrderFromCart(userId, orderData) {
        const { fullName, email, phone, deliveryAddress } = orderData;
        const deliveryFee = 2000;

        const cart = await CartService.getCart(userId);

        if (cart.items.length === 0) {
            throw { statusCode: 400, message: 'Cart is empty' };
        }

        const subtotal = cart.summary.subtotal;
        const freeDeliveryThreshold = 50000;
        const finalDeliveryFee = subtotal >= freeDeliveryThreshold ? 0 : deliveryFee;
        const grandTotal = subtotal + finalDeliveryFee;
        const orderReference = generateOrderReference();

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const [orderResult] = await connection.query(
                `INSERT INTO orders (user_id, order_reference, full_name, email, phone, delivery_address, subtotal, delivery_fee, grand_total, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
                [userId, orderReference, fullName, email, phone, deliveryAddress, subtotal, finalDeliveryFee, grandTotal]
            );
            const orderId = orderResult.insertId;

            for (const item of cart.items) {
                const [product] = await connection.query('SELECT stock_quantity FROM products WHERE product_id = ? FOR UPDATE', [item.product_id]);

                if (product.length === 0 || product[0].stock_quantity < item.quantity) {
                    throw { statusCode: 400, message: `Insufficient stock for product: ${item.name}` };
                }

                await connection.query(
                    `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
                     VALUES (?, ?, ?, ?, ?)`,
                    [orderId, item.product_id, item.quantity, item.price, item.price * item.quantity]
                );

                await connection.query(
                    'UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_id = ?',
                    [item.quantity, item.product_id]
                );
            }

            await connection.query('DELETE FROM cart_items WHERE cart_id = ?', [cart.cartId]);

            await connection.commit();

            return {
                orderId,
                orderReference,
                grandTotal,
                status: 'pending'
            };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async getUserOrders(userId, filters = {}) {
        const { search, status } = filters;
        const page = Math.max(1, parseInt(filters.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(filters.limit, 10) || 10));
        const offset = (page - 1) * limit;
        const params = [userId];
        const countParams = [userId];

        let query = 'SELECT o.* FROM orders o WHERE o.user_id = ?';
        let countQuery = 'SELECT COUNT(*) as total FROM orders o WHERE o.user_id = ?';

        if (status) {
            query += ' AND o.status = ?';
            countQuery += ' AND o.status = ?';
            params.push(status);
            countParams.push(status);
        }

        if (search) {
            query += ' AND (o.order_reference LIKE ? OR o.full_name LIKE ?)';
            countQuery += ' AND (o.order_reference LIKE ? OR o.full_name LIKE ?)';
            const term = `%${search}%`;
            params.push(term, term);
            countParams.push(term, term);
        }

        query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [orders] = await pool.query(query, params);
        const [[{ total }]] = await pool.query(countQuery, countParams);

        // Attach payment info to each order
        for (const order of orders) {
            const [payments] = await pool.query(
                'SELECT payment_method, payment_status, transaction_reference FROM payments WHERE order_id = ? LIMIT 1',
                [order.order_id]
            );
            order.payment = payments.length > 0 ? payments[0] : null;
        }

        return {
            orders,
            total,
            page,
            pages: Math.ceil(total / limit),
        };
    }

    static async getOrderDetails(userId, orderId) {
        const [orders] = await pool.query(
            'SELECT * FROM orders WHERE order_id = ? AND user_id = ?',
            [orderId, userId]
        );

        if (orders.length === 0) {
            throw { statusCode: 404, message: 'Order not found' };
        }

        const order = orders[0];

        const [items] = await pool.query(
            `SELECT oi.*, p.name, p.image_url
             FROM order_items oi
             JOIN products p ON oi.product_id = p.product_id
             WHERE oi.order_id = ?`,
            [orderId]
        );

        order.items = items;

        // Attach payment info
        const [payments] = await pool.query(
            'SELECT * FROM payments WHERE order_id = ? LIMIT 1',
            [orderId]
        );
        order.payment = payments.length > 0 ? payments[0] : null;

        return order;
    }
}

module.exports = OrderService;
