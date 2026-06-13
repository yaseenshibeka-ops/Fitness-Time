const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');

// Initialize app
const app = express();

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disabling for now to allow Chart.js CDN and inline scripts easily
}));

// CORS Configuration
app.use(cors());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Logging Middleware
app.use(morgan('dev'));

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files Setup - try multiple locations for the Vue build
// Static Files Setup - serve Vue build first, then legacy public
const clientDistPath = path.join(__dirname, '../client/dist');
const apiPublicPath = path.join(__dirname, '../api/public');
const legacyPublicPath = path.join(__dirname, '../public');

if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
} else if (fs.existsSync(apiPublicPath)) {
    app.use(express.static(apiPublicPath));
}

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(legacyPublicPath));

// Routes
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const paymentRoutes = require('./routes/payment.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const fitnessRoutes = require('./routes/fitness.routes');
const adminRoutes = require('./routes/admin.routes');
const userRoutes = require('./routes/user.routes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/fitness', fitnessRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// Temporary default route for API
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'FitTrack Rwanda API is running' });
});

// SPA fallback - serve Vue app for all non-API, non-file routes
app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
        return res.status(404).json({ status: 'error', message: 'Not found' });
    }
    
    if (fs.existsSync(path.join(clientDistPath, 'index.html'))) {
        res.sendFile(path.join(clientDistPath, 'index.html'));
    } else if (fs.existsSync(path.join(apiPublicPath, 'index.html'))) {
        res.sendFile(path.join(apiPublicPath, 'index.html'));
    } else {
        res.sendFile(path.join(legacyPublicPath, 'index.html'));
    }
});

// Centralized Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

module.exports = app;
