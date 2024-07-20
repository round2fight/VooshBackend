require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");

const cors = require("cors");
const express = require("express");
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
const db = require("./models"); // Adjust the path as needed

const JWT_SECRET = "your_jwt_secret_key";

// Register endpoint
app.post("/sign-up", async (req, res) => {
  const { name, email, username, password } = req.body;
  const status = 0;

  if (!name || !email || !username || !password) {
    return res.status(400).send("Name, username, and password are required");
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await db.User.create({
      name: name,
      email: email,
      username: username,
      password: hashedPassword,
      // uuid: Sequelize.UUIDV4(),
    });
    res.status(201).send("User registered");
  } catch (error) {
    console.log(error);
    res.status(400).send("Error registering user");
  }
});

// Login endpoint
app.post("/signin/email", async (req, res) => {
  console.log("hit");
  const { email, password } = req.body;

  try {
    const user = await db.User.findOne({ where: { email } });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { uuid: user.uuid, name: user.name, username: user.username },
        JWT_SECRET,
        { expiresIn: "5h" }
      );
      res.json({ token: token, username: user.username });
    } else {
      res.status(401).send("Invalid credentials");
    }
  } catch (error) {
    res.status(500).send("Error signing in");
  }
});

// Middleware to protect routes
const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// Example protected route
app.get("/protected", authenticateJWT, async (req, res) => {
  const user = await db.User.findOne({ where: { uuid: req.user.uuid } });
  if (user) {
    res.json(user);
  } else {
    res.status(404).send("User not found");
  }
});
// ------------------------------------------------------------------
// ENUM ROUTE
// ------------------------------------------------------------------
const TASK_STATUS = {
  TODO: 0,
  IN_PROGRESS: 1,
  DONE: 2,
};

app.get("/enums", authenticateJWT, async (req, res) => {
  try {
    res.status(200).json(TASK_STATUS);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// ------------------------------------------------------------------
// TASK ROUTES
// ------------------------------------------------------------------

// Get all Tasks
app.get("/task", authenticateJWT, async (req, res) => {
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

// Get task
app.get("/task/:taskUUID", authenticateJWT, async (req, res) => {
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

// Create Task
app.post("/task/:userUUID", authenticateJWT, async (req, res) => {
  try {
    // Extract userUUID from request parameters
    const { userUUID } = req.params;

    const { title, description, dueDate, status } = req.body;

    // Validate input
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Validate status
    if (status !== undefined && !Object.values(TASK_STATUS).includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Find the user by UUID
    const user = await db.User.findOne({
      where: { uuid: userUUID }, // Assuming UUID is stored in the 'uuid' column
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.user.uuid !== userUUID) {
      return res.status(404).json({ message: "Insufficient rights" });
    }

    // Create the task
    const task = await db.Task.create({
      title,
      description,
      dueDate,
      status,
      user_id: user.id, // Associate the task with the user
    });

    // Send the tasks as a response
    res.status(201).json(task);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update Task
app.put("/task/:taskUUID", authenticateJWT, async (req, res) => {
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

    // Find the user by UUID
    const task = await db.Task.findOne({
      where: { uuid: taskUUID }, // Assuming UUID is stored in the 'uuid' column
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Validate status
    if (status !== undefined && !Object.values(TASK_STATUS).includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Update the task with the provided details
    if (title) task.title = title;
    if (description) task.description = description;
    if (dueDate) task.dueDate = dueDate;
    if (status) task.status = status;

    // Save the updated task
    await task.save();

    // Send the tasks as a response
    res.status(200).json(task);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete Task
app.delete("/task/:taskUUID", authenticateJWT, async (req, res) => {
  try {
    const { taskUUID } = req.params;

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
app.get("/api/auth/verify-token", (req, res) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authorization.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.status(200).json({ user: decoded });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
