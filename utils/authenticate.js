/**
 * Utility functions for authentication related functionalities
 */

/**
 * Imports
 */

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET; // Make sure JWT_SECRET is defined in your environment variables

/**
 * Utility functions for authentication related functionalities
 */

/**
 * Decorator function for authenticated routes
 */

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

/**
 * Route to authenticate status enums for tasks
 */

const TASK_STATUS = {
  TODO: 0,
  IN_PROGRESS: 1,
  DONE: 2,
};

module.exports = { TASK_STATUS, authenticateJWT };
