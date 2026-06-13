const pool = require('../config/database');

class CartService {
    static async getCart(userId) {
        // Ensure cart exists
        let [carts] = await pool.query('SELECT cart_id FROM carts WHERE user_id = ?', [userId]);
        let cartId;

        if (carts.length === 0) {
            const [result] = await pool.query('INSERT INTO carts (user_id) VALUES (?)', [userId]);
            cartId = result.insertId;
        } else {
            cartId = carts[0].cart_id;
        }

        // Get cart items
        const [items] = await pool.query(
            `SELECT ci.cart_item_id, ci.quantity, p.product_id, p.name, p.price, p.image_url 
             FROM cart_items ci 
             JOIN products p ON ci.product_id = p.product_id 
             WHERE ci.cart_id = ?`,
            [cartId]
        );

        let subtotal = 0;
        items.forEach(item => {
            subtotal += item.price * item.quantity;
        });

        return {
            cartId,
            items,
            summary: {
                subtotal,
                totalItems: items.reduce((acc, item) => acc + item.quantity, 0)
            }
        };
    }

    static async addItemToCart(userId, productId, quantity = 1) {
        let [carts] = await pool.query('SELECT cart_id FROM carts WHERE user_id = ?', [userId]);
        let cartId;

        if (carts.length === 0) {
            const [result] = await pool.query('INSERT INTO carts (user_id) VALUES (?)', [userId]);
            cartId = result.insertId;
        } else {
            cartId = carts[0].cart_id;
        }

        // Check if product exists and has stock
        const [products] = await pool.query('SELECT stock_quantity FROM products WHERE product_id = ?', [productId]);
        if (products.length === 0) throw { statusCode: 404, message: 'Product not found' };
        if (products[0].stock_quantity < quantity) throw { statusCode: 400, message: 'Insufficient stock' };

        // Check if item already in cart
        const [existingItems] = await pool.query('SELECT cart_item_id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?', [cartId, productId]);

        if (existingItems.length > 0) {
            // Update quantity
            const newQty = existingItems[0].quantity + quantity;
            if (products[0].stock_quantity < newQty) throw { statusCode: 400, message: 'Insufficient stock for requested quantity' };
            await pool.query('UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?', [newQty, existingItems[0].cart_item_id]);
        } else {
            // Insert new item
            await pool.query('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)', [cartId, productId, quantity]);
        }

        return this.getCart(userId);
    }

    static async updateItemQuantity(userId, itemId, quantity) {
        if (quantity <= 0) {
            return this.removeItemFromCart(userId, itemId);
        }

        // Verify ownership and stock
        const [items] = await pool.query(
            `SELECT ci.cart_item_id, p.stock_quantity 
             FROM cart_items ci 
             JOIN carts c ON ci.cart_id = c.cart_id 
             JOIN products p ON ci.product_id = p.product_id
             WHERE ci.cart_item_id = ? AND c.user_id = ?`,
            [itemId, userId]
        );

        if (items.length === 0) throw { statusCode: 404, message: 'Cart item not found' };
        if (items[0].stock_quantity < quantity) throw { statusCode: 400, message: 'Insufficient stock' };

        await pool.query('UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?', [quantity, itemId]);

        return this.getCart(userId);
    }

    static async removeItemFromCart(userId, itemId) {
        // Ensure the item belongs to the user's cart
        const [items] = await pool.query(
            `SELECT ci.cart_item_id FROM cart_items ci 
             JOIN carts c ON ci.cart_id = c.cart_id 
             WHERE ci.cart_item_id = ? AND c.user_id = ?`,
            [itemId, userId]
        );

        if (items.length > 0) {
            await pool.query('DELETE FROM cart_items WHERE cart_item_id = ?', [itemId]);
        }

        return this.getCart(userId);
    }

    static async clearCart(userId) {
        const [carts] = await pool.query('SELECT cart_id FROM carts WHERE user_id = ?', [userId]);
        if (carts.length > 0) {
            await pool.query('DELETE FROM cart_items WHERE cart_id = ?', [carts[0].cart_id]);
        }
    }
}

module.exports = CartService;
