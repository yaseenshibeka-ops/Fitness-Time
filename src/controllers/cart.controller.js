const CartService = require('../services/cart.service');

exports.getCart = async (req, res, next) => {
    try {
        const cart = await CartService.getCart(req.user.userId);
        res.status(200).json({ status: 'success', data: { cart } });
    } catch (error) {
        next(error);
    }
};

exports.addItem = async (req, res, next) => {
    try {
        const { productId, quantity } = req.body;
        const cart = await CartService.addItemToCart(req.user.userId, productId, quantity);
        res.status(200).json({ status: 'success', message: 'Item added to cart', data: { cart } });
    } catch (error) {
        next(error);
    }
};

exports.updateItem = async (req, res, next) => {
    try {
        const { quantity } = req.body;
        const cart = await CartService.updateItemQuantity(req.user.userId, req.params.itemId, quantity);
        res.status(200).json({ status: 'success', message: 'Cart updated', data: { cart } });
    } catch (error) {
        next(error);
    }
};

exports.removeItem = async (req, res, next) => {
    try {
        const cart = await CartService.removeItemFromCart(req.user.userId, req.params.itemId);
        res.status(200).json({ status: 'success', message: 'Item removed', data: { cart } });
    } catch (error) {
        next(error);
    }
};

exports.clearCart = async (req, res, next) => {
    try {
        await CartService.clearCart(req.user.userId);
        res.status(200).json({ status: 'success', message: 'Cart cleared successfully', data: { cart: { items: [], summary: { subtotal: 0, totalItems: 0 } } } });
    } catch (error) {
        next(error);
    }
};
