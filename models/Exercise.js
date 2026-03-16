import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Exercise = sequelize.define('Exercise', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  category: {
    type: DataTypes.ENUM('strength', 'cardio', 'stretching', 'other'),
    defaultValue: 'strength'
  },
  muscleGroup: {
    type: DataTypes.STRING
  },
  difficulty: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    defaultValue: 'beginner'
  },
  equipment: {
    type: DataTypes.STRING
  },
  imageUrl: {
    type: DataTypes.STRING
  },
  rutubeVideoId: {
    type: DataTypes.STRING,
    comment: 'ID видео на Rutube (из ссылки)'
  },
  rutubeStartTime: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Время начала в секундах'
  },
  rutubeEndTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Время окончания в секундах (опционально)'
  },
  rutubeFullUrl: {
    type: DataTypes.STRING,
    comment: 'Полная ссылка на видео на Rutube'
  },
  instructions: {
    type: DataTypes.TEXT
  },
  commonMistakes: {
    type: DataTypes.TEXT
  },
  createdBy: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
});

export default Exercise;