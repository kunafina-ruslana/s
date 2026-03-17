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
  body('description').notEmpty().withMessage('Описание обязательно'),
  body('rutubeFullUrl')
    .optional()
    .custom((value) => {
      if (!value) return true;
      const patterns = [
        /rutube\.ru\/video\/([a-f0-9]+)/i,
        /rutube\.ru\/play\/embed\/([a-f0-9]+)/i
      ];
      const isValid = patterns.some(pattern => pattern.test(value));
      if (!isValid) throw new Error('Неверный формат ссылки Rutube');
      return true;
    }),
  body('rutubeStartTime').optional().isInt({ min: 0 }),
  body('rutubeEndTime')
    .optional()
    .custom((value, { req }) => {
      if (value && req.body.rutubeStartTime && value <= req.body.rutubeStartTime) {
        throw new Error('Время окончания должно быть больше времени начала');
      }
      return true;
    })
];

router.get('/', getAllExercises);
router.get('/:id', getExerciseById);

router.get('/my', authenticate, authorize('trainer', 'admin'), getMyExercises);
router.post('/', authenticate, authorize('trainer', 'admin'), exerciseValidation, createExercise);
router.put('/:id', authenticate, authorize('trainer', 'admin'), exerciseValidation, updateExercise);
router.delete('/:id', authenticate, authorize('trainer', 'admin'), deleteExercise);

export default router;
