import express from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import {
  getAllExercises,
  getExerciseById,
  getMyExercises,
  createExercise,
  updateExercise,
  deleteExercise
} from '../controllers/exerciseController.js';

const router = express.Router();

const exerciseValidation = [
  body('name').notEmpty().withMessage('Название обязательно'),
  body('description').notEmpty().withMessage('Описание обязательно')
];

// Публичные маршруты
router.get('/', getAllExercises);
router.get('/my', authenticate, authorize('trainer', 'admin'), getMyExercises);
router.get('/:id', getExerciseById);

// Защищенные маршруты для тренера и админа
router.post('/', authenticate, authorize('trainer', 'admin'), exerciseValidation, createExercise);
router.put('/:id', authenticate, authorize('trainer', 'admin'), exerciseValidation, updateExercise);
router.delete('/:id', authenticate, authorize('trainer', 'admin'), deleteExercise);

export default router;
