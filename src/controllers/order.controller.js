const OrderService = require('../services/order.service');

exports.checkout = async (req, res, next) => {
    try {
        const order = await OrderService.createOrderFromCart(req.user.userId, req.body);
        res.status(201).json({
            status: 'success',
            message: 'Order created successfully',
            data: { order }
        });
    } catch (error) {
        next(error);
    }
};

exports.getOrders = async (req, res, next) => {
    try {
        const { search, status, page, limit } = req.query;
        const result = await OrderService.getUserOrders(req.user.userId, { search, status, page, limit });
        res.status(200).json({
            status: 'success',
            results: result.orders.length,
            data: {
                orders: result.orders,
                total: result.total,
                page: result.page,
                pages: result.pages,
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getOrderDetails = async (req, res, next) => {
    try {
        const order = await OrderService.getOrderDetails(req.user.userId, req.params.orderId);
        res.status(200).json({
            status: 'success',
            data: { order }
        });
    } catch (error) {
        next(error);
    }
};
