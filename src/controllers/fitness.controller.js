const FitnessService = require('../services/fitness.service');

exports.recordProgress = async (req, res, next) => {
    try {
        const result = await FitnessService.recordProgress(req.user.userId, req.body);
        res.status(201).json({ status: 'success', data: result });
    } catch (error) {
        next(error);
    }
};

exports.getProgressHistory = async (req, res, next) => {
    try {
        const history = await FitnessService.getProgressHistory(req.user.userId, req.query);
        res.status(200).json({ status: 'success', data: { history } });
    } catch (error) {
        next(error);
    }
};

exports.setGoal = async (req, res, next) => {
    try {
        const result = await FitnessService.setGoal(req.user.userId, req.body);
        res.status(201).json({ status: 'success', data: result });
    } catch (error) {
        next(error);
    }
};

exports.getGoals = async (req, res, next) => {
    try {
        const goals = await FitnessService.getGoals(req.user.userId);
        res.status(200).json({ status: 'success', data: { goals } });
    } catch (error) {
        next(error);
    }
};

exports.deleteProgress = async (req, res, next) => {
    try {
        const result = await FitnessService.deleteProgress(req.params.id, req.user.userId);
        res.json({ status: 'success', data: result });
    } catch (error) { next(error); }
};

exports.getDashboardStats = async (req, res, next) => {
    try {
        const stats = await FitnessService.getDashboardStats(req.user.userId);
        res.status(200).json({ status: 'success', data: { stats } });
    } catch (error) {
        next(error);
    }
};
