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

// Логируем все входящие запросы
app.use((req, res, next) => {
  console.log('=== ВХОДЯЩИЙ ЗАПРОС ===');
  console.log('Метод:', req.method);
  console.log('URL:', req.url);
  console.log('Origin:', req.headers.origin);
  console.log('Host:', req.headers.host);
  console.log('User-Agent:', req.headers['user-agent']);
  console.log('========================');
  next();
});

// Самая простая настройка CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Разрешаем конкретные origins
  const allowedOrigins = [
    'https://c-production-d50c.up.railway.app',
    'http://localhost:3000'
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // Если нет origin (например, запрос с сервера), разрешаем
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Если это preflight запрос
  if (req.method === 'OPTIONS') {
    console.log('⚠️ OPTIONS запрос обработан');
    return res.status(204).send();
  }
  
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Тестовый маршрут (должен быть ДО других маршрутов)
app.get('/api/test', (req, res) => {
  console.log('✅ Тестовый маршрут вызван');
  res.json({ 
    message: 'Server is working', 
    timestamp: new Date().toISOString(),
    headers: {
      origin: req.headers.origin,
      host: req.headers.host
    }
  });
});

// Маршруты API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Обработка 404
app.use((req, res, next) => {
  console.log('❌ Маршрут не найден:', req.method, req.url);
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
  console.error('❌ Серверная ошибка:', err);
  console.error('Stack:', err.stack);
  
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
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

startServer();
