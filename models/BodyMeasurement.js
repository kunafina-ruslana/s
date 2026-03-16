import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const BodyMeasurement = sequelize.define('BodyMeasurement', {
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
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  weight: {
    type: DataTypes.FLOAT
  },
  height: {
    type: DataTypes.FLOAT
  },
  chest: {
    type: DataTypes.FLOAT
  },
  waist: {
    type: DataTypes.FLOAT
  },
  hips: {
    type: DataTypes.FLOAT
  }
});

export default BodyMeasurement;