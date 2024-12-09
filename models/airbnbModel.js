const mongoose = require("mongoose");

const airbnbSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    listing_url: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    summary: { type: String, trim: true },
    property_type: { type: String, required: true, trim: true },
    room_type: { type: String, required: true, trim: true },
    minimum_nights: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    images: {
      picture_url: { type: String, required: true, trim: true },
    },
    amenities: [{ type: String, trim: true }],
    address: {
      street: { type: String, trim: true },
      country: { type: String, trim: true },
    },
    review_scores: {
      rating: { type: Number, min: 1, max: 100 },
    },
  });

const AirBnB = mongoose.model("AirBnB", airbnbSchema, "listingsAndReviews");

module.exports = AirBnB;
