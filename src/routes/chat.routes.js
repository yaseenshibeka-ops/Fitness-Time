const express = require('express');
const { body } = require('express-validator');
const chatController = require('../controllers/chat.controller');
const { validate } = require('../middleware/validator');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/history', chatController.getHistory);

router.post('/message',
    [
        body('message').notEmpty().trim().isLength({ max: 2000 }).withMessage('Message is required (max 2000 characters)')
    ],
    validate,
    chatController.sendMessage
);

router.get('/admin/stats', authorizeAdmin, chatController.getAdminStats);

module.exports = router;
