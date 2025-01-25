const Habit = require('../habits');  // Import Habit model

// Create a new habit
const createHabit = async (req, res) => {
  const { name } = req.body;
  const { userEmail } = req;

  if (!name) {
    return res.status(400).json({ status: "error", message: "Habit name is required" });
  }

  try {
    const newHabit = new Habit({
      name,
      userEmail
    });

    await newHabit.save();
    res.status(201).json({ status: "ok", data: newHabit });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to create habit", error: error.message });
  }
};

// Get all habits for a user
const getHabits = async (req, res) => {
  const { userEmail } = req;

  try {
    const habits = await Habit.find({ userEmail });
    res.status(200).json({ status: "ok", data: habits });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to fetch habits", error: error.message });
  }
};

// Track habit completion (toggle completed status)
const trackHabitCompletion = async (req, res) => {
  const { habitId } = req.body;
  const { userEmail } = req;

  try {
    const habit = await Habit.findOne({ _id: habitId, userEmail });

    if (!habit) {
      return res.status(404).json({ status: "error", message: "Habit not found" });
    }

    habit.completed = !habit.completed;  // Toggle completion status
    await habit.save();

    res.status(200).json({ status: "ok", data: habit });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to track habit completion", error: error.message });
  }
};

// Get habit statistics (e.g., streaks, completion rates)
const getHabitStats = async (req, res) => {
  const { userEmail } = req;

  try {
    const habits = await Habit.find({ userEmail });
    
    // Calculate streaks or other stats here
    const totalHabits = habits.length;
    const completedHabits = habits.filter(habit => habit.completed).length;
    const completionRate = (completedHabits / totalHabits) * 100;

    res.status(200).json({
      status: "ok",
      data: {
        totalHabits,
        completedHabits,
        completionRate
      }
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to fetch habit stats", error: error.message });
  }
};

module.exports = {
  createHabit,
  getHabits,
  trackHabitCompletion,
  getHabitStats
};
