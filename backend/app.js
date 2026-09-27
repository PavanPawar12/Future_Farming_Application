const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

const { notFound, errorHandler } = require('./middleware/error');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const addressRoutes = require('./routes/addresses');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(hpp());

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({ origin: [clientUrl, 'http://localhost:5173'], credentials: true }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 400 });
app.use('/api', limiter);
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 60 });
app.use('/api/auth', authLimiter);

app.get('/api/health', (req, res) => res.json({ success: true, message: 'Farm API running' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
// alias /api/users -> profile helpers
app.use('/api/users', authRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
