import express from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcrypt';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { User } from '../models/index.js';
import {
  getStats,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  createExercise,
  updateExercise,
  deleteExercise,
  createWorkout,
  updateWorkout,
  deleteWorkout
} from '../controllers/adminController.js';

const router = express.Router();

router.use(authenticate, authorize('admin'));

const userValidation = [
  body('firstName').notEmpty().withMessage('Имя обязательно'),
  body('lastName').notEmpty().withMessage('Фамилия обязательна'),
  body('email').isEmail().withMessage('Неверный формат email'),
  body('role').isIn(['user', 'trainer', 'admin']).withMessage('Неверная роль')
];

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.post('/users', userValidation, createUser);
router.put('/users/:id', userValidation, updateUser);
router.delete('/users/:id', deleteUser);

router.post('/exercises', createExercise);
router.put('/exercises/:id', updateExercise);
router.delete('/exercises/:id', deleteExercise);

router.post('/workouts', createWorkout);
router.put('/workouts/:id', updateWorkout);
router.delete('/workouts/:id', deleteWorkout);

router.put('/users/:id/password', async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ message: 'Пароль обязателен' });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ message: 'Пароль должен содержать минимум 8 символов' });
    }
    
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({ 
        message: 'Пароль должен содержать буквы и цифры' 
      });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    await User.update(
      { password: hashedPassword },
      { where: { id: req.params.id } }
    );
    
    res.json({ message: 'Пароль пользователя успешно изменен' });
  } catch (error) {
    console.error('Error changing user password:', error);
    res.status(500).json({ message: 'Ошибка при изменении пароля' });
  }
});

export default router;
