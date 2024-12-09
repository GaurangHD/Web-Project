const express = require("express");
const { query, validationResult } = require("express-validator");
const router = express.Router();
const AirBnB = require("../models/airbnbModel");
const db = require("../config/db");
const {
  addNewAirBnB,
  getAirBnBFeesById,
  updateAirBnBById,
  deleteAirBnBById,
} = require("../controllers/airbnbController");

// Validation Middleware for query parameters
const validateQueryParams = (req, res, next) => {
  const { page, perPage } = req.query;
  if (page && (isNaN(page) || page <= 0)) {
    return res.status(400).json({ error: "Invalid page number. Must be a positive integer." });
  }
  if (perPage && (isNaN(perPage) || perPage <= 0)) {
    return res.status(400).json({ error: "Invalid perPage value. Must be a positive integer." });
  }
  next();
};

// Route: Home page with pagination
router.get("/", async (req, res) => {
  const { page = 1, perPage = 6 } = req.query; // Extract pagination parameters from query
  const parsedPage = parseInt(page, 10);
  const parsedPerPage = parseInt(perPage, 10);

  try {
    // Calculate total number of listings and pagination details
    const totalRecords = await AirBnB.countDocuments();
    const totalPages = Math.ceil(totalRecords / parsedPerPage);

    // Validate page and perPage values
    if (parsedPage < 1 || parsedPerPage < 1) {
      return res.status(400).render("error", {
        title: "Invalid Pagination",
        message: "Page and perPage must be positive integers.",
      });
    }

    // Fetch listings for the current page
    const airbnbs = await AirBnB.find()
      .skip((parsedPage - 1) * parsedPerPage) // Skip records for the current page
      .limit(parsedPerPage) // Limit results to perPage
      .sort({ name: 1 }); // Sort by name

    // Render the home.hbs template with data and pagination info
    res.render("home", {
      title: "All AirBnBs",
      airbnbs,
      currentPage: parsedPage,
      perPage: parsedPerPage,
      totalPages,
      totalRecords,
      hasPrevPage: parsedPage > 1,
      hasNextPage: parsedPage < totalPages,
      prevPage: parsedPage - 1,
      nextPage: parsedPage + 1,
    });
  } catch (err) {
    console.error(`Error fetching AirBnBs: ${err.message}`);
    res.status(500).render("error", {
      title: "Error",
      message: "Failed to load Airbnb listings. Please try again later.",
    });
  }
});

// Routes
router.post("/api/AirBnBs", addNewAirBnB); // Create a new AirBnB

// Route: Get AirBnBs with pagination and optional filtering
router.get(
  "/api/AirBnBs",
  [
    // Validate and sanitize query parameters
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer")
      .toInt(),
    query("perPage")
      .optional()
      .isInt({ min: 1 })
      .withMessage("PerPage must be a positive integer")
      .toInt(),
    query("minimum_nights")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Minimum nights must be a non-negative integer")
      .toInt(),
  ],
  async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Extract and sanitize query parameters
    const { page = 1, perPage = 5, minimum_nights } = req.query;

    try {
      // Fetch data from db.js
      const data = await db.getAllAirBnBs(page, perPage, minimum_nights);

      // Send the response
      res.status(200).json({
        currentPage: data.currentPage,
        perPage: data.perPage,
        totalRecords: data.totalRecords,
        totalPages: data.totalPages,
        airbnbs: data.airbnbs,
      });
    } catch (err) {
      res.status(500).json({ error: `Error fetching AirBnBs: ${err.message}` });
    }
  }
);

router.get("/api/AirBnBs/:id", async (req, res) => {
  try {
    const airbnb = await AirBnB.findOne({ _id: req.params.id }); // Search by string _id
    if (!airbnb) {
      return res.status(404).json({ error: "AirBnB not found" });
    }
    res.status(200).json(airbnb);
  } catch (err) {
    res.status(500).json({ error: `Error fetching AirBnB: ${err.message}` });
  }
});

router.get("/api/AirBnBs/fees/:id", getAirBnBFeesById); // Get fees of an AirBnB by ID
router.put("/api/AirBnBs/:id", updateAirBnBById); // Update an AirBnB by ID
router.delete("/api/AirBnBs/:id", deleteAirBnBById); // Delete an AirBnB by ID

// Route to delete an Airbnb
router.post("/delete/:id", deleteAirBnBById);

// Route: Render the search form
router.get("/search", (req, res) => {
  res.render("search", {
    title: "Search AirBnBs", // Page title
  });
});

// Route: Handle form submission and display results
router.post("/search-results", async (req, res) => {
  const { page = 1, perPage = 5, minimum_nights } = req.body; // Extract form values

  try {
    const filter = {};

    // Add filter for minimum_nights if provided
    if (minimum_nights) {
      filter.minimum_nights = { $gte: parseInt(minimum_nights) };
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * perPage;

    // Fetch paginated results
    const airbnbs = await AirBnB.find(filter)
      .skip(skip) // Skip records for the current page
      .limit(parseInt(perPage)) // Limit results to perPage
      .sort({ name: 1 }); // Sort by name (or any other field as required)

    // Count total documents for pagination
    const totalRecords = await AirBnB.countDocuments(filter);

    // Render results page
    res.render("results", {
      title: "Search Results",
      airbnbs,
      currentPage: parseInt(page),
      perPage: parseInt(perPage),
      totalRecords,
      totalPages: Math.ceil(totalRecords / perPage),
    });
  } catch (err) {
    res.status(500).json({ error: `Error fetching AirBnBs: ${err.message}` });
  }
});

module.exports = router;
