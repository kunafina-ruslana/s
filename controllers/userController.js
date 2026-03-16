import { User, WorkoutProgress, BodyMeasurement, FavoriteWorkout, Workout, Exercise } from '../models/index.js';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Ошибка загрузки профиля' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Ошибка валидации', 
        errors: errors.array() 
      });
    }

    const { firstName, lastName, weight, height, chest, waist, hips, goal } = req.body;

    const updateData = {
      firstName: firstName?.trim(),
      lastName: lastName?.trim(),
      goal: goal?.trim() || null
    };

    if (weight !== undefined && weight !== null && weight !== '') {
      updateData.weight = parseFloat(weight);
    }
    if (height !== undefined && height !== null && height !== '') {
      updateData.height = parseFloat(height);
    }
    if (chest !== undefined && chest !== null && chest !== '') {
      updateData.chest = parseFloat(chest);
    }
    if (waist !== undefined && waist !== null && waist !== '') {
      updateData.waist = parseFloat(waist);
    }
    if (hips !== undefined && hips !== null && hips !== '') {
      updateData.hips = parseFloat(hips);
    }

    await User.update(updateData, {
      where: { id: req.user.id }
    });

    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.json({ 
      message: 'Профиль успешно обновлен',
      user: updatedUser 
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Ошибка обновления профиля' });
  }
};

export const getProgress = async (req, res) => {
  try {
    const workouts = await WorkoutProgress.findAll({
      where: { userId: req.user.id },
      include: [{ model: Workout }],
      order: [['date', 'DESC']]
    });

    const totalWorkouts = workouts.length;
    const totalCalories = workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
    const totalMinutes = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);

    const user = await User.findByPk(req.user.id);
    let bmi = null;
    if (user.weight && user.height) {
      bmi = user.weight / Math.pow(user.height / 100, 2);
    }

    res.json({
      totalWorkouts,
      totalCalories,
      totalMinutes,
      bmi: bmi ? bmi.toFixed(1) : null,
      workouts
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ message: 'Ошибка загрузки прогресса' });
  }
};

export const getMeasurements = async (req, res) => {
  try {
    const measurements = await BodyMeasurement.findAll({
      where: { userId: req.user.id },
      order: [['date', 'DESC']]
    });
    res.json(measurements);
  } catch (error) {
    console.error('Error fetching measurements:', error);
    res.status(500).json({ message: 'Ошибка загрузки замеров' });
  }
};

export const addMeasurement = async (req, res) => {
  try {
    const measurement = await BodyMeasurement.create({
      userId: req.user.id,
      date: new Date(),
      ...req.body
    });
    res.status(201).json(measurement);
  } catch (error) {
    console.error('Error adding measurement:', error);
    res.status(500).json({ message: 'Ошибка добавления замера' });
  }
};

export const getFavorites = async (req, res) => {
  try {
    const favorites = await FavoriteWorkout.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Workout,
        include: [{
          model: Exercise,
          as: 'exercises',
          through: { attributes: ['sets', 'reps', 'restTime', 'order'] }
        }]
      }]
    });
    
    const workouts = favorites.map(f => f.Workout).filter(w => w !== null);
    res.json(workouts);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Ошибка загрузки избранного' });
  }
};

export const addFavorite = async (req, res) => {
  try {
    const workoutId = parseInt(req.params.workoutId);
    
    const workout = await Workout.findByPk(workoutId);
    if (!workout) {
      return res.status(404).json({ message: 'Тренировка не найдена' });
    }
    
    const existing = await FavoriteWorkout.findOne({
      where: {
        userId: req.user.id,
        workoutId: workoutId
      }
    });
    
    if (existing) {
      return res.status(400).json({ message: 'Уже в избранном' });
    }
    
    await FavoriteWorkout.create({
      userId: req.user.id,
      workoutId: workoutId
    });
    
    res.status(201).json({ message: 'Добавлено в избранное' });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ message: 'Ошибка добавления в избранное' });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const workoutId = parseInt(req.params.workoutId);
    
    const deleted = await FavoriteWorkout.destroy({
      where: {
        userId: req.user.id,
        workoutId: workoutId
      }
    });
    
    if (deleted === 0) {
      return res.status(404).json({ message: 'Запись не найдена' });
    }
    
    res.json({ message: 'Удалено из избранного' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ message: 'Ошибка удаления из избранного' });
  }
};