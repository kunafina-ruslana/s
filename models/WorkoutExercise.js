import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const WorkoutExercise = sequelize.define('WorkoutExercise', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  workoutId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Workouts',
      key: 'id'
    }
  },
  exerciseId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Exercises',
      key: 'id'
    }
  },
  sets: {
    type: DataTypes.INTEGER
  },
  reps: {
    type: DataTypes.INTEGER
  },
  restTime: {
    type: DataTypes.INTEGER,
    defaultValue: 30
  },
  order: {
    type: DataTypes.INTEGER
  }
});

export default WorkoutExercise;