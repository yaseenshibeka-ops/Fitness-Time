const RecommendationService = require('../services/recommendation.service');

exports.getWorkoutRecommendations = async (req, res, next) => {
    try {
        const recommendations = await RecommendationService.getWorkoutRecommendations(req.user.userId);
        res.status(200).json({ status: 'success', data: { recommendations } });
    } catch (error) {
        next(error);
    }
};

exports.getProductRecommendations = async (req, res, next) => {
    try {
        const recommendations = await RecommendationService.getProductRecommendations(req.user.userId);
        res.status(200).json({ status: 'success', data: { recommendations } });
    } catch (error) {
        next(error);
    }
};

exports.getProgressInsights = async (req, res, next) => {
    try {
        const insights = await RecommendationService.getProgressInsights(req.user.userId);
        res.status(200).json({ status: 'success', data: { insights } });
    } catch (error) {
        next(error);
    }
};
