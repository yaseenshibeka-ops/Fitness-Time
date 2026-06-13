const SubscriptionService = require('../services/subscription.service');

exports.createSubscription = async (req, res, next) => {
    try {
        const result = await SubscriptionService.createSubscription(req.user.userId, req.body.planType);
        res.status(201).json({
            status: 'success',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

exports.getCurrentSubscription = async (req, res, next) => {
    try {
        const subscription = await SubscriptionService.getUserSubscription(req.user.userId);
        res.status(200).json({
            status: 'success',
            data: { subscription }
        });
    } catch (error) {
        next(error);
    }
};

exports.cancelSubscription = async (req, res, next) => {
    try {
        const result = await SubscriptionService.cancelSubscription(req.user.userId, req.params.id);
        res.status(200).json({
            status: 'success',
            data: result
        });
    } catch (error) {
        next(error);
    }
};
