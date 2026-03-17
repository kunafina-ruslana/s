import express from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import {
  getAllWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  startWorkout,
  completeWorkout
} from '../controllers/workoutController.js';

const router = express.Router();

const workoutValidation = [
  body('name').notEmpty().withMessage('Название обязательно'),
  body('exercises').isArray({ min: 1 }).withMessage('Тренировка должна содержать хотя бы одно упражнение')
];

router.get('/', getAllWorkouts);
router.get('/:id', getWorkoutById);
router.post('/', authenticate, authorize('trainer', 'admin'), workoutValidation, createWorkout);
router.put('/:id', authenticate, authorize('trainer', 'admin'), workoutValidation, updateWorkout);
router.delete('/:id', authenticate, authorize('trainer', 'admin'), deleteWorkout);
router.post('/:id/start', authenticate, startWorkout);
router.put('/:id/complete', authenticate, completeWorkout);
router.get('/my', authenticate, authorize('trainer', 'admin'), getMyWorkouts);

export default router;
