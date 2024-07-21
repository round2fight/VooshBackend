require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");
const express = require("express");
const app = express();
app.use(
  cors({
    origin: "https://voosh-frontend-one.vercel.app", // Replace with your Vercel domain
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
const db = require("./models"); // Adjust the path as needed

const JWT_SECRET = "your_jwt_secret_key";

// Register endpoint
app.post("/signup/email", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const status = 0;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).send("Name, username, and password are required");
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await db.User.create({
      name: firstName,
      firstname: firstName,
      email: email,
      lastname: lastName,
      password: hashedPassword,
      type: 0,
      // uuid: Sequelize.UUIDV4(),
    });
    if (user) {
      const token = jwt.sign(
        {
          uuid: user.uuid,
          firstName: user.firstName,
          name: user.firstName,
          email: user.email,
          type: user.type,
          username: user.username,
        },
        JWT_SECRET,
        { expiresIn: "5h" }
      );
      res.status(200).json({ token: token, uuid: user.uuid });
    } else {
      res.status(401).send("User creation failed");
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("Error registering user");
  }
});

// Login endpoint
app.post("/signin/email", async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("Entered USer route");
    const user = await db.User.findOne({ where: { email: email, type: 0 } });
    console.log("Entered ann database queried");
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        {
          uuid: user.uuid,
          firstName: user.firstName,
          name: user.firstName,
          email: user.email,
          type: user.type,
          username: user.username,
        },
        JWT_SECRET,
        { expiresIn: "5h" }
      );
      res.json({ token: token, uuid: user.uuid });
    } else {
      res.status(401).send("Invalid credentials");
    }
  } catch (error) {
    res.status(500).send("Error signing in");
  }
});

// Login endpoint
app.post("/signin/google", async (req, res) => {
  const { googleToken } = req.body;

  try {
    // Fetch user info from Google
    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${googleToken}`,
          Accept: "application/json",
        },
      }
    );
    console.log("google", response);

    if (response.status === 200) {
      const email = response.data.email;

      // Find user in the database
      const user = await db.User.findOne({ where: { email: email, type: 1 } });

      if (user) {
        const token = jwt.sign(
          {
            uuid: user.uuid,
            firstName: user.firstName,
            name: user.firstName,
            email: user.email,
            type: user.type,
            username: user.username,
          },
          JWT_SECRET,
          { expiresIn: "5h" }
        );
        res.json({ token: token, uuid: user.uuid });
      } else {
        res.status(401).send("User not found");
      }
    } else {
      console.error(`Google requests error -> ${response}`);
      res.status(response.status).json({
        success: false,
        message: "Failed to fetch user info from Google",
      });
    }
  } catch (error) {
    console.error(`Google requests error -> ${error}`);
    res.status(500).send("Error signing in");
  }
});

app.post("/signup/google", async (req, res) => {
  const { googleToken } = req.body;

  try {
    // Fetch user info from Google
    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${googleToken}`,
          Accept: "application/json",
        },
      }
    );
    console.log("google", response.data);

    if (response.status === 200) {
      const email = response.data.email;
      const firstName = response.data.given_name;
      const lastName = response.data.family_name;
      const type = 1;

      console.log(
        response.data.email,
        response.data.given_name,
        response.data.family_name
      );

      // Find user in the database
      const existingUser = await db.User.findOne({
        where: { email: email, type: 1 },
      });

      if (existingUser) {
        res.status(401).send("User already exists");
      } else {
        try {
          const user = await db.User.create({
            name: firstName,
            email: email,
            firstname: firstName,
            lastname: lastName,
            type: type,
            // uuid: Sequelize.UUIDV4(),
          });

          if (user) {
            const token = jwt.sign(
              {
                uuid: user.uuid,
                firstName: user.firstName,
                name: user.firstName,
                email: user.email,
                type: user.type,
                username: user.username,
              },
              JWT_SECRET,
              { expiresIn: "5h" }
            );
            res.status(200).json({ token: token, uuid: user.uuid });
          } else {
            res.status(401).send("User not foundd");
          }
        } catch (error) {
          console.log(error);
          res.status(400).send("Error registering user");
        }
      }
    } else {
      console.error(`Google requests error -> ${response}`);
      res.status(response.status).json({
        success: false,
        message: "Failed to fetch user info from Google",
      });
    }
  } catch (error) {
    console.error(`Google requests error -> ${error}`);
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
app.post("/task", authenticateJWT, async (req, res) => {
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

// Delete Task
app.delete("/task/:taskUUID", authenticateJWT, async (req, res) => {
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
