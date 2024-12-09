const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const AirBnB = require("../models/airbnbModel");

const db = {
  // Initialize MongoDB connection
  initialize: async (connectionString) => {
    try {
      await mongoose.connect(connectionString);
      console.log("MongoDB connected successfully");
    } catch (err) {
      console.error("MongoDB connection error:", err.message);
      process.exit(1); // Exit process if connection fails
    }
  },

  // Add a new AirBnB listing
  addNewAirBnB: async (data, imageFile) => {
    try {
      // Save the uploaded image to a local directory (e.g., /public/uploads)
      if (imageFile) {
        const uploadPath = path.join(__dirname, "../public/uploads", imageFile.originalname);
        fs.writeFileSync(uploadPath, imageFile.buffer); // Save file to disk
        data.images = { picture_url: `/uploads/${imageFile.originalname}` }; // Store relative path in DB
      } else {
        data.images = { picture_url: null }; // Handle no image case
      }

      const airbnb = new AirBnB(data);
      await airbnb.save();
      return airbnb; // Return the saved document
    } catch (err) {
      throw new Error(`Error adding new AirBnB: ${err.message}`);
    }
  },

  // Get all AirBnBs with pagination and optional filtering by minimum nights
  getAllAirBnBs: async (page = 1, perPage = 6, minimum_nights) => {
    try {
      const query = {};

      // Optional filter for minimum nights
      if (minimum_nights) {
        const minNights = parseInt(minimum_nights, 10);
        if (!isNaN(minNights) && minNights >= 0) {
          query.minimum_nights = { $gte: minNights };
        } else {
          throw new Error("Invalid minimum_nights value. It must be a positive number.");
        }
      }

      // Calculate pagination
      const skip = (page - 1) * perPage;
      const limit = parseInt(perPage, 10);

      if (isNaN(skip) || skip < 0 || isNaN(limit) || limit <= 0) {
        throw new Error("Invalid pagination parameters. Page and perPage must be positive integers.");
      }

      // Fetch paginated results
      const airbnbs = await AirBnB.find(query)
        .skip(skip) // Skip records for the current page
        .limit(limit) // Limit the number of records per page
        .sort({ name: 1 }); // Sort by name (or any other relevant field)

      // Count total documents for pagination metadata
      const totalRecords = await AirBnB.countDocuments(query);

      return {
        airbnbs,
        totalRecords,
        totalPages: Math.ceil(totalRecords / perPage),
        currentPage: page,
        perPage,
      };
    } catch (err) {
      throw new Error(`Error fetching AirBnBs: ${err.message}`);
    }
  },

  // Fetch an AirBnB by ID
  getAirBnBById: async (id) => {
    try {
      const airbnb = await AirBnB.findById(id);
      if (!airbnb) throw new Error("AirBnB not found");
      return airbnb; // Return the fetched document
    } catch (err) {
      throw new Error(`Error fetching AirBnB: ${err.message}`);
    }
  },

  // Update an existing AirBnB by ID
  updateAirBnBById: async (data, id) => {
    try {
      const airbnb = await AirBnB.findByIdAndUpdate(id, data, { new: true });
      if (!airbnb) throw new Error("AirBnB not found");
      return airbnb; // Return the updated document
    } catch (err) {
      throw new Error(`Error updating AirBnB: ${err.message}`);
    }
  },


  // Delete an AirBnB by ID
  deleteAirBnBById: async (id) => {
    try {
      const airbnb = await AirBnB.findByIdAndDelete(id);
      if (!airbnb) throw new Error("AirBnB not found");
      return airbnb; // Return the deleted document
    } catch (err) {
      throw new Error(`Error deleting AirBnB: ${err.message}`);
    }
  },

  // Count the total number of AirBnBs with optional filters
  countAirBnBs: async (minimum_nights) => {
    const query = {};

    // Optional filter for minimum nights
    if (minimum_nights) {
      const minNights = parseInt(minimum_nights, 10);
      if (!isNaN(minNights)) {
        query.minimum_nights = { $gte: minNights };
      } else {
        throw new Error("Invalid minimum_nights value. It must be a number.");
      }
    }

    try {
      const count = await AirBnB.countDocuments(query);
      return count; // Return the count of matching documents
    } catch (err) {
      throw new Error(`Error counting AirBnBs: ${err.message}`);
    }
  },
};

module.exports = db;