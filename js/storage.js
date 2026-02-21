/* ============================================================
   JaviTrack  |  storage.js  — LocalStorage helpers
   ============================================================ */

const STORAGE_KEY = 'javitrack_workouts';

function getWorkouts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveWorkouts(workouts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
}

function addWorkout(workout) {
  const workouts = getWorkouts();
  workout.id = Date.now().toString();
  workout.createdAt = new Date().toISOString();
  workouts.unshift(workout);
  saveWorkouts(workouts);
  return workout;
}

function deleteWorkout(id) {
  const workouts = getWorkouts().filter(w => w.id !== id);
  saveWorkouts(workouts);
}

function getWorkoutById(id) {
  return getWorkouts().find(w => w.id === id) || null;
}
