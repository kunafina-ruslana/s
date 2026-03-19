import User from './User.js';
import Exercise from './Exercise.js';
import Workout from './Workout.js';
import WorkoutExercise from './WorkoutExercise.js';
import Review from './Review.js';
import FavoriteWorkout from './FavoriteWorkout.js';
import WorkoutProgress from './WorkoutProgress.js';
import BodyMeasurement from './BodyMeasurement.js';

User.hasMany(Review, { 
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});
Review.belongsTo(User, { 
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});

User.hasMany(WorkoutProgress, { 
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});
WorkoutProgress.belongsTo(User, { 
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});

User.hasMany(BodyMeasurement, { 
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});
BodyMeasurement.belongsTo(User, { 
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});

User.belongsToMany(Workout, { 
  through: FavoriteWorkout, 
  foreignKey: 'userId',
  as: 'favoriteWorkouts',
  onDelete: 'CASCADE'
});
Workout.belongsToMany(User, { 
  through: FavoriteWorkout, 
  foreignKey: 'workoutId',
  as: 'favoritedBy',
  onDelete: 'CASCADE'
});

FavoriteWorkout.belongsTo(User, { 
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});
FavoriteWorkout.belongsTo(Workout, { 
  foreignKey: 'workoutId',
  onDelete: 'CASCADE'
});
User.hasMany(FavoriteWorkout, { 
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});
Workout.hasMany(FavoriteWorkout, { 
  foreignKey: 'workoutId',
  onDelete: 'CASCADE'
});

Workout.belongsToMany(Exercise, { 
  through: WorkoutExercise, 
  foreignKey: 'workoutId',
  as: 'exercises',
  onDelete: 'CASCADE'
});
Exercise.belongsToMany(Workout, { 
  through: WorkoutExercise, 
  foreignKey: 'exerciseId',
  as: 'workouts',
  onDelete: 'CASCADE'
});

WorkoutExercise.belongsTo(Workout, { 
  foreignKey: 'workoutId',
  onDelete: 'CASCADE'
});
WorkoutExercise.belongsTo(Exercise, { 
  foreignKey: 'exerciseId',
  onDelete: 'CASCADE'
});
Workout.hasMany(WorkoutExercise, { 
  foreignKey: 'workoutId',
  onDelete: 'CASCADE'
});
Exercise.hasMany(WorkoutExercise, { 
  foreignKey: 'exerciseId',
  onDelete: 'CASCADE'
});

Workout.belongsTo(User, { 
  as: 'creator', 
  foreignKey: 'createdBy',
  onDelete: 'SET NULL'
});

Exercise.belongsTo(User, { 
  as: 'creator', 
  foreignKey: 'createdBy',
  onDelete: 'SET NULL'
});

WorkoutProgress.belongsTo(Workout, { 
  foreignKey: 'workoutId',
  onDelete: 'CASCADE'
});

Workout.hasMany(WorkoutProgress, { 
  foreignKey: 'workoutId',
  onDelete: 'CASCADE'
});

export {
  User,
  Exercise,
  Workout,
  WorkoutExercise,
  Review,
  FavoriteWorkout,
  WorkoutProgress,
  BodyMeasurement
};
