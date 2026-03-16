import { User, Exercise, Workout, Review } from '../models/index.js';
import { validationResult } from 'express-validator';

export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalExercises = await Exercise.count();
    const totalWorkouts = await Workout.count();
    const pendingReviews = await Review.count({ where: { isApproved: false } });
    
    res.json({
      totalUsers,
      totalExercises,
      totalWorkouts,
      pendingReviews
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Ошибка загрузки статистики' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['id', 'ASC']]
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Ошибка загрузки пользователей' });
  }
};

export const createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Ошибка валидации', 
        errors: errors.array() 
      });
    }

    const user = await User.create(req.body);
    const userWithoutPassword = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] }
    });
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Ошибка создания пользователя' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Ошибка валидации', 
        errors: errors.array() 
      });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    await user.update(req.body);
    const updatedUser = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Ошибка обновления пользователя' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    await user.destroy();
    res.json({ message: 'Пользователь удален' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Ошибка удаления пользователя' });
  }
};

export const createExercise = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Ошибка валидации', 
        errors: errors.array() 
      });
    }

    const exercise = await Exercise.create({
      ...req.body,
      createdBy: req.user.id
    });
    res.status(201).json(exercise);
  } catch (error) {
    console.error('Error creating exercise:', error);
    res.status(500).json({ message: 'Ошибка создания упражнения' });
  }
};

export const updateExercise = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Ошибка валидации', 
        errors: errors.array() 
      });
    }

    const exercise = await Exercise.findByPk(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: 'Упражнение не найдено' });
    }
    
    await exercise.update(req.body);
    res.json(exercise);
  } catch (error) {
    console.error('Error updating exercise:', error);
    res.status(500).json({ message: 'Ошибка обновления упражнения' });
  }
};

export const deleteExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findByPk(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: 'Упражнение не найдено' });
    }
    
    await exercise.destroy();
    res.json({ message: 'Упражнение удалено' });
  } catch (error) {
    console.error('Error deleting exercise:', error);
    res.status(500).json({ message: 'Ошибка удаления упражнения' });
  }
};

export const createWorkout = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Ошибка валидации', 
        errors: errors.array() 
      });
    }

    const workout = await Workout.create({
      ...req.body,
      createdBy: req.user.id
    });
    res.status(201).json(workout);
  } catch (error) {
    console.error('Error creating workout:', error);
    res.status(500).json({ message: 'Ошибка создания тренировки' });
  }
};

export const updateWorkout = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Ошибка валидации', 
        errors: errors.array() 
      });
    }

    const workout = await Workout.findByPk(req.params.id);
    if (!workout) {
      return res.status(404).json({ message: 'Тренировка не найдена' });
    }
    
    await workout.update(req.body);
    res.json(workout);
  } catch (error) {
    console.error('Error updating workout:', error);
    res.status(500).json({ message: 'Ошибка обновления тренировки' });
  }
};

export const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findByPk(req.params.id);
    if (!workout) {
      return res.status(404).json({ message: 'Тренировка не найдена' });
    }
    
    await workout.destroy();
    res.json({ message: 'Тренировка удалена' });
  } catch (error) {
    console.error('Error deleting workout:', error);
    res.status(500).json({ message: 'Ошибка удаления тренировки' });
  }
};