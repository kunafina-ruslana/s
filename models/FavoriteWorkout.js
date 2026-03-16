import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const FavoriteWorkout = sequelize.define('FavoriteWorkout', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  workoutId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Workouts',
      key: 'id'
    }
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['userId', 'workoutId']
    }
  ]
});

export default FavoriteWorkout;