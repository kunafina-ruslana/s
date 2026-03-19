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

// Исправленная CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // ВАЖНО: Всегда устанавливаем заголовки, даже если origin отсутствует
  if (origin) {
    // Разрешаем конкретные origins
    const allowedOrigins = [
      'https://c-production-d50c.up.railway.app',
      'http://localhost:3000'
    ];
    
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (origin.includes('railway.app')) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
  } else {
    // Если origin отсутствует (как в вашем случае), устанавливаем дефолтный
    // Это критически важно для продакшена!
    res.setHeader('Access-Control-Allow-Origin', 'https://c-production-d50c.up.railway.app');
  }
  
  // Всегда устанавливаем остальные заголовки
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  // Логируем каждый запрос
  console.log(`${req.method} ${req.url} - Origin: ${req.headers.origin || 'нет'} - Set ACAO: ${res.getHeader('Access-Control-Allow-Origin')}`);
  
  // НЕМЕДЛЕННО отвечаем на OPTIONS запросы
  if (req.method === 'OPTIONS') {
    console.log('⚠️ OPTIONS запрос обработан');
    return res.status(204).send();
  }
  
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Тестовый маршрут
app.get('/api/test', (req, res) => {
  console.log('✅ Тестовый маршрут');
  res.json({ 
    message: 'Server is working', 
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 8080,
    origin: req.headers.origin || 'нет'
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
app.use((req, res) => {
  console.log('❌ 404:', req.method, req.url);
  res.status(404).json({ message: 'Маршрут не найден' });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('❌ Ошибка:', err);
  res.status(500).json({ message: 'Внутренняя ошибка сервера' });
});

const PORT = process.env.PORT || 8080;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected');
    
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📍 Test: https://s-production-2907.up.railway.app/api/test`);
    });
  } catch (error) {
    console.error('❌ Failed to start:', error);
    process.exit(1);
  }
};

startServer();
