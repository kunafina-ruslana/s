import express from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
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

export default router;