import express from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcrypt';
import { authenticate } from '../middleware/authMiddleware.js';
import { User } from '../models/index.js';
import {
  getProfile,
  updateProfile,
  getProgress,
  getMeasurements,
  addMeasurement,
  getFavorites,
  addFavorite,
  removeFavorite
} from '../controllers/userController.js';

const router = express.Router();

const profileValidation = [
  body('firstName')
    .optional().trim()
    .isLength({ min: 2 }).withMessage('Имя должно содержать минимум 2 символа')
    .isLength({ max: 50 }).withMessage('Имя не должно превышать 50 символов')
    .matches(/^[A-Za-zА-Яа-я\s-]+$/).withMessage('Имя может содержать только буквы, пробелы и дефисы'),
  
  body('lastName')
    .optional().trim()
    .isLength({ min: 2 }).withMessage('Фамилия должна содержать минимум 2 символа')
    .isLength({ max: 50 }).withMessage('Фамилия не должна превышать 50 символов')
    .matches(/^[A-Za-zА-Яа-я\s-]+$/).withMessage('Фамилия может содержать только буквы, пробелы и дефисы'),
  
  body('weight')
    .optional()
    .isFloat({ min: 20, max: 300 }).withMessage('Вес должен быть от 20 до 300 кг'),
  
  body('height')
    .optional()
    .isFloat({ min: 100, max: 250 }).withMessage('Рост должен быть от 100 до 250 см'),
  
  body('chest')
    .optional()
    .isFloat({ min: 50, max: 200 }).withMessage('Обхват груди должен быть от 50 до 200 см'),
  
  body('waist')
    .optional()
    .isFloat({ min: 40, max: 200 }).withMessage('Обхват талии должен быть от 40 до 200 см'),
  
  body('hips')
    .optional()
    .isFloat({ min: 50, max: 200 }).withMessage('Обхват бедер должен быть от 50 до 200 см'),
  
  body('goal')
    .optional()
    .isLength({ max: 500 }).withMessage('Цель не должна превышать 500 символов')
];

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, profileValidation, updateProfile);
router.get('/progress', authenticate, getProgress);
router.get('/measurements', authenticate, getMeasurements);
router.post('/measurements', authenticate, addMeasurement);
router.get('/favorites', authenticate, getFavorites);
router.post('/favorites/:workoutId', authenticate, addFavorite);
router.delete('/favorites/:workoutId', authenticate, removeFavorite);

router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Все поля обязательны' });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Пароль должен содержать минимум 8 символов' });
    }
    
    if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return res.status(400).json({ 
        message: 'Пароль должен содержать буквы и цифры' 
      });
    }
    
    const user = await User.findByPk(req.user.id);
    
    const isValidPassword = await user.validatePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Неверный текущий пароль' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    await User.update(
      { password: hashedPassword },
      { where: { id: req.user.id } }
    );
    
    res.json({ message: 'Пароль успешно изменен' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Ошибка при изменении пароля' });
  }
});

export default router;
