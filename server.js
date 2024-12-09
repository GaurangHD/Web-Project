const express = require("express");
const hbs = require("hbs"); // Include Handlebars template engine
const cors = require("cors");
const multer = require("multer"); // Import Multer for file uploads
const airbnbRoutes = require("./routes/airbnbRoutes"); // Airbnb routes
const authRoutes = require("./routes/authRoutes"); // Authentication routes
const db = require("./config/db"); // Database logic
const path = require("path"); // For static file handling
require("dotenv").config(); // Load environment variables

const app = express();
const PORT = process.env.PORT;

// Middleware to handle static files
app.use("/public", express.static(path.join(__dirname, "public")));

// Middleware for JSON and URL encoding
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up Handlebars as the view engine
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Register partials for reusable components in Handlebars
hbs.registerPartials(path.join(__dirname, "views", "partials"));

// Custom Handlebars helpers
hbs.registerHelper("formatCurrency", (value) => `$${parseFloat(value).toFixed(2)}`);
hbs.registerHelper("joinAmenities", (amenities) => amenities?.join(", ") || "No amenities");

// Initialize the database
db.initialize(process.env.MONGO_URI)
  .then(() => console.log("Database connected successfully"))
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    process.exit(1); // Exit the process if database connection fails
  });

// Multer setup for file uploads
const upload = multer();

// Routes
app.use("/", airbnbRoutes); // Mount Airbnb routes
app.use("/", authRoutes); // Mount authentication routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("An error occurred:", err.stack);
  res.status(500).render("error", { message: "An internal server error occurred" });
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).render("404", { message: "Page not found" });
});

// Home Route
app.get("/", (req, res) => {
  res.render("home", { title: "Home" });
});

// Search Page Route
app.get("/search", (req, res) => {
  res.render("search", { title: "Search AirBnBs" });
});

// Add-New Route
app.get("/add-new", (req, res) => {
  res.render("add-new", { title: "Add New Listing" }); // Render the add-new.hbs view
});

// Handle Add-New Form Submission
app.post("/add-new", upload.single("image"), async (req, res) => {
  try {
    const imageFile = req.file;
    const formData = req.body;

    // If an image is uploaded, save it and include the path in the form data
    if (imageFile) {
      const uploadPath = path.join(__dirname, "public/uploads", imageFile.originalname);
      require("fs").writeFileSync(uploadPath, imageFile.buffer);
      formData.images = { picture_url: `/uploads/${imageFile.originalname}` };
    }

    // Call the db logic to add a new Airbnb listing
    await db.addNewAirBnB(formData);
    res.redirect("/home"); // Redirect to the page that shows all listings
  } catch (err) {
    console.error(err.message);
    res.status(500).render("error", { title: "Error", message: "Unable to create listing" });
  }
});

// Handle Edit Route (GET Request)
app.get("/edit/:id", async (req, res) => {
  try {
    const airbnbId = req.params.id;

    // Fetch the Airbnb listing details from the database by ID
    const listing = await db.getAirBnBById(airbnbId);

    if (!listing) {
      return res.status(404).render("error", { title: "Not Found", message: "Listing not found" });
    }

    // Render the edit.hbs form with the listing data
    res.render("edit", { title: "Edit Listing", listing });
  } catch (err) {
    console.error(err.message);
    res.status(500).render("error", { title: "Error", message: "Unable to fetch listing" });
  }
});

// Handle Edit Form Submission (POST Request)
app.post("/edit/:id", async (req, res) => {
  try {
    const airbnbId = req.params.id;
    const formData = req.body;

    // Update the Airbnb listing in the database
    const updatedListing = await db.updateAirBnBById(formData, airbnbId);

    // Render the results.hbs to display the updated data
    res.render("results", { title: "Listing Updated", updated: updatedListing });
  } catch (err) {
    console.error(err.message);
    res.status(500).render("error", { title: "Error", message: "Unable to update listing" });
  }
});

app.get("/delete/:id", async (req, res) => {
  const airbnbId = req.params.id;
  try {
    const listing = await db.getAirBnBById(airbnbId);
    if (!listing) {
      return res.status(404).render("error", { title: "Error", message: "AirBnB not found" });
    }
    res.render("delete", { title: "Delete Listing", id: airbnbId });
  } catch (err) {
    console.error(err.message);
    res.status(500).render("error", { title: "Error", message: "Unable to fetch listing" });
  }
});

// Login Page Route
app.get("/login", (req, res) => {
  res.render("login", { title: "Login" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
