import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const WorkoutProgress = sequelize.define('WorkoutProgress', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  workoutId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Workouts',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  duration: {
    type: DataTypes.INTEGER
  },
  caloriesBurned: {
    type: DataTypes.FLOAT
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

export default WorkoutProgress;