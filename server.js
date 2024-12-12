require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const path = require("path");
const hbs = require("hbs");
const userRoutes = require('./routes/userRoutes');

const { connectToDB } = require("./config/db");
const airbnbRoutes = require("./routes/airbnbRoutes");

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static Files
app.use(express.static(path.join(__dirname, "public")));

// Swagger Docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Set HBS as View Engine
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Set Layouts Directory
app.set("view options", { layout: "layout/main" });

// Register HBS Partials and Helpers
hbs.registerPartials(path.join(__dirname, "views", "partial"));

hbs.registerHelper("eq", (a, b) => (a === b ? "selected" : ""));
hbs.registerHelper("joinAmenities", (amenities) => amenities.join(", "));
hbs.registerHelper("formatCurrency", (price) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price)
);
hbs.registerHelper('add', function(a, b) {
  return a + b;
});
hbs.registerHelper('subtract', function(a, b) {
  return a - b;
});

// Register the 'greater than' helper (gt)
hbs.registerHelper('gt', function(a, b) {
  return a > b ? true : false;  // Return true if a > b, otherwise false
});

// Register the 'less than' helper (lt)
hbs.registerHelper('lt', function(a, b) {
  return a < b ? true : false;  // Return true if a < b, otherwise false
});

app.use((req, res, next) => {
  // Extract the token from cookies
  const token = req.cookies['token']; // Replace 'authToken' with your token's cookie name

  res.locals.userToken = token || null; // Pass it to views, or null if not present
  next();
});

// Routes
app.use("/", airbnbRoutes);
app.use('/api/users', userRoutes);
// Connect to Database and Start Server
connectToDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
  });

module.exports = app;
