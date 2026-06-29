const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const corsOptions = require('./config/cors');
const { requestLogger } = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const institutionRoutes = require('./routes/institutionRoutes');
const credentialRoutes = require('./routes/credentialRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { error } = require('./utils/apiResponse');
const securityRoutes = require('./routes/securityRoutes');

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(requestLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/credentials', credentialRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/security', securityRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.use((_req, res) => {
  error(res, 'Route not found', 404);
});

app.use(errorHandler);

module.exports = app;
