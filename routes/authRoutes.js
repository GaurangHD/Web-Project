const express = require("express");
const User = require("../models/userModel");
const { body, validationResult } = require("express-validator");
const { addNewAirBnB, getAirBnBById, updateAirBnBById } = require("../controllers/airbnbController");
const router = express.Router();

// Render the registration page
router.get("/register", (req, res) => {
    res.render("register", {
        title: "Register",
    });
});

// Handle registration logic
router.post(
    "/register",
    [
        // Validation checks
        body("username").notEmpty().withMessage("Username is required"),
        body("email").isEmail().withMessage("Please provide a valid email"),
        body("password")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters"),
        body("confirmPassword")
            .custom((value, { req }) => value === req.body.password)
            .withMessage("Passwords do not match"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render("register", {
                title: "Register",
                errors: errors.array(),
            });
        }

        const { username, email, password } = req.body;

        try {
            // Check if the user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).render("register", {
                    title: "Register",
                    errors: [{ msg: "Email is already registered" }],
                });
            }

            // Create a new user
            const user = new User({ username, email, password });
            await user.save();

            res.redirect("/login"); // Redirect to login page
        } catch (err) {
            console.error(err.message);
            res.status(500).render("register", {
                title: "Register",
                errors: [{ msg: "An error occurred. Please try again later." }],
            });
        }
    }
);

// Route to handle the form submission for creating a new AirBnB listing
router.post("/add-new", addNewAirBnB);

// Render the login page
router.get("/login", (req, res) => {
    res.render("login", {
        title: "Login",
    });
});

// Handle login logic
router.post(
    "/login",
    [
        body("email").isEmail().withMessage("Please provide a valid email"),
        body("password").notEmpty().withMessage("Password is required"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render("login", {
                title: "Login",
                errors: errors.array(),
            });
        }

        const { email, password } = req.body;

        try {
            // Find user by email
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).render("login", {
                    title: "Login",
                    errors: [{ msg: "Invalid email or password" }],
                });
            }

            // Check password
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(400).render("login", {
                    title: "Login",
                    errors: [{ msg: "Invalid email or password" }],
                });
            }

            // For simplicity, redirect to home (replace with JWT or session logic)
            res.redirect("/");
        } catch (err) {
            console.error(err.message);
            res.status(500).render("login", {
                title: "Login",
                errors: [{ msg: "An error occurred. Please try again later." }],
            });
        }
    }
);

// Fetch an Airbnb by ID (API)
router.get("/api/AirBnBs/:id", getAirBnBById);

// Update an Airbnb by ID (API)
router.put("/api/AirBnBs/:id", updateAirBnBById);

// Route to handle adding a new AirBnB
router.post("/add-new", addNewAirBnB);

module.exports = router;
