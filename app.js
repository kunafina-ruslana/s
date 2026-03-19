// server.js
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

// Настройка CORS - разрешаем запросы с вашего клиентского домена
const allowedOrigins = [
  'http://localhost:3000',
  'https://c-production-a07b.up.railway.app', // Ваш клиентский домен
  'https://s-production-2907.up.railway.app'  // Серверный домен (на всякий случай)
];

app.use(cors({
  origin: function(origin, callback) {
    // Разрешаем запросы без origin (например, мобильные приложения)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'Запросы с этого домена не разрешены политикой CORS.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // Разрешаем отправку куки и заголовков авторизации
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Для простоты можно использовать более простую настройку (не для продакшена)
// app.use(cors({
//   origin: '*',
//   credentials: true
// }));

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
  res.json({ message: 'Server is working', timestamp: new Date().toISOString() });
});

// Обработка 404 для API маршрутов
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    message: 'API маршрут не найден',
    path: req.originalUrl,
    method: req.method
  });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Server error:', err);
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
    
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📍 Test API: http://localhost:${PORT}/api/test`);
      console.log(`📍 CORS allowed origins:`, allowedOrigins);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

startServer();
