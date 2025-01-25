const Habit = require('./habits');
const HabitHistory = require('./habithistory');

// Create a new habit
const createHabit = async (req, res) => {
  const { name, frequency, icon } = req.body;
  const { email } = req.user;  // Getting user email from token
  
  try {
    const newHabit = new Habit({
      name,
      frequency,
      icon,
      userEmail: email,
    });
    await newHabit.save();
    res.status(201).send({ status: 'ok', message: 'Habit created successfully' });
  } catch (error) {
    res.status(500).send({ status: 'error', message: 'Error creating habit', error: error.message });
  }
};

// Get all habits for a user
const getHabits = async (req, res) => {
  const { email } = req.user; // Getting user email from token

  try {
    const habits = await Habit.find({ userEmail: email });
    res.status(200).json({ status: 'ok', habits });
  } catch (error) {
    res.status(500).send({ status: 'error', message: 'Error fetching habits', error: error.message });
  }
};

// Track habit completion (for today)
const trackHabitCompletion = async (req, res) => {
  const { habitId, completed } = req.body;
  const { email } = req.user;  // Getting user email from token
  
  try {
    const habit = await Habit.findOne({ _id: habitId, userEmail: email });
    if (!habit) {
      return res.status(404).send({ status: 'error', message: 'Habit not found' });
    }

    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

    const habitHistory = new HabitHistory({
      habitId,
      userEmail: email,
      completed,
      date: today,
    });

    await habitHistory.save();
    res.status(200).send({ status: 'ok', message: 'Habit tracked successfully' });
  } catch (error) {
    res.status(500).send({ status: 'error', message: 'Error tracking habit completion', error: error.message });
  }
};

// Get statistics for the habits (e.g., streaks, completion rates)
const getHabitStats = async (req, res) => {
  const { email } = req.user;  // Getting user email from token

  try {
    const habits = await Habit.find({ userEmail: email });
    const stats = [];

    for (const habit of habits) {
      const habitHistory = await HabitHistory.find({ habitId: habit._id, userEmail: email });
      
      const totalDays = habitHistory.length;
      const completedDays = habitHistory.filter((record) => record.completed).length;
      const streak = habitHistory.reduce((streak, record, index) => {
        if (index > 0 && record.completed && habitHistory[index - 1].completed) {
          streak++;
        }
        return streak;
      }, 0);

      const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

      stats.push({
        habitId: habit._id,
        habitName: habit.name,
        completionRate,
        streak,
        totalDays,
        completedDays,
      });
    }

    res.status(200).json({ status: 'ok', stats });
  } catch (error) {
    res.status(500).send({ status: 'error', message: 'Error fetching habit stats', error: error.message });
  }
};

module.exports = { createHabit, getHabits, trackHabitCompletion, getHabitStats };
