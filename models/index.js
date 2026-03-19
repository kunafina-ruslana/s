import User from './User.js';
import Exercise from './Exercise.js';
import Workout from './Workout.js';
import WorkoutExercise from './WorkoutExercise.js';
import Review from './Review.js';
import FavoriteWorkout from './FavoriteWorkout.js';
import WorkoutProgress from './WorkoutProgress.js';
import BodyMeasurement from './BodyMeasurement.js';

// Связи пользователя
User.hasMany(Review, { foreignKey: 'userId' });
Review.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(WorkoutProgress, { foreignKey: 'userId' });
WorkoutProgress.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(BodyMeasurement, { foreignKey: 'userId' });
BodyMeasurement.belongsTo(User, { foreignKey: 'userId' });

// Связи избранного
User.belongsToMany(Workout, { 
  through: FavoriteWorkout, 
  foreignKey: 'userId',
  as: 'favoriteWorkouts'
});
Workout.belongsToMany(User, { 
  through: FavoriteWorkout, 
  foreignKey: 'workoutId',
  as: 'favoritedBy'
});

FavoriteWorkout.belongsTo(User, { foreignKey: 'userId' });
FavoriteWorkout.belongsTo(Workout, { foreignKey: 'workoutId' });
User.hasMany(FavoriteWorkout, { foreignKey: 'userId' });
Workout.hasMany(FavoriteWorkout, { foreignKey: 'workoutId' });

Workout.belongsToMany(Exercise, { 
  through: WorkoutExercise, 
  foreignKey: 'workoutId',
  as: 'exercises',
  onDelete: 'CASCADE'  // Важно!
});

WorkoutExercise.belongsTo(Workout, { foreignKey: 'workoutId' });
Workout.hasMany(WorkoutExercise, { foreignKey: 'workoutId' });

WorkoutExercise.belongsTo(Workout, { foreignKey: 'workoutId' });
WorkoutExercise.belongsTo(Exercise, { foreignKey: 'exerciseId' });
Workout.hasMany(WorkoutExercise, { foreignKey: 'workoutId' });
Exercise.hasMany(WorkoutExercise, { foreignKey: 'exerciseId' });

Workout.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });
Exercise.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });

WorkoutProgress.belongsTo(Workout, { foreignKey: 'workoutId' });
Workout.hasMany(WorkoutProgress, { foreignKey: 'workoutId' });

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
