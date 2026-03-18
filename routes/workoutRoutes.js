import express from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import {
  getAllWorkouts,
  getWorkoutById,
  getMyWorkouts,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  startWorkout,
  completeWorkout
} from '../controllers/workoutController.js';

const router = express.Router();

const workoutValidation = [
  body('name')
    .notEmpty().withMessage('Название обязательно')
    .isLength({ min: 3, max: 100 }).withMessage('Название должно быть от 3 до 100 символов'),
  
  body('description')
    .notEmpty().withMessage('Описание обязательно')
    .isLength({ min: 10, max: 1000 }).withMessage('Описание должно быть от 10 до 1000 символов'),
  
  body('duration')
    .notEmpty().withMessage('Длительность обязательна')
    .isInt({ min: 1, max: 300 }).withMessage('Длительность должна быть от 1 до 300 минут'),
  
  body('level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced']).withMessage('Некорректный уровень сложности'),
  
  body('category')
    .optional()
    .isLength({ max: 50 }).withMessage('Категория не должна превышать 50 символов'),
  
  body('imageUrl')
    .optional()
    .isURL().withMessage('Некорректный URL изображения')
];

router.get('/', getAllWorkouts);
router.get('/my', authenticate, authorize('trainer', 'admin'), getMyWorkouts);
router.get('/:id', getWorkoutById);
router.post('/', authenticate, authorize('trainer', 'admin'), workoutValidation, createWorkout);
router.put('/:id', authenticate, authorize('trainer', 'admin'), workoutValidation, updateWorkout);
router.delete('/:id', authenticate, authorize('trainer', 'admin'), deleteWorkout);
router.post('/:id/start', authenticate, startWorkout);
router.put('/:id/complete', authenticate, completeWorkout);

export default router;
