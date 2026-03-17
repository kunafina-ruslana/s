import { Exercise } from '../models/index.js';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';

// Вспомогательные функции
const extractRutubeVideoId = (url) => {
  if (!url) return null;
  
  const patterns = [
    /rutube\.ru\/video\/([a-f0-9]+)/i,
    /rutube\.ru\/play\/embed\/([a-f0-9]+)/i,
    /rutube\.ru\/video\/embed\/([a-f0-9]+)/i,
    /rutube\.ru\/([a-f0-9]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
};

const buildRutubeEmbedUrl = (videoId, startTime, endTime) => {
  if (!videoId) return null;
  
  let url = `https://rutube.ru/play/embed/${videoId}`;
  const params = [];
  
  if (startTime && startTime > 0) {
    params.push(`t=${startTime}`);
  }
  if (endTime && endTime > 0) {
    params.push(`end=${endTime}`);
  }
  
  if (params.length > 0) {
    url += '?' + params.join('&');
  }
  
  return url;
};

// Публичные маршруты
export const getAllExercises = async (req, res) => {
  try {
    const { muscleGroup, difficulty, category, equipment } = req.query;
    const where = {};

    if (muscleGroup) where.muscleGroup = muscleGroup;
    if (difficulty) where.difficulty = difficulty;
    if (category) where.category = category;
    if (equipment) where.equipment = equipment;

    const exercises = await Exercise.findAll({ 
      where,
      order: [['name', 'ASC']]
    });
    
    const exercisesWithEmbed = exercises.map(exercise => {
      const exerciseData = exercise.toJSON();
      if (exercise.rutubeVideoId) {
        exerciseData.embedUrl = buildRutubeEmbedUrl(
          exercise.rutubeVideoId,
          exercise.rutubeStartTime,
          exercise.rutubeEndTime
        );
      }
      return exerciseData;
    });
    
    res.json(exercisesWithEmbed);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ message: 'Ошибка загрузки упражнений' });
  }
};

export const getExerciseById = async (req, res) => {
  try {
    const exercise = await Exercise.findByPk(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: 'Упражнение не найдено' });
    }
    
    const exerciseData = exercise.toJSON();
    if (exercise.rutubeVideoId) {
      exerciseData.embedUrl = buildRutubeEmbedUrl(
        exercise.rutubeVideoId,
        exercise.rutubeStartTime,
        exercise.rutubeEndTime
      );
    }
    
    res.json(exerciseData);
  } catch (error) {
    console.error('Error fetching exercise:', error);
    res.status(500).json({ message: 'Ошибка загрузки упражнения' });
  }
};

// Маршруты для тренера
export const getMyExercises = async (req, res) => {
  try {
    console.log('Fetching exercises for user:', req.user.id);
    
    const exercises = await Exercise.findAll({
      where: { createdBy: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`Found ${exercises.length} exercises`);
    
    const exercisesWithEmbed = exercises.map(exercise => {
      const exerciseData = exercise.toJSON();
      if (exercise.rutubeVideoId) {
        exerciseData.embedUrl = buildRutubeEmbedUrl(
          exercise.rutubeVideoId,
          exercise.rutubeStartTime,
          exercise.rutubeEndTime
        );
      }
      return exerciseData;
    });
    
    res.json(exercisesWithEmbed);
  } catch (error) {
    console.error('Error fetching my exercises:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      message: 'Ошибка загрузки ваших упражнений',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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

    const { rutubeFullUrl, rutubeStartTime, rutubeEndTime, ...otherData } = req.body;
    
    const videoId = extractRutubeVideoId(rutubeFullUrl);
    
    const exerciseData = {
      ...otherData,
      rutubeFullUrl,
      rutubeStartTime: rutubeStartTime || 0,
      rutubeEndTime: rutubeEndTime || null,
      rutubeVideoId: videoId,
      createdBy: req.user.id
    };
    
    const exercise = await Exercise.create(exerciseData);
    
    const result = exercise.toJSON();
    if (result.rutubeVideoId) {
      result.embedUrl = buildRutubeEmbedUrl(
        result.rutubeVideoId,
        result.rutubeStartTime,
        result.rutubeEndTime
      );
    }
    
    res.status(201).json(result);
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

    if (req.user.role !== 'admin' && exercise.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    const { rutubeFullUrl, rutubeStartTime, rutubeEndTime, ...otherData } = req.body;
    
    const updateData = { ...otherData };
    
    if (rutubeFullUrl) {
      updateData.rutubeFullUrl = rutubeFullUrl;
      updateData.rutubeVideoId = extractRutubeVideoId(rutubeFullUrl);
    }
    if (rutubeStartTime !== undefined) {
      updateData.rutubeStartTime = rutubeStartTime;
    }
    if (rutubeEndTime !== undefined) {
      updateData.rutubeEndTime = rutubeEndTime;
    }

    await exercise.update(updateData);
    
    const updatedExercise = await Exercise.findByPk(req.params.id);
    const result = updatedExercise.toJSON();
    
    if (result.rutubeVideoId) {
      result.embedUrl = buildRutubeEmbedUrl(
        result.rutubeVideoId,
        result.rutubeStartTime,
        result.rutubeEndTime
      );
    }
    
    res.json(result);
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

    if (req.user.role !== 'admin' && exercise.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    await exercise.destroy();
    res.json({ message: 'Упражнение удалено' });
  } catch (error) {
    console.error('Error deleting exercise:', error);
    res.status(500).json({ message: 'Ошибка удаления упражнения' });
  }
};
