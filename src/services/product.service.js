const pool = require('../config/database');

class ProductService {
    static async getAllCategories() {
        const [categories] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
        return categories;
    }

    static async getAllProducts(filters = {}) {
        let query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.category_id WHERE p.is_active = 1';
        const params = [];

        if (filters.category_id) {
            query += ' AND p.category_id = ?';
            params.push(filters.category_id);
        }

        if (filters.search) {
            query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm);
        }

        query += ' ORDER BY p.created_at DESC';

        if (filters.limit) {
            query += ' LIMIT ?';
            params.push(parseInt(filters.limit, 10));
        }

        const [products] = await pool.query(query, params);
        return products;
    }

    static async getFeaturedProducts(limit = 6) {
        const [products] = await pool.query(
            'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.category_id WHERE p.is_active = 1 ORDER BY p.created_at DESC LIMIT ?',
            [limit]
        );
        return products;
    }

    static async getProductById(productId) {
        const [products] = await pool.query(
            'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.category_id WHERE p.product_id = ? AND p.is_active = 1',
            [productId]
        );

        if (products.length === 0) {
            throw { statusCode: 404, message: 'Product not found' };
        }

        const product = products[0];

        // Attach average rating
        const [[{ avgRating, reviewCount }]] = await pool.query(
            'SELECT COALESCE(AVG(rating), 0) as avgRating, COUNT(*) as reviewCount FROM product_reviews WHERE product_id = ?',
            [productId]
        );
        product.rating = parseFloat(avgRating.toFixed(1));
        product.review_count = reviewCount;

        return product;
    }

    static async getProductReviews(productId, sortBy = 'recent') {
        let orderClause = 'ORDER BY pr.created_at DESC';
        if (sortBy === 'highest') orderClause = 'ORDER BY pr.rating DESC, pr.created_at DESC';
        if (sortBy === 'lowest') orderClause = 'ORDER BY pr.rating ASC, pr.created_at DESC';

        const [reviews] = await pool.query(
            `SELECT pr.*, u.full_name as name
             FROM product_reviews pr
             JOIN users u ON pr.user_id = u.user_id
             WHERE pr.product_id = ?
             ${orderClause}`,
            [productId]
        );
        return reviews;
    }

    static async addProductReview(userId, productId, rating, reviewText) {
        // Check product exists
        const [products] = await pool.query('SELECT product_id FROM products WHERE product_id = ? AND is_active = 1', [productId]);
        if (products.length === 0) throw { statusCode: 404, message: 'Product not found' };

        // Check if already reviewed
        const [existing] = await pool.query('SELECT review_id FROM product_reviews WHERE user_id = ? AND product_id = ?', [userId, productId]);
        if (existing.length > 0) throw { statusCode: 400, message: 'You have already reviewed this product' };

        // Check if user purchased this product (for verified badge)
        const [purchases] = await pool.query(
            `SELECT 1 FROM orders o
             JOIN order_items oi ON o.order_id = oi.order_id
             WHERE o.user_id = ? AND oi.product_id = ? AND o.status IN ('delivered', 'shipped', 'processing')`,
            [userId, productId]
        );
        const isVerified = purchases.length > 0;

        const [result] = await pool.query(
            'INSERT INTO product_reviews (product_id, user_id, rating, review_text, is_verified_purchase) VALUES (?, ?, ?, ?, ?)',
            [productId, userId, rating, reviewText, isVerified]
        );

        return { reviewId: result.insertId, isVerified };
    }
}

module.exports = ProductService;
