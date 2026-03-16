import express from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import {
  getApprovedReviews,
  createReview,
  getPendingReviews,
  approveReview,
  deleteReview
} from '../controllers/reviewController.js';

const router = express.Router();

const reviewValidation = [
  body('fullName')
    .notEmpty().withMessage('ФИО обязательно')
    .matches(/^[A-Za-zА-Яа-я\s]+$/).withMessage('ФИО может содержать только буквы'),
  body('email')
    .notEmpty().withMessage('Email обязателен')
    .isEmail().withMessage('Неверный формат email'),
  body('comment')
    .notEmpty().withMessage('Комментарий обязателен')
];

router.get('/', getApprovedReviews);
router.post('/', reviewValidation, createReview);
router.get('/pending', authenticate, authorize('admin'), getPendingReviews);
router.put('/:id/approve', authenticate, authorize('admin'), approveReview);
router.delete('/:id', authenticate, authorize('admin'), deleteReview);

export default router;