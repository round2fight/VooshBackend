/**
 * Auth Routes
 */

/**
 * Imports
 */

require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../models"); // Adjust the path as needed
const jwt = require("jsonwebtoken");
const router = express.Router();
const axios = require("axios");
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Sign up using Email
 */
router.post("/signup/email", async (req, res) => {
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

/**
 * Sign in using Email
 */
router.post("/signin/email", async (req, res) => {
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

/**
 * Sign In/Login using Email
 */
router.post("/signin/google", async (req, res) => {
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

/**
 * Sign Up using Google
 */
router.post("/signup/google", async (req, res) => {
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

/**
 * Verify token instance
 */
router.get("/api/auth/verify-token", (req, res) => {
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

module.exports = router;
