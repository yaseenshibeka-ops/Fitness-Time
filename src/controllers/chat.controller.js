const ChatService = require('../services/chat.service');

exports.sendMessage = async (req, res, next) => {
    try {
        const result = await ChatService.sendMessage(req.user.userId, req.body.message);
        res.status(200).json({ status: 'success', data: result });
    } catch (error) {
        next(error);
    }
};

exports.getHistory = async (req, res, next) => {
    try {
        const messages = await ChatService.getHistory(req.user.userId, req.query);
        res.status(200).json({ status: 'success', data: { messages } });
    } catch (error) {
        next(error);
    }
};

exports.getAdminStats = async (req, res, next) => {
    try {
        const stats = await ChatService.getAdminStats();
        res.status(200).json({ status: 'success', data: { stats } });
    } catch (error) {
        next(error);
    }
};
