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

            // 1. Create order
            const [orderResult] = await connection.query(
                `INSERT INTO orders (user_id, order_reference, full_name, email, phone, delivery_address, subtotal, delivery_fee, grand_total, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
                [userId, orderReference, fullName, email, phone, deliveryAddress, subtotal, finalDeliveryFee, grandTotal]
            );
            const orderId = orderResult.insertId;

            // 2. Lock all relevant products in one query to prevent race conditions
            const productIds = cart.items.map(item => item.product_id);
            const placeholders = productIds.map(() => '?').join(',');
            const [products] = await connection.query(
                `SELECT product_id, stock_quantity FROM products WHERE product_id IN (${placeholders}) FOR UPDATE`,
                productIds
            );

            // Build a map for fast lookup
            const stockMap = {};
            products.forEach(p => { stockMap[p.product_id] = p.stock_quantity; });

            // 3. Validate stock and insert order items
            for (const item of cart.items) {
                const currentStock = stockMap[item.product_id];
                if (currentStock === undefined || currentStock < item.quantity) {
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

            // 4. Clear the cart
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

        let baseWhere = 'WHERE o.user_id = ?';

        if (status) {
            baseWhere += ' AND o.status = ?';
            params.push(status);
            countParams.push(status);
        }

        if (search) {
            baseWhere += ' AND (o.order_reference LIKE ? OR o.full_name LIKE ?)';
            const term = `%${search}%`;
            params.push(term, term);
            countParams.push(term, term);
        }

        // Single query with LEFT JOIN to fetch orders + payment info — eliminates N+1 problem
        const query = `
            SELECT o.*, 
                   pay.payment_method, pay.payment_status, pay.transaction_reference
            FROM orders o
            LEFT JOIN payments pay ON pay.order_id = o.order_id
            ${baseWhere}
            ORDER BY o.created_at DESC
            LIMIT ? OFFSET ?
        `;
        params.push(limit, offset);

        const countQuery = `SELECT COUNT(*) as total FROM orders o ${baseWhere}`;

        const [rows] = await pool.query(query, params);
        const [[{ total }]] = await pool.query(countQuery, countParams);

        // Attach payment as a nested object for API compatibility
        const orders = rows.map(row => {
            const { payment_method, payment_status, transaction_reference, ...order } = row;
            order.payment = payment_method
                ? { payment_method, payment_status, transaction_reference }
                : null;
            return order;
        });

        return {
            orders,
            total,
            page,
            pages: Math.ceil(total / limit),
        };
    }

    static async getOrderDetails(userId, orderId) {
        // Fetch order + payment in a single query
        const [orders] = await pool.query(
            `SELECT o.*, 
                    pay.payment_id, pay.payment_method, pay.payment_status, 
                    pay.transaction_reference, pay.phone_number as pay_phone, 
                    pay.amount as pay_amount, pay.payment_date
             FROM orders o
             LEFT JOIN payments pay ON pay.order_id = o.order_id
             WHERE o.order_id = ? AND o.user_id = ?`,
            [orderId, userId]
        );

        if (orders.length === 0) {
            throw { statusCode: 404, message: 'Order not found' };
        }

        const row = orders[0];
        const { payment_id, payment_method, payment_status, transaction_reference, pay_phone, pay_amount, payment_date, ...order } = row;
        order.payment = payment_method
            ? { payment_id, payment_method, payment_status, transaction_reference, phone_number: pay_phone, amount: pay_amount, payment_date }
            : null;

        const [items] = await pool.query(
            `SELECT oi.*, p.name, p.image_url
             FROM order_items oi
             JOIN products p ON oi.product_id = p.product_id
             WHERE oi.order_id = ?`,
            [orderId]
        );

        order.items = items;

        return order;
    }
}

module.exports = OrderService;
