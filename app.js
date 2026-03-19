import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import exerciseRoutes from './routes/exerciseRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();

// Настройка CORS - максимально простая и надежная версия
const allowedOrigins = [
  'http://localhost:3000',
  'https://c-production-d50c.up.railway.app',
  'https://s-production-2907.up.railway.app'
];

// Сначала обрабатываем все OPTIONS запросы
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Устанавливаем заголовки для всех запросов
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://c-production-d50c.up.railway.app');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Если это OPTIONS запрос - сразу отправляем ответ
  if (req.method === 'OPTIONS') {
    return res.status(204).send();
  }
  
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Маршруты API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Тестовый маршрут
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is working', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    cors: {
      origin: req.headers.origin,
      method: req.method
    }
  });
});

// Обработка 404
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ 
      message: 'API маршрут не найден',
      path: req.originalUrl,
      method: req.method
    });
  }
  res.status(404).json({ message: 'Страница не найдена' });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  console.error('Error stack:', err.stack);
  
  res.status(500).json({ 
    message: 'Внутренняя ошибка сервера',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL database connected successfully');
    
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📍 Test API: https://s-production-2907.up.railway.app/api/test`);
      console.log(`📍 CORS allowed origins:`, allowedOrigins);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

startServer();
