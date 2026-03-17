import { Workout, Exercise, WorkoutExercise, WorkoutProgress } from '../models/index.js';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';

export const getAllWorkouts = async (req, res) => {
  try {
    const { level, category, search } = req.query;
    const where = {};

    if (level) where.level = level;
    if (category) where.category = category;
    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    const workouts = await Workout.findAll({
      where,
      include: [
        { 
          model: Exercise, 
          as: 'exercises',
          through: { 
            attributes: ['sets', 'reps', 'restTime', 'order'] 
          } 
        }
      ]
    });
    res.json(workouts);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    res.status(500).json({ message: 'Ошибка загрузки тренировок' });
  }
};

export const getWorkoutById = async (req, res) => {
  try {
    const workout = await Workout.findByPk(req.params.id, {
      include: [
        { 
          model: Exercise, 
          as: 'exercises',
          through: { 
            attributes: ['sets', 'reps', 'restTime', 'order'] 
          } 
        }
      ]
    });
    if (!workout) {
      return res.status(404).json({ message: 'Тренировка не найдена' });
    }
    res.json(workout);
  } catch (error) {
    console.error('Error fetching workout:', error);
    res.status(500).json({ message: 'Ошибка загрузки тренировки' });
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

    const { exercises, ...workoutData } = req.body;
    
    if (!exercises || exercises.length === 0) {
      return res.status(400).json({ message: 'Тренировка должна содержать хотя бы одно упражнение' });
    }
    
    const workout = await Workout.create({
      ...workoutData,
      createdBy: req.user.id
    });

    const workoutExercises = exercises.map((ex, index) => ({
      workoutId: workout.id,
      exerciseId: ex.exerciseId,
      sets: ex.sets || 3,
      reps: ex.reps || 10,
      restTime: ex.restTime || 30,
      order: index
    }));
    
    await WorkoutExercise.bulkCreate(workoutExercises);

    const fullWorkout = await Workout.findByPk(workout.id, {
      include: [
        { 
          model: Exercise, 
          as: 'exercises',
          through: { 
            attributes: ['sets', 'reps', 'restTime', 'order'] 
          } 
        }
      ]
    });

    res.status(201).json(fullWorkout);
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

    if (req.user.role !== 'admin' && workout.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    const { exercises, ...workoutData } = req.body;
    await workout.update(workoutData);

    if (exercises) {
      await WorkoutExercise.destroy({ where: { workoutId: workout.id } });
      
      const workoutExercises = exercises.map((ex, index) => ({
        workoutId: workout.id,
        exerciseId: ex.exerciseId,
        sets: ex.sets || 3,
        reps: ex.reps || 10,
        restTime: ex.restTime || 30,
        order: index
      }));
      await WorkoutExercise.bulkCreate(workoutExercises);
    }

    const updatedWorkout = await Workout.findByPk(workout.id, {
      include: [
        { 
          model: Exercise, 
          as: 'exercises',
          through: { 
            attributes: ['sets', 'reps', 'restTime', 'order'] 
          } 
        }
      ]
    });

    res.json(updatedWorkout);
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

    if (req.user.role !== 'admin' && workout.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    await WorkoutExercise.destroy({ where: { workoutId: workout.id } });
    await workout.destroy();
    res.json({ message: 'Тренировка удалена' });
  } catch (error) {
    console.error('Error deleting workout:', error);
    res.status(500).json({ message: 'Ошибка удаления тренировки' });
  }
};

export const startWorkout = async (req, res) => {
  try {
    const progress = await WorkoutProgress.create({
      userId: req.user.id,
      workoutId: req.params.id,
      date: new Date()
    });
    res.status(201).json(progress);
  } catch (error) {
    console.error('Error starting workout:', error);
    res.status(500).json({ message: 'Ошибка начала тренировки' });
  }
};

export const completeWorkout = async (req, res) => {
  try {
    const { duration, caloriesBurned } = req.body;
    
    const progress = await WorkoutProgress.findOne({
      where: {
        userId: req.user.id,
        workoutId: req.params.id,
        date: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    if (progress) {
      await progress.update({ duration, caloriesBurned, completed: true });
      res.json(progress);
    } else {
      const newProgress = await WorkoutProgress.create({
        userId: req.user.id,
        workoutId: req.params.id,
        duration,
        caloriesBurned,
        completed: true
      });
      res.json(newProgress);
    }
  } catch (error) {
    console.error('Error completing workout:', error);
    res.status(500).json({ message: 'Ошибка завершения тренировки' });
  }
};

export const getMyWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.findAll({
      where: { createdBy: req.user.id },
      include: [
        { 
          model: Exercise, 
          as: 'exercises',
          through: { 
            attributes: ['sets', 'reps', 'restTime', 'order'] 
          } 
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(workouts);
  } catch (error) {
    console.error('Error fetching my workouts:', error);
    res.status(500).json({ message: 'Ошибка загрузки ваших тренировок' });
  }
};
