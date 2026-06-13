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
const distPaths = [
  path.join(__dirname, '../api/public'),
  path.join(__dirname, '../client/dist'),
  path.join(process.cwd(), 'api/public'),
  path.join(process.cwd(), 'client/dist'),
];
for (const p of distPaths) {
  if (fs.existsSync(p)) {
    app.use(express.static(p));
  }
}
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// Keep legacy public for backward compat
app.use(express.static(path.join(__dirname, '../public')));

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
    // Try sending a static file; fallback to index.html
    const indexPaths = [
      path.join(__dirname, '../api/public/index.html'),
      path.join(__dirname, '../client/dist/index.html'),
      path.join(process.cwd(), 'api/public/index.html'),
      path.join(process.cwd(), 'client/dist/index.html'),
    ];
    const indexPath = indexPaths.find(p => fs.existsSync(p));
    res.sendFile(indexPath || path.join(__dirname, '../client/dist/index.html'));
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
