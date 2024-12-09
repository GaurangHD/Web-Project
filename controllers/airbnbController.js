const multer = require("multer");
const db = require("../config/db");

// Configure multer for file uploads
const upload = multer();

// Add a new Airbnb listing
const addNewAirBnB = [
  upload.single("image"), // Middleware to handle image upload
  async (req, res) => {
    try {
      const result = await db.addNewAirBnB(req.body, req.file); // Pass form data and file
      res.redirect("/all-data"); // Redirect to view all listings after successful creation
    } catch (err) {
      console.error(err.message);
      res.status(500).render("error", { error: `Error creating AirBnB: ${err.message}` });
    }
  },
];

// Get all AirBnBs with pagination and optional filtering
const getAllAirBnBs = async (req, res) => {
  const { page = 1, perPage = 5, minimum_nights } = req.query;

  try {
    const airbnbs = await db.getAllAirBnBs(parseInt(page), parseInt(perPage), minimum_nights);
    res.status(200).json(airbnbs);
  } catch (err) {
    res.status(500).json({ error: `Error fetching AirBnBs: ${err.message}` });
  }
};

// Fetch an Airbnb by ID
const getAirBnBById = async (req, res) => {
  try {
    const airbnb = await db.getAirBnBById(req.params.id);
    if (!airbnb) {
      return res.status(404).json({ error: "AirBnB not found" });
    }
    res.status(200).json({ airbnb });
  } catch (err) {
    res.status(500).json({ error: `Error fetching AirBnB: ${err.message}` });
  }
};

// Get fees of an Airbnb by ID
const getAirBnBFeesById = async (req, res) => {
  try {
    const airbnb = await db.getAirBnBById(req.params.id);
    if (!airbnb) {
      return res.status(404).json({ error: "AirBnB not found" });
    }
    const fees = {
      price: airbnb.price,
      cleaning_fee: airbnb.cleaning_fee,
      security_deposit: airbnb.security_deposit,
      accommodates: airbnb.accommodates,
      extra_people: airbnb.extra_people,
      guests_included: airbnb.guests_included,
      bedroom_beds: airbnb.beds,
      address: airbnb.address?.street,
    };
    res.status(200).json(fees);
  } catch (err) {
    res.status(500).json({ error: `Error fetching fees: ${err.message}` });
  }
};

// Update an Airbnb by ID
const updateAirBnBById = async (req, res) => {
  try {
    const updatedAirBnB = await db.updateAirBnBById(req.body, req.params.id);
    if (!updatedAirBnB) {
      return res.status(404).json({ error: "AirBnB not found" });
    }
    res.status(200).json({ message: "AirBnB updated successfully", airbnb: updatedAirBnB });
  } catch (err) {
    res.status(500).json({ error: `Error updating AirBnB: ${err.message}` });
  }
};  

// Delete an Airbnb by ID
const deleteAirBnBById = async (req, res) => {
  try {
    const deletedAirBnB = await db.deleteAirBnBById(req.params.id);
    if (!deletedAirBnB) {
      return res.status(404).json({ error: "AirBnB not found" });
    }
    res.status(200).json({ message: "AirBnB deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: `Error deleting AirBnB: ${err.message}` });
  }
};

module.exports = {
  addNewAirBnB, // This exports the addNewAirBnB function
  getAllAirBnBs,
  getAirBnBById,
  getAirBnBFeesById,
  updateAirBnBById,
  deleteAirBnBById,
};
