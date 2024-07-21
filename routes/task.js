// routes/userRoutes.js
require("dotenv").config();
const express = require("express");
const db = require("../models"); // Adjust the path as needed
const router = express.Router();
const { authenticateJWT, TASK_STATUS } = require("../utils/authenticate");

// const TASK_STATUS = {
//   TODO: 0,
//   IN_PROGRESS: 1,
//   DONE: 2,
// };

// // Example protected route
// app.get("/protected", authenticateJWT, async (req, res) => {
//   const user = await db.User.findOne({ where: { uuid: req.user.uuid } });
//   if (user) {
//     res.json(user);
//   } else {
//     res.status(404).send("User not found");
//   }
// });

/**
 * Get all tasks of session user
 */
router.get("/task", authenticateJWT, async (req, res) => {
  try {
    // Extract userUUID from request parameters

    // Find the user by UUID
    const user = await db.User.findOne({
      where: { uuid: req.user.uuid }, // Assuming UUID is stored in the 'uuid' column
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find all tasks for the user
    const tasks = await db.Task.findAll({
      where: { user_id: user.id },
    });

    // Send the tasks as a response
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Get a particuular task of session user
 */
router.get("/task/:taskUUID", authenticateJWT, async (req, res) => {
  try {
    // Extract userUUID from request parameters
    const { taskUUID } = req.params;

    const task = await db.Task.findOne({
      where: { uuid: taskUUID }, // Assuming UUID is stored in the 'uuid' column
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Send the tasks as a response
    res.status(200).json({ title: task.title });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Create task for session user
 */
router.post("/task", authenticateJWT, async (req, res) => {
  try {
    // Extract userUUID from request parameters

    const { title, description, dueDate, status } = req.body;

    const sstatus = Number(status);

    // Validate input
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Validate status
    if (
      sstatus !== undefined &&
      !Object.values(TASK_STATUS).includes(sstatus)
    ) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Find the user by UUID
    const user = await db.User.findOne({
      where: { uuid: req.user.uuid }, // Assuming UUID is stored in the 'uuid' column
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create the task
    const task = await db.Task.create({
      title,
      description,
      dueDate,
      status: sstatus,
      user_id: user.id, // Associate the task with the user
    });

    // Send the tasks as a response
    res.status(200).json(task);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Update task for session user
 */
router.put("/task/:taskUUID", authenticateJWT, async (req, res) => {
  try {
    // Extract userUUID from request parameters
    const { taskUUID } = req.params;
    const { title, description, dueDate, status } = req.body;

    // Validate input
    if (!title && !description && !dueDate && !status) {
      return res.status(400).json({
        message:
          "At least one field (title, description, dueDate, status) is required to update",
      });
    }
    const sstatus = Number(status);
    console.log(status, typeof status, sstatus, typeof sstatus);

    // Find the user by UUID
    const task = await db.Task.findOne({
      where: { uuid: taskUUID }, // Assuming UUID is stored in the 'uuid' column
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Validate status
    if (
      sstatus !== undefined &&
      !Object.values(TASK_STATUS).includes(sstatus)
    ) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Update the task with the provided details
    if (title) task.title = title;
    if (description) task.description = description;
    if (dueDate) task.dueDate = dueDate;
    if (sstatus !== null) task.status = sstatus;

    // Save the updated task
    await task.save();

    // Send the tasks as a response
    res.status(200).json(task);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Delete task for session user
 */
router.delete("/task/:taskUUID", authenticateJWT, async (req, res) => {
  try {
    const { taskUUID } = req.params;

    console.log("taskUUID", taskUUID);

    // Find the task by UUID
    const task = await db.Task.findOne({
      where: { uuid: taskUUID },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Delete the task
    await task.destroy();

    // Send a success response
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// ------------------------------------------------------------------

module.exports = router;
