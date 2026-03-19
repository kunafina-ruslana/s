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

// Настройка CORS
const allowedOrigins = [
  'http://localhost:3000',
  'https://c-production-a07b.up.railway.app',
  'https://c-production-d50c.up.railway.app',
  'https://s-production-fd8f.up.railway.app',
  'https://s-production-975f.up.railway.app'
],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

app.options('*', cors());

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'Запросы с этого домена не разрешены политикой CORS.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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
    env: process.env.NODE_ENV 
  });
});

// ВАЖНО: Правильная обработка 404 - используем middleware функцию, а не '*'
// Этот middleware будет вызван, если ни один из предыдущих маршрутов не подошел
app.use((req, res, next) => {
  // Проверяем, начинается ли путь с /api
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ 
      message: 'API маршрут не найден',
      path: req.originalUrl,
      method: req.method
    });
  }
  // Для не-API запросов
  res.status(404).json({ message: 'Страница не найдена' });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  console.error('Error stack:', err.stack);
  
  // Проверяем, является ли ошибка CORS-related
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ 
      message: 'Ошибка CORS: запрос с этого домена не разрешен',
      error: err.message 
    });
  }
  
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
      console.log(`📍 Test API: https://s-production-975f.up.railway.app/api/test`);
      console.log(`📍 CORS allowed origins:`, allowedOrigins);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

startServer();
