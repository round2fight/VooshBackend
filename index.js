/**
 * Declaration file for API initiation
 */

/**
 * Imports
 */

require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const authRoutes = require(`./routes/auth`);
const taskRoutes = require(`./routes/task`);
const { authenticateJWT, TASK_STATUS } = require("./utils/authenticate");
const app = express();

/**
 *Declarations
 */

const PORT = process.env.PORT || 3000;
app.use(
  cors({
    // origin: "https://voosh-frontend-one.vercel.app", // Replace with your Vercel domain
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("", authRoutes);
app.use("", taskRoutes);

/**
 *Common routes
 */

app.get("/enums", authenticateJWT, async (req, res) => {
  try {
    res.status(200).json(TASK_STATUS);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 *Server spectator
 */

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
