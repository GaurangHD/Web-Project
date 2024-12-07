const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Middleware: Validate pagination query parameters
const validatePagination = (req, res, next) => {
  const { page = 1, perPage = 5 } = req.query;
  if (isNaN(page) || isNaN(perPage) || page <= 0 || perPage <= 0) {
    return res.status(400).json({ message: "Page and perPage must be positive numbers" });
  }
  next();
};

// Middleware: Sanitize inputs (example with a mock function)
const sanitizeInput = (input) => {
  // Replace with a proper sanitization library (e.g., validator.js)
  return input ? String(input).trim() : input;
};

// POST: Add a new AirBnB
router.post('/api/AirBnBs', async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeInput(name),
      price: sanitizeInput(price),
      ...req.body,
    };

    const airbnb = await db.addNewAirBnB(sanitizedData);
    res.status(201).json(airbnb);
  } catch (err) {
    res.status(500).json({ message: `Error creating AirBnB: ${err.message}` });
  }
});

// GET: List AirBnBs with pagination, filtering by minimum_nights and location
router.get('/api/AirBnBs', validatePagination, async (req, res) => {
  const { page = 1, perPage = 5, minimum_nights, location } = req.query;

  try {
    const airbnbs = await db.getAllAirBnBs(
      parseInt(page),
      parseInt(perPage),
      sanitizeInput(minimum_nights),
      sanitizeInput(location)
    );
    res.status(200).json(airbnbs);
  } catch (err) {
    res.status(500).json({ message: `Error fetching AirBnBs: ${err.message}` });
  }
});

// GET: Get an AirBnB by ID
router.get('/api/AirBnBs/:id', async (req, res) => {
  try {
    const airbnb = await db.getAirBnBById(sanitizeInput(req.params.id));
    if (!airbnb) {
      return res.status(404).json({ message: "AirBnB not found" });
    }
    res.status(200).json(airbnb);
  } catch (err) {
    res.status(500).json({ message: `Error fetching AirBnB: ${err.message}` });
  }
});

// PUT: Update an AirBnB by ID
router.put('/api/AirBnBs/:id', async (req, res) => {
  try {
    const updatedData = {
      ...req.body,
      name: sanitizeInput(req.body.name),
      price: sanitizeInput(req.body.price),
    };
    const updatedAirBnB = await db.updateAirBnBById(updatedData, sanitizeInput(req.params.id));
    if (!updatedAirBnB) {
      return res.status(404).json({ message: "AirBnB not found" });
    }
    res.status(200).json(updatedAirBnB);
  } catch (err) {
    res.status(500).json({ message: `Error updating AirBnB: ${err.message}` });
  }
});

// DELETE: Delete an AirBnB by ID
router.delete('/api/AirBnBs/:id', async (req, res) => {
  try {
    const deletedAirBnB = await db.deleteAirBnBById(sanitizeInput(req.params.id));
    if (!deletedAirBnB) {
      return res.status(404).json({ message: "AirBnB not found" });
    }
    res.status(200).json({ message: "AirBnB deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: `Error deleting AirBnB: ${err.message}` });
  }
});

// Show search form
router.get('/airbnbSearch', async (req, res) => {
  // Default values for the search form
  const { page = 1, perPage = 5, minimum_nights = '' } = req.query;
  res.render('airbnbSearch', {
    page,
    perPage,
    minimum_nights, // Make sure to include minimum_nights in the query
    query: req.query, // Pass the query object to pre-fill form fields
  });
});

// Search: Handle form submission and show filtered results
router.get('/airbnbResults', async (req, res) => {
  const { page = 1, perPage = 5, minimum_nights } = req.query;

  try {
    const { airbnbs, totalPages, currentPage } = await db.getAllAirBnBs(
      parseInt(page),
      parseInt(perPage),
      minimum_nights || undefined
    );

    res.render('airbnbResults', {
      airbnbs,
      totalPages,
      currentPage,
      perPage,
      query: { minimum_nights, page, perPage }, // Pass query to maintain form state
    });
  } catch (err) {
    res.status(500).json({ message: `Error fetching results: ${err.message}` });
  }
});

module.exports = router;
