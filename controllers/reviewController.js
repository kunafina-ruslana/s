import { Review } from '../models/index.js';
import { validationResult } from 'express-validator';

export const getApprovedReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { isApproved: true },
      order: [['createdAt', 'DESC']]
    });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Ошибка загрузки отзывов' });
  }
};

export const createReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Ошибка валидации', 
        errors: errors.array() 
      });
    }

    const { fullName, email, comment } = req.body;
    
    const review = await Review.create({
      fullName,
      email,
      comment,
      userId: req.user?.id || null
    });
    
    res.status(201).json({ message: 'Отзыв отправлен на модерацию' });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Ошибка отправки отзыва' });
  }
};

export const getPendingReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { isApproved: false },
      order: [['createdAt', 'ASC']]
    });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching pending reviews:', error);
    res.status(500).json({ message: 'Ошибка загрузки отзывов' });
  }
};

export const approveReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Отзыв не найден' });
    }
    
    await review.update({ isApproved: true });
    res.json({ message: 'Отзыв опубликован' });
  } catch (error) {
    console.error('Error approving review:', error);
    res.status(500).json({ message: 'Ошибка публикации отзыва' });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Отзыв не найден' });
    }
    
    await review.destroy();
    res.json({ message: 'Отзыв удален' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Ошибка удаления отзыва' });
  }
};