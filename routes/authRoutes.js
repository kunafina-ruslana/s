import express from 'express';
import { body } from 'express-validator';
import { register, login, getMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

const registerValidation = [
  body('firstName')
    .trim().notEmpty().withMessage('Имя обязательно')
    .isLength({ min: 2 }).withMessage('Имя должно содержать минимум 2 символа')
    .isLength({ max: 50 }).withMessage('Имя не должно превышать 50 символов')
    .matches(/^[A-Za-zА-Яа-я\s-]+$/).withMessage('Имя может содержать только буквы, пробелы и дефисы'),
  
  body('lastName')
    .trim().notEmpty().withMessage('Фамилия обязательна')
    .isLength({ min: 2 }).withMessage('Фамилия должна содержать минимум 2 символа')
    .isLength({ max: 50 }).withMessage('Фамилия не должна превышать 50 символов')
    .matches(/^[A-Za-zА-Яа-я\s-]+$/).withMessage('Фамилия может содержать только буквы, пробелы и дефисы'),
  
  body('email')
    .trim().notEmpty().withMessage('Email обязателен')
    .isEmail().withMessage('Неверный формат email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Пароль обязателен')
    .isLength({ min: 8 }).withMessage('Пароль должен содержать минимум 8 символов')
    .matches(/[A-Za-z]/).withMessage('Пароль должен содержать буквы')
    .matches(/[0-9]/).withMessage('Пароль должен содержать цифры'),
  
  body('confirmPassword')
    .notEmpty().withMessage('Подтверждение пароля обязательно')
    .custom((value, { req }) => value === req.body.password).withMessage('Пароли не совпадают'),
  
  body('birthDate')
    .notEmpty().withMessage('Дата рождения обязательна')
    .isDate().withMessage('Неверный формат даты')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 8) throw new Error('Возраст должен быть не менее 8 лет');
      if (age > 100) throw new Error('Возраст должен быть не более 100 лет');
      
      return true;
    }),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'unspecified']).withMessage('Неверное значение пола'),
  
  body('agreement')
    .notEmpty().withMessage('Необходимо согласие на обработку данных')
    .isBoolean().withMessage('Неверный формат согласия')
    .custom(value => value === true).withMessage('Необходимо согласие на обработку данных')
];

const loginValidation = [
  body('email')
    .trim().notEmpty().withMessage('Email обязателен')
    .isEmail().withMessage('Неверный формат email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Пароль обязателен')
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', authenticate, getMe);

export default router;