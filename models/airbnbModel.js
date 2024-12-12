const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");


const airbnbSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  listing_url: { type: String, default: null },
  name: { type: String, default: null },
  summary: { type: String, default: null },
  space: { type: String, default: null },
  description: { type: String, default: null },
  neighborhood_overview: { type: String, default: null },
  notes: { type: String, default: null },
  transit: { type: String, default: null },
  access: { type: String, default: null },
  interaction: { type: String, default: null },
  house_rules: { type: String, default: null },
  property_type: { type: String, default: null },
  room_type: { type: String, default: null },
  bed_type: { type: String, default: null },
  minimum_nights: { type: Number, default: null },
  maximum_nights: { type: Number, default: null },
  cancellation_policy: { type: String, default: null },
  last_scraped: { type: Date, default: null },
  calendar_last_scraped: { type: Date, default: null },
  first_review: { type: Date, default: null },
  last_review: { type: Date, default: null },
  accommodates: { type: Number, default: null },
  bedrooms: { type: Number, default: null },
  beds: { type: Number, default: null },
  number_of_reviews: { type: Number, default: null },
  bathrooms: { type: Number, default: null },
  amenities: { type: [String], default: [] },
  price: { type: Number, default: null },
  security_deposit: { type: Number, default: null },
  cleaning_fee: { type: Number, default: null },
  extra_people: { type: Number, default: null },
  guests_included: { type: Number, default: null },
  images: {
    thumbnail_url: { type: String, default: null },
    medium_url: { type: String, default: null },
    picture_url: { type: String, default: null },
    xl_picture_url: { type: String, default: null }
  },
  host: {
    host_id: { type: String, default: null },
    host_name: { type: String, default: null },
    host_location: { type: String, default: null },
    host_about: { type: String, default: null },
    host_response_time: { type: String, default: null },
    host_response_rate: { type: String, default: null },
    host_is_superhost: { type: Boolean, default: null }
  },
  address: {
    street: { type: String, default: null },
    suburb: { type: String, default: null },
    government_area: { type: String, default: null },
    market: { type: String, default: null },
    country: { type: String, default: null },
    country_code: { type: String, default: null }
  },
  availability: {
    availability_30: { type: Number, default: null },
    availability_60: { type: Number, default: null },
    availability_90: { type: Number, default: null },
    availability_365: { type: Number, default: null }
  },
  review_scores: {
    review_scores_accuracy: { type: Number, default: null },
    review_scores_cleanliness: { type: Number, default: null },
    review_scores_checkin: { type: Number, default: null },
    review_scores_communication: { type: Number, default: null },
    review_scores_location: { type: Number, default: null },
    review_scores_value: { type: Number, default: null },
    review_scores_rating: { type: Number, default: null }
  },
  reviews: [{
    reviewer_id: { type: String, default: null },
    reviewer_name: { type: String, default: null },
    comments: { type: String, default: null }
  }]
});

const Airbnb = mongoose.model('Airbnb', airbnbSchema, 'listingsAndReviews'); 
module.exports = Airbnb;